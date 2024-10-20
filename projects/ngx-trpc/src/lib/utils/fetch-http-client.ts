import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {REQUEST} from '@angular/ssr';

interface FetchImpl {
  fetch: typeof fetch;
}

@Injectable({providedIn: 'root'})
export class FetchHttpClient implements FetchImpl {
  private _http = inject(HttpClient);
  private _request = inject(REQUEST, {optional: true});

  constructor() {
    console.log('init', this._http, this._request);
  }

  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    console.log(input, this._request);
    return fetch(input, init);
  }
}
