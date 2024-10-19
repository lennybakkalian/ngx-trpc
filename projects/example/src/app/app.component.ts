import {Component, inject, PLATFORM_ID} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TRPC} from './app.config';
import {AsyncPipe, isPlatformBrowser} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Subject, switchMap} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, ReactiveFormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly trpc = inject(TRPC);

  demoQuery$ = this.trpc._trpc.hello.query();

  refreshPosts$ = new Subject<void>();
  posts$ = this.refreshPosts$.pipe(switchMap(() => this.trpc._trpc.listPosts.query()));

  addPostTitle = new FormControl('random-post');

  constructor() {
    //console.log(this.trpc._trpc.message.onPostAdd.subscribe);
    /*const x = this.trpc._trpc.message.onPostAdd.subscribe(
      {},
      {
        onData: (data) => {
          console.log(data);
        }
      }
    );*/
    //console.log(this.trpc._trpc.hello.query());
    //this.trpc._trpc.hello.query().subscribe(console.log);
    //this.trpc._trpc.hello.query().then(console.log);
    if (this._isBrowser) {
      this.trpc._trpc.onPostAdd.subscribe().subscribe((d) => {
        console.log('rcv', d);
        this.refreshPosts$.next();
      });
    }
  }

  addPost() {
    this.trpc._trpc.createPost.mutate({title: this.addPostTitle.value!}).subscribe((response) => {
      console.log(response);
    });
  }
}
