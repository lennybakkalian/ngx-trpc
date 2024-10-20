import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {REQUEST} from '@angular/ssr';
import {firstValueFrom} from 'rxjs';
import {TRPC_CONFIG} from '../trpc.config';

interface FetchImpl {
  fetch: typeof fetch;
}

@Injectable({providedIn: 'root'})
export class FetchHttpClient implements FetchImpl {
  private _http = inject(HttpClient);
  private _request = inject(REQUEST, {optional: true});
  private _trpcConfig = inject(TRPC_CONFIG);

  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input != 'string') {
      // TRPC only uses a url, but this could be changed later. todo: improve this
      throw new Error('fetch input must be a string');
    }

    const url = input;
    const method = init?.method || 'GET';
    let headers = new HttpHeaders(init?.headers as {[header: string]: string});

    if (this._request) {
      this._request.headers.forEach((value, key) => {
        headers = headers.set(key, value);
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
    return new Response(res.body as Blob, {
      status: res.status,
      statusText: res.statusText,
      headers: this._convertHeaders(res.headers)
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
