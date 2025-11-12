import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
    get(key: string): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return sessionStorage.getItem(key);
        }
        return null;
    }

    set(key: string, value: string): void {
        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(key, value);
        }
    }

    remove(key: string): void {
        console.log('[TokenService] Método remove() llamado para la clave:', key);

        if (isPlatformBrowser(this.platformId)) {
            console.log('[TokenService] isPlatformBrowser es TRUE. Ejecutando removeItem...');
            sessionStorage.removeItem(key);
        } else {
            // Casi seguro que verás este mensaje en tu consola
            console.error('[TokenService] isPlatformBrowser es FALSE. NO se ejecutó removeItem.');
        }
    }
}
