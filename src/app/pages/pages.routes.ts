import { Routes } from '@angular/router';
import { RemanufacturaListComponent } from './remanufactura/components/list/remanufactura-list.component';

export const PAGES_ROUTES: Routes =  [
    { path: 'remanufactura-list', component: RemanufacturaListComponent },
    { path: '**', redirectTo: '/notfound' }
];
