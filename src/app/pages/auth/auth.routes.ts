import { Routes } from '@angular/router';
import { Login } from './login/components/login.component';
import { Access } from './access/access';
import { Error } from './error/error';

export const AUTH_ROUTES: Routes = [
    { path: '', component: Login },
    { path: 'access', component: Access },
    { path: 'error', component: Error }
];
