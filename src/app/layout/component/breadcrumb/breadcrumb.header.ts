import { CommonModule } from '@angular/common';
import { Component, computed, input, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

@Component({
    selector: 'breadcrumb-header',
    standalone: true,
    imports: [Breadcrumb, CommonModule, RouterModule],
    template: `<p-breadcrumb class="max-w-full" [model]="localBreadcrumb()" [home]="homeBreadcrumb" [style]="{ background: 'transparent' }" />

        <div class="flex justify-content-between items-center mx-3 mb-4 gap-4">
            <div class="flex w-full">
                <div>
                    <div class="text-2xl font-bold text-primary mb-1">{{ title() }}</div>
                </div>
            </div>
        </div> `
})
export class BreadcrumbHeader {
    breadcrumbs = input.required<MenuItem[]>();
    title = input.required<string>();
    homeBreadcrumb: MenuItem = { icon: 'pi pi-home',  routerLink: '/dashboard' };

    localBreadcrumb = computed( () => {
        const current = this.breadcrumbs();
        if(current.some( (item) =>  item.label === 'Inicio')){
             return [this.homeBreadcrumb, ...current];
        }
        return current;
    });
}
