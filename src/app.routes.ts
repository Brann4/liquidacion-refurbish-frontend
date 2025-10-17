import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    { path: '', loadChildren: () => import('./app/pages/auth/auth.routes').then(m => m.AUTH_ROUTES) },

    {
        path: 'dashboard',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes').then(m => m.PAGES_ROUTES ) }
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
