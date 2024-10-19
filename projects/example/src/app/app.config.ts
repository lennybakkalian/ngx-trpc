import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideHttpClient, withFetch} from '@angular/common/http';
import type {AppRouter} from '../trpc/router';
import {createTrpcInjectionToken, provideTrpc} from '../../../ngx-trpc/src/public-api';

export const TRPC = createTrpcInjectionToken<AppRouter>();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    provideHttpClient(withFetch()),
    provideTrpc(TRPC, {
      http: {url: 'http://localhost:4200/trpc'},
      ws: {
        url: 'ws://localhost:4201',
        lazy: {enabled: true, closeMs: 10_000}
      }
    })
  ]
};
