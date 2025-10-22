import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-permiso-list',
  standalone: true,
  imports: [PrimeModules],
  templateUrl: './permiso-list.component.html',
  styleUrl: './permiso-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermisoListComponent { }
