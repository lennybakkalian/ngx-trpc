import {CanActivateFn} from '@angular/router';
import {inject} from '@angular/core';
import {TRPC} from '../app.config';

export const demoAuthGuard: CanActivateFn = () => {
  return inject(TRPC).login.query();
};
