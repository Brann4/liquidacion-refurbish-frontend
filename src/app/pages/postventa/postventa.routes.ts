import { Routes } from '@angular/router';
import { ViewPostventa } from '@/pages/postventa/components/view-postventa/view-postventa';

export const POSTVENTA_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: ViewPostventa
            }
        ]
    }
];
