import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule,ToastModule],
    template: `
    <p-toast position="top-center" key="global" [baseZIndex]="1000"></p-toast>
    <router-outlet></router-outlet>
    `
})
export class AppComponent {}
