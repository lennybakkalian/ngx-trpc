import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div style="display:flex;align-items:center;gap:30px">
      <h1>Angular TRPC</h1>
      <a routerLink="/demo" routerLinkActive="active">Demo Page</a>
      <a routerLink="/another-page" routerLinkActive="active">Another Page</a>
    </div>
    <router-outlet />
  `
})
export class AppComponent {}
