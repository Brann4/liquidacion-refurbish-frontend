import { ToastModule } from 'primeng/toast';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { MyPreset } from './themes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { configureDateFnsLocale } from '@/utils/locale.config';
import { all } from 'primelocale';

configureDateFnsLocale();

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
            translation: all.es
        }),
        MessageService,
        ConfirmationService,
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync()
    ]
};
