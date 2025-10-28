import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, ButtonModule],
    template: `
      <div class="flex items-center justify-center min-h-screen overflow-hidden">
    <div class="flex flex-col items-center justify-center">
        <!-- SVG del logotipo (sin cambios) -->
        <svg width="54" height="40" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-32 shrink-0">
            <!-- contenido del SVG omitido por brevedad -->
        </svg>

        <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
            <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                <span class="text-primary font-bold text-3xl">404</span>
                <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">No encontrado</h1>
                <div class="text-surface-600 dark:text-surface-200 mb-8">El recurso solicitado no está disponible.</div>

                <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                    <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                        <i class="pi pi-fw pi-table text-2xl!"></i>
                    </span>
                    <span class="ml-6 flex flex-col">
                        <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0 block">Preguntas frecuentes</span>
                        <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Encuentra respuestas a las dudas más comunes.</span>
                    </span>
                </a>

                <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                    <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                        <i class="pi pi-fw pi-question-circle text-2xl!"></i>
                    </span>
                    <span class="ml-6 flex flex-col">
                        <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Centro de soluciones</span>
                        <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Encuentra guías y recursos de ayuda.</span>
                    </span>
                </a>

                <a routerLink="/" class="w-full flex items-center mb-8 py-8 border-surface-300 dark:border-surface-500 border-b">
                    <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                        <i class="pi pi-fw pi-unlock text-2xl!"></i>
                    </span>
                    <span class="ml-6 flex flex-col">
                        <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Administrador de permisos</span>
                        <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Gestiona el acceso y los permisos del sistema.</span>
                    </span>
                </a>

                <p-button label="Ir al panel de control" icon="pi pi-arrow-left" routerLink="/dashboard" />
            </div>
        </div>
    </div>
</div>
`
})
export class Notfound {}
