import {ApplicationConfig, mergeApplicationConfig} from '@angular/core';
import {provideServerRendering} from '@angular/platform-server';
import {appConfig} from './app.config';
import {provideServerRoutesConfig, RenderMode} from '@angular/ssr';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRoutesConfig([{path: '**', renderMode: RenderMode.Server}])
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
