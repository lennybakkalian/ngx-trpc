import {Component, inject, PLATFORM_ID} from '@angular/core';
import {AsyncPipe, isPlatformBrowser, JsonPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TRPC} from '../app.config';
import {map, of, Subject, switchMap} from 'rxjs';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, JsonPipe],
  templateUrl: './demo-page.component.html'
})
export class DemoPageComponent {
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly trpc = inject(TRPC);

  demoQuery$ = this.trpc._trpc.hello.query();

  refreshPosts$ = new Subject<void>();
  posts$ = this.refreshPosts$.pipe(switchMap(() => this.trpc._trpc.listPosts.query()));

  addPostTitle = new FormControl('random-post');

  events$ = !this._isBrowser
    ? of([])
    : this.trpc._trpc.onPostAdd.subscribe().pipe(map(console.log));

  addPost() {
    this.trpc._trpc.createPost.mutate({title: this.addPostTitle.value!}).subscribe((response) => {
      console.log(response);
    });
  }
}
