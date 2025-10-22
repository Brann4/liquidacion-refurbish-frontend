import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
    { path: 'remanufactura', loadChildren: () => import('./remanufactura/remanufactura.routes').then((m) => m.REMANUFACTURA_ROUTES) },
    { path: 'usuario', loadChildren: () => import('./usuario/usuario.routes').then((m) => m.USUARIO_ROUTES) },
    { path: 'rol', loadChildren: () => import('./rol/rol.routes').then((m) => m.ROL_ROUTES) },
    { path: 'permiso', loadChildren: () => import('./permiso/permiso.routes').then((m) => m.PERMISO_ROUTES) },
    { path: '**', redirectTo: '/notfound' }
];
