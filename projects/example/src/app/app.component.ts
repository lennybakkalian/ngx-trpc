import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TRPC} from './app.config';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly trpc = inject(TRPC);

  demoQuery$ = this.trpc._trpc.hello.query();

  constructor() {
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
  }
}
