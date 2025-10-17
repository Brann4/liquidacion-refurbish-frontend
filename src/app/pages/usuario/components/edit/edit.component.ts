import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [],
  template: `<p>edit works!</p>`,
  styleUrl: './edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent { }
