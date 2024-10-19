## Disclaimer ⚠️

This project is a **work in progress**. Features and APIs may change as development continues. Use at your own risk, and expect frequent updates. Contributions and feedback are always welcome!


# Angular tRPC Client 🚀

A modern, type-safe client for Angular that leverages **tRPC** to seamlessly integrate with your backend. This client comes packed with first-class support for:

- **Server-Side Rendering (SSR)** 🔥
- **RxJS Integration** for reactive programming 📡

## Features ✨

- **Full Type Safety**: Enjoy end-to-end type safety for all your API calls.
- **SSR-Ready**: Optimized for Angular Universal and Server-Side Rendering (SSR).
- **Reactive Streams**: Utilize RxJS for handling API responses and WebSocket streams like a pro.
- **Subscriptions**: Native support for subscriptions using WebSockets, fully integrated with RxJS.

## Inspiration 💡

This project was inspired by the amazing work of [`@analogjs/trpc`](https://github.com/analogjs/analog/tree/main/packages/trpc). It builds upon the same principles of type-safe API communication and seamless Angular integration, with added features such as WebSocket subscriptions.


## TODOs 📝

- [ ] **Rehydration Support**: Implement state rehydration to optimize Server-Side Rendering (SSR) and client-side hydration, ensuring faster load times and reducing redundant API calls.
- [ ] Additional Unit Tests for SSR and WebSocket Subscriptions.
- [ ] Improve Error Handling and Logging.

---

## Getting Started 🚀

### Step 1: Create a Global Injection Token

First, define a global injection token using the `AppRouter` type from your tRPC backend. This will allow you to inject your tRPC client throughout your Angular app.

```typescript
export const TRPC = createTrpcInjectionToken<AppRouter>();
```

### Step 2: Add tRPC Configuration to app.config.ts
Next, provide the tRPC client and httpClient in your `app.config.ts` file.
```typescript
provideHttpClient(withFetch()),
provideTrpc(TRPC, {
  http: { url: 'http://localhost:4444/trpc' },
  ws: {
    url: 'ws://localhost:4444',
    lazy: { enabled: true, closeMs: 10_000 },
  },
})
```

### Step 3: Use Queries as RxJS Observables in Components
You can now use the TRPC injection token to call tRPC queries as RxJS observables inside your components. Here's an example of how to call the hello query.
```typescript
@Component({
  selector: 'app-demo',
  template: '{{ demoQuery$ | async | json }}',
})
export class DemoComponent {
  readonly trpc = inject(TRPC);
  
  readonly demoQuery$ = this.trpc.hello.query();
}
```
