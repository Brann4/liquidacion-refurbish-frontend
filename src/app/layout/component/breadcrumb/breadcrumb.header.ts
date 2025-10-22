import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

@Component({
    selector: 'breadcrumb-header',
    standalone: true,
    imports: [Breadcrumb, CommonModule, RouterModule],
    template: `<p-breadcrumb class="max-w-full" [model]="breadcrumbs" [style]="{ background: 'transparent' }" />

        <div class="flex justify-content-between items-center mx-3 mb-4 gap-4">
            <div class="flex w-full">
                <div>
                    <div class="text-2xl font-bold text-primary mb-1">{{ title }}</div>
                </div>
            </div>
        </div> `
})
export class BreadcrumbHeader {
    @Input() breadcrumbs: MenuItem[] = [];
    @Input() title: string = '';

    ngOnInit(): void {
        const homeBreadcrumb: MenuItem = { icon: 'pi pi-home', routerLink: '/system/dashboard' };

        if (!this.breadcrumbs.some((item) => item.label === 'Inicio')) {
            this.breadcrumbs = [homeBreadcrumb, ...this.breadcrumbs];
        }
    }
}
