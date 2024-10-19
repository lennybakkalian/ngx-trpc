import {Component, inject, PLATFORM_ID} from '@angular/core';
import {AsyncPipe, isPlatformBrowser, JsonPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TRPC} from '../app.config';
import {BehaviorSubject, of, switchMap, tap} from 'rxjs';

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

  refreshPosts$ = new BehaviorSubject<void>(undefined);
  posts$ = this.refreshPosts$.pipe(switchMap(() => this.trpc.listPosts.query()));

  addPostTitle = new FormControl('random-post');

  events$ = !this._isBrowser ? of(null) : this.trpc.onPostAdd.subscribe().pipe(tap(console.log));

  addPost() {
    this.trpc.createPost.mutate({title: this.addPostTitle.value!}).subscribe((response) => {
      this.refreshPosts$.next();
      console.log(response);
    });
  }
}
