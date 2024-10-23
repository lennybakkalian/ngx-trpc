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
- [Example Implementation](https://github.com/lennybakkalian/ngx-trpc/tree/main/projects/example)

## Inspiration 💡

This project was inspired by the amazing work of [`Dafnik/ngx-trpc`](https://github.com/Dafnik/ngx-trpc) and [`@analogjs/trpc`](https://github.com/analogjs/analog/tree/main/packages/trpc). It builds upon the same principles of type-safe API communication and seamless Angular integration, with added features such as WebSocket subscriptions.

## Disclaimer ⚠️

Since the REQUEST token is [reintroduced](https://github.com/angular/angular-cli/pull/28463) in v19, this library is compatible only with that version.

This project is a **work in progress**. Features and APIs may change as development continues. Use at your own risk, and expect frequent updates. Contributions and feedback are always welcome!

---

## Getting Started 🚀

To start using the Angular tRPC Client in your project, install it via npm:

```bash
npm i ngx-trpc
```

### Step 1: Create a Global Injection Token

First, define a global injection token using the `AppRouter` type from your tRPC backend. This will allow you to inject your tRPC client throughout your Angular app.

```typescript
import { createTrpcInjectionToken } from 'ngx-trpc';

export const TRPC = createTrpcInjectionToken<AppRouter>();
```

### Step 2: Add tRPC Configuration to app.config.ts
Next, provide the tRPC client and httpClient in your `app.config.ts` file. ([example](./projects/example/src/app/app.config.ts))
```typescript
import { provideTrpc } from 'ngx-trpc';

provideHttpClient(withFetch())
provideTrpc(TRPC, { options })
```

### Step 3: Use Queries as RxJS Observables in Components
You can now use the TRPC injection token to call tRPC queries as RxJS observables inside your components. Here's an example of how to call the hello query.
```typescript
import { TRPC } from '../path/to/injection-token';

@Component({
  selector: 'app-demo',
  template: '{{ demoQuery$ | async | json }}',
})
export class DemoComponent {
  readonly trpc = inject(TRPC);
  
  readonly demoQuery$ = this.trpc.hello.query();
}
```

## TODOs 📝

- [ ] Additional Unit Tests for SSR and WebSocket Subscriptions.
- [ ] Improve Error Handling and Logging.
- [ ] Handle subscriptions server-side. Currently, subscriptions are only supported client-side.
