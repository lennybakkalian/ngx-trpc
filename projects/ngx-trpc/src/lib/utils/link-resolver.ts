import {IObject, merge} from '../libs/ts-deepmerge';

export function getPlatformConfig<A extends IObject, B extends IObject | undefined>(
  isServer: boolean,
  config: A,
  serverConfig: B
) {
  if (!serverConfig) return config;
  return isServer ? merge(config, serverConfig) : config;
}
