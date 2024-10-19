import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-another-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './another-page.component.html'
})
export class AnotherPageComponent {}
