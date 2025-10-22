import { ToastModule } from 'primeng/toast';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { MyPreset } from './themes';
import { ConfirmationService, MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom(ToastModule),
        providePrimeNG({
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: '.app-dark'
                }
            },
            translation: {
                accept: 'Aceptar',
                reject: 'Cancelar',
                apply: 'Aplicar',
                clear: 'Limpiar',
                matchAll: 'Coincidir todo',
                matchAny: 'Coincidir cualquiera',
                addRule: 'Agregar regla',
                removeRule: 'Eliminar regla',
                dateIs: 'Es igual a',
                dateIsNot: 'No es igual a',
                dateBefore: 'Antes de',
                dateAfter: 'Después de',
                lt: 'Menor que',
                lte: 'Menor o igual que',
                gt: 'Mayor que',
                gte: 'Mayor o igual que',
                equals: 'Igual a',
                notEquals: 'Distinto de',
                contains: 'Contiene',
                notContains: 'No contiene',
                startsWith: 'Empieza con',
                endsWith: 'Termina con',
                noFilter: 'Sin filtro',
                dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
                dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
                monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
                monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
                today: 'Hoy',
                weekHeader: 'Sem',
                firstDayOfWeek: 1,
                emptyMessage: 'No se encontraron resultados',
                emptyFilterMessage: 'No se encontraron coincidencias',
                choose: 'Elegir',
                upload: 'Subir',
                cancel: 'Cancelar'
            }
        }),
        MessageService,
        ConfirmationService,
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync()
    ]
};
