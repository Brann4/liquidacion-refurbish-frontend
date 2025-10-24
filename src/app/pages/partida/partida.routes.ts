import { Routes } from '@angular/router';

export const PARTIDA_ROUTES: Routes = [
    {
        path: '',
        component: RemanufacturaListComponent
    },
    {
        path: ':id',
        component: RemanufacturaDetailComponent
    }
];
