import { Routes } from '@angular/router';
import { UsuarioListComponent } from './components/list/usuario-list.component';


export const USUARIO_ROUTES: Routes = [
    {
        path: '',
        component: UsuarioListComponent,
    },
    /*{
        path: ':id',
        component: RemanufacturaDetailComponent
    }*/
];
