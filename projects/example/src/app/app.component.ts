import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TRPC} from './app.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'example';

  trpc = inject(TRPC);
}
