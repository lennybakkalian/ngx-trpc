import {initTRPC, tracked, TRPCError} from '@trpc/server';
import {z} from 'zod';
import EventEmitter, {on} from 'events';
import * as trpcExpress from '@trpc/server/adapters/express';

const createContext = ({req, res}: trpcExpress.CreateExpressContextOptions) => {
  const getUser = () => {
    if (req.headers.authorization !== 'secret') {
      return null;
    }
    return {name: 'alex'};
  };

  return {req, res, user: getUser()};
};
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

const router = t.router;
const publicProcedure = t.procedure;

let id = 0;

const ee = new EventEmitter();
const db = {
  posts: [{id: ++id, title: 'hello'}],
  messages: [createMessage('initial message')]
};
function createMessage(text: string) {
  const msg = {
    id: ++id,
    text,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  ee.emit('newMessage', msg);
  return msg;
}

const postRouter = router({
  createPost: t.procedure.input(z.object({title: z.string()})).mutation(({input}) => {
    const post = {
      id: ++id,
      ...input
    };
    db.posts.push(post);
    return post;
  }),
  listPosts: publicProcedure.query(() => db.posts)
});

const messageRouter = router({
  addMessage: publicProcedure.input(z.string()).mutation(({input}) => {
    const msg = createMessage(input);
    db.messages.push(msg);

    return msg;
  }),
  listMessages: publicProcedure.query(() => db.messages),
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
        // [...] get the posts since the last event id and yield them
      }
      // listen for new events
      for await (const [data] of on(ee, 'add', {
        // Passing the AbortSignal from the request automatically cancels the event emitter when the subscription is aborted
        signal: opts.signal
      })) {
        const post = data as any;
        // tracking the post id ensures the client can reconnect at any time and get the latest events this id
        yield tracked(post.id, post);
      }
    })
});

const appRouter = router({
  post: postRouter,
  message: messageRouter,
  hello: publicProcedure.input(z.string().nullish()).query(({input, ctx}) => {
    return `hello ${input ?? ctx.user?.name ?? 'world'}`;
  }),
  admin: router({
    secret: publicProcedure.query(({ctx}) => {
      if (!ctx.user) throw new TRPCError({code: 'UNAUTHORIZED'});
      if (ctx.user?.name !== 'alex') throw new TRPCError({code: 'FORBIDDEN'});
      return {secret: 'sauce'};
    })
  })
});

export type AppRouter = typeof appRouter;

export function createServerHandler() {
  return trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  });
}
