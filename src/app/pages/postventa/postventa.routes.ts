import { Routes } from '@angular/router';
import { ViewPostventa } from '@/pages/postventa/components/view-postventa/view-postventa';
import { PostVentaDetailComponent } from '../postventa-detalle/components/postventa-view-detail/postventa-detail.component';

export const POSTVENTA_ROUTES: Routes = [
    {
        path: '',
        component: ViewPostventa
    },
    {
        path: ':id',
        component: PostVentaDetailComponent
    }
];
