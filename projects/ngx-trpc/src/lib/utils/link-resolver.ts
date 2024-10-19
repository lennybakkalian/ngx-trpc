import {ITrpcLink} from '../trpc.config';

export function resolveTrpcLink(isServer: boolean, urls: ITrpcLink): string {
  return isServer ? urls.ssrUrl || urls.url : urls.url;
}
