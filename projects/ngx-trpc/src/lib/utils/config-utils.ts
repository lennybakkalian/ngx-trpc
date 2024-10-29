import {IObject, merge, TMerged} from '../libs/ts-deepmerge';

export function getPlatformConfig<A extends IObject, B extends IObject | undefined>(
  isServer: boolean,
  config: A,
  serverConfig: B
): A | TMerged<A | NonNullable<B>> {
  if (!serverConfig) return config;
  return isServer ? merge(config, serverConfig) : config;
}

export function normalizeWebSocketUrl(url: string) {
  if (url.startsWith('ws://') || url.startsWith('wss://')) {
    return url;
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.host;
    return protocol + host + url;
  }
}
