import { Routes } from '@angular/router';
import { RemanufacturaListComponent } from './remanufactura/components/list/remanufactura-list.component';

export const PAGES_ROUTES: Routes = [
    { path: 'producto-descontinuado', loadChildren: () => import('./producto-descontinuado/producto-descontinuado.routes').then((m) => m.PRODUCTO_DESCONTINUADO_ROUTE) },
    { path: 'remanufactura-list', component: RemanufacturaListComponent },
    { path: '**', redirectTo: '/notfound' }
];
