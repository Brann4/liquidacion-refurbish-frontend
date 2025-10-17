import { Routes } from '@angular/router';
import { RemanufacturaListComponent } from './remanufactura/components/list/remanufactura-list.component';
import { RemanufacturaDetailComponent } from './remanufactura/components/detail/remanufactura-detail.component';

export const PAGES_ROUTES: Routes =  [
    { path: 'remanufactura', loadChildren: () => import('./remanufactura/remanufactura.routes').then(m => m.REMANUFACTURA_ROUTES)},
    { path: '**', redirectTo: '/notfound' }
];
