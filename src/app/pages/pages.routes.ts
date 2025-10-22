import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
    { path: 'producto-descontinuado', loadChildren: () => import('./producto-descontinuado/producto-descontinuado.routes').then((m) => m.PRODUCTO_DESCONTINUADO_ROUTE) },
    { path: 'contrata', loadChildren: () => import('./contrata/contrata.routes').then((m) => m.CONTRATA_ROUTES) },
    { path: 'remanufactura', loadChildren: () => import('./remanufactura/remanufactura.routes').then((m) => m.REMANUFACTURA_ROUTES) },
    { path: 'usuario', loadChildren: () => import('./usuario/usuario.routes').then((m) => m.USUARIO_ROUTES) },
    { path: 'rol', loadChildren: () => import('./rol/rol.routes').then((m) => m.ROL_ROUTES) },
    { path: 'permiso', loadChildren: () => import('./permiso/permiso.routes').then((m) => m.PERMISO_ROUTES) },
    { path: '**', redirectTo: '/notfound' }
];
