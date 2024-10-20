# Angular tRPC Client 🚀

## Features
- **Full Type Safety**: Enjoy end-to-end type safety for all your API calls.
- **SSR-Ready**: Optimized for Angular Universal and Server-Side Rendering (SSR).
- **Reactive Streams**: Utilize RxJS for handling API responses and WebSocket streams like a pro.
- **Subscriptions**: Native support for subscriptions using WebSockets, fully integrated with RxJS.


## Table of Contents
- [Inspiration](#inspiration-)
- [Getting Started](#getting-started-)
- [Server Side Rendering](#server-side-rendering)
- [TODOs](#todos-)
- [Disclaimer](#disclaimer-)

## Inspiration 💡

This project was inspired by the amazing work of [`@analogjs/trpc`](https://github.com/analogjs/analog/tree/main/packages/trpc). It builds upon the same principles of type-safe API communication and seamless Angular integration, with added features such as WebSocket subscriptions.

## TODOs 📝

- [ ] Additional Unit Tests for SSR and WebSocket Subscriptions.
- [ ] Improve Error Handling and Logging.
- [ ] Handle subscriptions server-side. Currently, subscriptions are only supported client-side.

## Disclaimer ⚠️

Since the REQUEST token is [reintroduced](https://github.com/angular/angular-cli/pull/28463) in v19, this library is compatible only with that version.

This project is a **work in progress**. Features and APIs may change as development continues. Use at your own risk, and expect frequent updates. Contributions and feedback are always welcome!

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

## Server Side Rendering
You can use different link configurations for server-side. So you can directly connect to the backend.
```typescript
provideTrpc(TRPC, {
  http: {
    url: 'https://api.example.com/trpc',
    ssrUrl: 'http://backend_host:4444/trpc' // <-- Add this line. This host will be used on the server
  }
})
```
