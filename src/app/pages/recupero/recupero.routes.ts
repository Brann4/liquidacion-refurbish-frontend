import { Routes } from '@angular/router';
import { ViewRecupero } from '@/pages/recupero/components/view-recupero/view-recupero';
import { ViewRecuperoDetalle } from '@/pages/recupero-detalle/components/view-recupero-detalle/view-recupero-detalle';

export const RECUPERO_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: ViewRecupero
            },
            {
                path: ':id',
                component: ViewRecuperoDetalle
            }
        ]
    }
];
