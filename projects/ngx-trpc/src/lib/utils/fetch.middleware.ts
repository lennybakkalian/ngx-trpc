import {ITrpcConfig} from '../trpc.config';
import * as cookie from 'cookie';
import {Mutex, wrapInMutex} from '../libs/mutex.util';

export class FetchMiddleware {
  private _setCookiesCache?: string;

  private _mutex = new Mutex();

  constructor(
    private _config: ITrpcConfig,
    private _request: Request | null,
    private _response: ResponseInit | null
  ) {}

  async fetch(input: RequestInfo | URL | string, init?: RequestInit) {
    // Wrap this in mutex. Because of setCookieCache, we need to make sequential requests in SSR.
    // This should not be a problem, since we use batch calls.
    return wrapInMutex(
      async () => {
        if (typeof input != 'string') {
          throw new Error('[ngx-trpc] Only string urls are supported right now.');
        }

        if (this._request) {
          const headers: HeadersInit = {};
          this._request.headers.forEach((value: string, key: string) => {
            headers[key] = value;
          });

          if (this._setCookiesCache) {
            const cookies = cookie.parse(headers['cookie'] || '');
            const newCookies = cookie.parse(this._setCookiesCache);

            for (let key in newCookies) {
              cookies[key] = newCookies[key];
            }

            headers['cookie'] = Object.entries(cookies)
              .filter(([_, value]) => value !== undefined)
              .map(([key, value]) => cookie.serialize(key, value!))
              .join('; ');
          }

          init = {...init, headers};
        }

        const r = await fetch(input, init);
        if (this._response && this._response.headers && this._response.headers instanceof Headers) {
          for (let [key, value] of r.headers) {
            if (this._config.ssr?.forwardHeaders?.includes(key) || key === 'set-cookie') {
              this._response.headers.set(key, value);
            }

            // set the cookie in the angular request object so we can use it in sequential requests when not using batchLink
            if (key == 'set-cookie') {
              this._setCookiesCache = value;
            }
          }
        }
        return r;
      },
      this._mutex,
      this._config.ssr?.disableSequentialRequests
    );
  }
}
