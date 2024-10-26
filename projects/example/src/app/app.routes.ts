import {Routes} from '@angular/router';
import {DemoPageComponent} from './demo-page/demo-page.component';
import {AnotherPageComponent} from './another-page/another-page.component';
import {demoAuthGuard} from './demo-page/demo-auth.guard';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'demo'},
  {
    path: 'demo',
    canActivate: [demoAuthGuard],
    component: DemoPageComponent
  },
  {
    path: 'another-page',
    component: AnotherPageComponent
  }
];
