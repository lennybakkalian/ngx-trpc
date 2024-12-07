import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable, PLATFORM_ID, REQUEST, RESPONSE_INIT} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {TRPC_CONFIG} from '../trpc.config';
import {isPlatformBrowser} from '@angular/common';

interface FetchImpl {
  fetch: typeof fetch;
}

@Injectable({providedIn: 'root'})
export class FetchHttpClient implements FetchImpl {
  private _http = inject(HttpClient);
  private _request = inject(REQUEST, {optional: true});
  private _response = inject(RESPONSE_INIT, {optional: true});
  private _trpcConfig = inject(TRPC_CONFIG);
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input != 'string') {
      throw new Error('[ngx-trpc] Only string urls are supported right now.');
    }

    const url = input;
    const method = init?.method || 'GET';
    let headers = new HttpHeaders(init?.headers as {[header: string]: string});

    if (this._request) {
      this._request.headers.forEach((value: string, key: string) => {
        headers = headers.set(key, value);
      });
    }

    if (!this._isBrowser && !this._request) {
      // Angular is doing a single server-side render after starting the app. Prob a bug in Angular.
      // This will prevent an unnecessary createContext call.
      return new Response('{}', {
        status: 500,
        statusText: 'Request is not available on the server.'
      });
    }

    const res = await firstValueFrom(
      this._http.request(method, url, {
        headers,
        body: init?.body,
        observe: 'response',
        responseType: 'blob',
        withCredentials: this._trpcConfig.http.withCredentials
      })
    );
    const convertedHeaders = this._convertHeaders(res.headers);

    const forwardHeaders = this._trpcConfig.ssr?.forwardHeaders || ['set-cookie'];
    if (this._response && this._response.headers instanceof Headers) {
      const responseHeaders: Headers = this._response.headers;

      forwardHeaders.forEach((header) => {
        const value = convertedHeaders.get(header);
        if (value) {
          responseHeaders.set(header, value);
        }
      });
    }

    return new Response(res.body as Blob, {
      status: res.status,
      statusText: res.statusText,
      headers: convertedHeaders
    });
  }

  private _convertHeaders(httpHeaders: HttpHeaders): Headers {
    const headers = new Headers();
    httpHeaders.keys().forEach((key) => {
      headers.append(key, httpHeaders.get(key) as string);
    });
    return headers;
  }
}
