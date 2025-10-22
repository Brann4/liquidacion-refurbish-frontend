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
                        label: 'Producto Descontinuado',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['pages/producto-descontinuado']
                    },
                    {
                        label: 'Remanufactura',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/remanufactura']
                    },
                    {
                        label: 'Post Venta',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/postventa']
                    }
                ]
            },

            {
                label: 'Mantenimiento',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Usuario',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/usuario']
                    },
                    {
                        label: 'Roles',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/rol']
                    },
                    {
                        label: 'Contrata',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/contrata']
                    }
                    /*  {
                        label: 'Post Venta',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['pages/postventa']
                    }*/
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
