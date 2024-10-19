export type Maybe<TType> = TType | null | undefined;

export type UntypedClientProperties =
  | '$request'
  | 'links'
  | 'mutation'
  | 'query'
  | 'requestAsPromise'
  | 'requestId'
  | 'runtime'
  | 'subscription';

export type TRPCType = 'mutation' | 'query' | 'subscription';
