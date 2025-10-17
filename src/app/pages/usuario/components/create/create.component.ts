import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [],
  template: `<p>create works!</p>`,
  styleUrl: './create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent { }
