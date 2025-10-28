import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from '../sidebar-menu-item/app.menuitem';
import { RemanufacturaStore } from '@/pages/remanufactura/stores/RemanufacturaStore';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    templateUrl: './app.menu.html'
})
export class AppMenu {
    model: MenuItem[] = [];
    remanufacturaStore = inject(RemanufacturaStore);

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
            },
            {
                label: 'Liquidación',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Remanufactura',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/remanufactura']
                    },
                    {
                        label: 'Recupero',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/recupero']
                    }
                ]
            },

            {
                label: 'Mantenimiento',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Producto Descontinuado',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/pages/producto-descontinuado']
                    },
                    {
                        label: 'Contrata',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/contrata']
                    },
                    {
                        label: 'Precio Zona',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/precio-zona']
                    },
                                        {
                        label: 'Partidas',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/partida']
                    }
                ]
            },
            {
                label: 'Seguridad',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Usuario',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/usuario']
                    },
                    {
                        label: 'Roles',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/rol']
                    }
                ]
            }
            /*
            {
                label: 'Hierarchy',
                items: [
                    {
                        label: 'Submenu 1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 1.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },*/
        ];
    }
}
