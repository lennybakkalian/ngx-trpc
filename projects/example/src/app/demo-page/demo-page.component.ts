import {Component, inject} from '@angular/core';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TRPC} from '../app.config';
import {scan, startWith, Subject, switchMap} from 'rxjs';

@Component({
    selector: 'app-demo-page',
    imports: [AsyncPipe, ReactiveFormsModule, JsonPipe],
    templateUrl: './demo-page.component.html'
})
export class DemoPageComponent {
  readonly trpc = inject(TRPC);

  demoQuery$ = this.trpc.hello.query();

  refreshPosts$ = new Subject<void>();
  posts$ = this.refreshPosts$.pipe(
    startWith(null),
    switchMap(() => this.trpc.listPosts.query())
  );

  addPostTitle = new FormControl('random-post');

  events$ = this.trpc.onPostAdd
    .subscribe()
    .pipe(scan((acc, event) => [...acc, event], [] as any[]));

  addPost() {
    this.trpc.createPost
      .mutate({title: this.addPostTitle.value!})
      .subscribe((mutation_response) => {
        this.refreshPosts$.next();
        console.log({mutation_response});
      });
  }
}
