import { Routes } from '@angular/router';
import { PartidaListComponent } from './components/list/partida-list.component';
import { PartidaDetailComponent } from './components/detail/partida-detail.component';

export const PARTIDA_ROUTES: Routes = [
    {
        path: '',
        component: PartidaListComponent
    },
    {
        path: ':id',
        component: PartidaDetailComponent
    }
];
