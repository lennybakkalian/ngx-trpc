import {Routes} from '@angular/router';
import {DemoPageComponent} from './demo-page/demo-page.component';
import {AnotherPageComponent} from './another-page/another-page.component';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'demo'},
  {
    path: 'demo',
    component: DemoPageComponent
  },
  {
    path: 'another-page',
    component: AnotherPageComponent
  }
];
