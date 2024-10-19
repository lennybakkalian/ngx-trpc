import {Component, inject} from '@angular/core';
import {TRPC} from '../app.config';
import {AsyncPipe, JsonPipe} from '@angular/common';

@Component({
  selector: 'app-another-page',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './another-page.component.html'
})
export class AnotherPageComponent {
  posts$ = inject(TRPC).listPosts.query();
}
