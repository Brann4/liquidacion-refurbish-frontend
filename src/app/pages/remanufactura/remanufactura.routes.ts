import { Routes } from '@angular/router';
import { RemanufacturaListComponent } from './components/list/remanufactura-list.component';
import { RemanufacturaDetailComponent } from './components/detail/remanufactura-detail.component';

export const REMANUFACTURA_ROUTES: Routes = [
    {
        path: '',
        component: RemanufacturaListComponent
    },
    {
        path: ':id',
        component: RemanufacturaDetailComponent
    }
];
