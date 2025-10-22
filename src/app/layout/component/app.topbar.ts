import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 285.33 245.84"><defs><style>.cls-1{fill:#bf391c;}.cls-2{fill:url(#Degradado_sin_nombre_80);}.cls-3{fill:url(#Degradado_sin_nombre_118);}.cls-4{fill:url(#Degradado_sin_nombre_21);}.cls-5{fill:url(#Degradado_sin_nombre_21-2);}.cls-6{fill:url(#Degradado_sin_nombre_118-2);}.cls-7{fill:url(#Degradado_sin_nombre_80-2);}.cls-8{fill:url(#Degradado_sin_nombre_142);}</style><radialGradient id="Degradado_sin_nombre_80" cx="143.53" cy="213.78" r="36.08" gradientUnits="userSpaceOnUse"><stop offset="0.04" stop-color="#eec800"/><stop offset="0.14" stop-color="#eabc00"/><stop offset="0.33" stop-color="#df9d00"/><stop offset="0.53" stop-color="#d17600"/><stop offset="0.98" stop-color="#bf391c"/></radialGradient><radialGradient id="Degradado_sin_nombre_118" cx="34.96" cy="213.78" r="36.08" gradientUnits="userSpaceOnUse"><stop offset="0.09" stop-color="#d17600"/><stop offset="0.16" stop-color="#d58200"/><stop offset="0.29" stop-color="#e0a100"/><stop offset="0.4" stop-color="#ebc000"/><stop offset="0.47" stop-color="#eec800"/><stop offset="0.88" stop-color="#bf391c"/></radialGradient><radialGradient id="Degradado_sin_nombre_21" cx="225.87" cy="129.62" r="60.57" gradientUnits="userSpaceOnUse"><stop offset="0.04" stop-color="#eec800"/><stop offset="0.39" stop-color="#d17600"/><stop offset="0.98" stop-color="#bf391c"/></radialGradient><radialGradient id="Degradado_sin_nombre_21-2" cx="161.51" cy="-266.18" r="60.57" gradientTransform="translate(220.97 -147.05) rotate(180)" xlink:href="#Degradado_sin_nombre_21"/><radialGradient id="Degradado_sin_nombre_118-2" cx="250.37" cy="32.06" r="36.08" xlink:href="#Degradado_sin_nombre_118"/><radialGradient id="Degradado_sin_nombre_80-2" cx="143.53" cy="32.06" r="36.08" xlink:href="#Degradado_sin_nombre_80"/><linearGradient id="Degradado_sin_nombre_142" x1="107.62" y1="124.3" x2="177.54" y2="124.3" gradientUnits="userSpaceOnUse"><stop offset="0.03" stop-color="#bf391c"/><stop offset="0.5" stop-color="#ebc000"/><stop offset="0.64" stop-color="#df9a08"/><stop offset="0.96" stop-color="#bf3a1c"/><stop offset="0.97" stop-color="#bf391c"/></linearGradient></defs><title>isotipo</title><g id="Capa_2" data-name="Capa 2"><g id="logo_Link_Tek" data-name="logo Link Tek"><g id="isotipo"><ellipse id="_9" data-name="9" class="cls-1" cx="250.37" cy="213.78" rx="34.96" ry="32.06"/><ellipse id="_8" data-name="8" class="cls-2" cx="143.53" cy="213.78" rx="34.96" ry="32.06"/><ellipse id="_7" data-name="7" class="cls-3" cx="34.96" cy="213.78" rx="34.96" ry="32.06"/><ellipse id="_6" data-name="6" class="cls-4" cx="250.37" cy="124.37" rx="34.96" ry="32.06"/><ellipse id="_4" data-name="4" class="cls-5" cx="34.96" cy="124.37" rx="34.96" ry="32.06"/><ellipse id="_3" data-name="3" class="cls-6" cx="250.37" cy="32.06" rx="34.96" ry="32.06"/><ellipse id="_2" data-name="2" class="cls-7" cx="143.53" cy="32.06" rx="34.96" ry="32.06"/><ellipse id="_1" data-name="1" class="cls-1" cx="34.96" cy="32.06" rx="34.96" ry="32.06"/><ellipse id="_3-2" data-name="3" class="cls-8" cx="142.58" cy="124.3" rx="34.96" ry="32.06"/></g></g></g></svg>
                <span>Refurbish</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" (click)="handleLogout()">
                        <i class="pi pi-sign-out"></i>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    constructor(public layoutService: LayoutService) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    handleLogout() {
        console.log('Salir');
    }
}
