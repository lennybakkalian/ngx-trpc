export class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise<() => void>((resolve) => {
      const release = () => {
        this.locked = false;
        const next = this.queue.shift();
        if (next) {
          next();
        }
      };

      if (!this.locked) {
        this.locked = true;
        resolve(release);
      } else {
        this.queue.push(() => {
          this.locked = true;
          resolve(release);
        });
      }
    });
  }
}

export async function wrapInMutex<T>(
  fn: () => Promise<T>,
  mutex: Mutex,
  disable?: boolean
): Promise<T> {
  if (disable) {
    return await fn();
  }
  const release = await mutex.acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}
