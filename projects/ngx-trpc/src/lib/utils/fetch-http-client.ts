import {HttpClient} from '@angular/common/http';
import {Provider} from '@angular/core';

interface FetchImpl {
  fetch: typeof fetch;
}

export class FetchHttpClient implements FetchImpl {
  constructor(private _http: HttpClient) {}

  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return fetch(input, init);
  }
}

export function provideCustomFetch(): Provider {
  return {
    provide: FetchHttpClient,
    useFactory: (http: HttpClient) => new FetchHttpClient(http),
    deps: [HttpClient]
  };
}
