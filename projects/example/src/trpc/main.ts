import {WebSocketServer} from 'ws';
import {applyWSSHandler} from '@trpc/server/adapters/ws';
import {appRouter, AppRouter, createContext, createServerHandler} from './router';
import express from 'express';
import * as http from 'node:http';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

app.use(cors());

const wss = new WebSocketServer({server});
applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext
});
wss.on('connection', () => console.log('ws connection'));
wss.on('error', console.error);
app.use('/trpc', createServerHandler());

server.on('error', console.error);
server.listen(4444, () => {
  console.log('trpc server listening on http://localhost:4444');
});
