import {Component, inject, PLATFORM_ID} from '@angular/core';
import {AsyncPipe, isPlatformBrowser, JsonPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TRPC} from '../app.config';
import {startWith, Subject, switchMap} from 'rxjs';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, JsonPipe],
  templateUrl: './demo-page.component.html'
})
export class DemoPageComponent {
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly trpc = inject(TRPC);

  demoQuery$ = this.trpc.hello.query();

  refreshPosts$ = new Subject<void>();
  posts$ = this.refreshPosts$.pipe(
    startWith(null),
    switchMap(() => this.trpc.listPosts.query())
  );

  addPostTitle = new FormControl('random-post');

  events$ = this.trpc.onPostAdd.subscribe({lastEventId: '1'});

  addPost() {
    this.trpc.createPost.mutate({title: this.addPostTitle.value!}).subscribe((response) => {
      this.refreshPosts$.next();
      console.log({response});
    });
  }
}
