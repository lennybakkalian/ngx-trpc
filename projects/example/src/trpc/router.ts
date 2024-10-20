import {initTRPC, tracked} from '@trpc/server';
import {z} from 'zod';
import EventEmitter, {on} from 'events';
import {CreateExpressContextOptions, createExpressMiddleware} from '@trpc/server/adapters/express';
import {CreateWSSContextFnOptions} from '@trpc/server/adapters/ws';

interface Post {
  id: number;
  title: string;
}

export const createContext = (opts: CreateExpressContextOptions | CreateWSSContextFnOptions) => {
  const {req} = opts;

  return {};
};
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

const router = t.router;
const publicProcedure = t.procedure;

let id = 0;
const ee = new EventEmitter<{add: [Post]}>();
const db: Post[] = [{id: ++id, title: 'hello'}];

export const appRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({input}) => {
    return `hello world ${input ?? ''}`;
  }),
  createPost: t.procedure.input(z.object({title: z.string()})).mutation(({input}) => {
    const post = {id: ++id, ...input};
    db.push(post);
    ee.emit('add', post);
    return post;
  }),
  listPosts: publicProcedure.query(() => db),
  onPostAdd: publicProcedure
    .input(
      z
        .object({
          // lastEventId is the last event id that the client has received
          // On the first call, it will be whatever was passed in the initial setup
          // If the client reconnects, it will be the last event id that the client received
          lastEventId: z.string().nullish()
        })
        .optional()
    )
    .subscription(async function* (opts) {
      if (opts.input?.lastEventId) {
        // replay missed events
        const lastEventId = parseInt(opts.input.lastEventId);
        for (const post of db) {
          if (post.id > lastEventId) {
            yield tracked(String(post.id), post);
          }
        }
      } else {
        // send all posts
        for (const post of db) {
          yield tracked(String(post.id), post);
        }
      }

      for await (const [data] of on(ee, 'add', {
        // Passing the AbortSignal from the request automatically cancels the event emitter when the subscription is aborted
        signal: opts.signal
      })) {
        console.log(data);
        const post = data;
        // tracking the post id ensures the client can reconnect at any time and get the latest events this id
        yield tracked(post.id, post);
      }
    })
});

export type AppRouter = typeof appRouter;

export function createServerHandler() {
  return createExpressMiddleware({
    router: appRouter,
    createContext
  });
}
