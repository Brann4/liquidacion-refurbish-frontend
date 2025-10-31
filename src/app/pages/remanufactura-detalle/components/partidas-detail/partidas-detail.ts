import { PartidaStore } from '@/pages/partida/stores/PartidaStore';
import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'partidas-detail',
  standalone: true,
  imports: [PrimeModules, ReactiveFormsModule],
  templateUrl: './partidas-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartidasDetail {

    partidaStore = inject(PartidaStore)



}
