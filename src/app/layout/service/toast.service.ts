import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    messageService = inject(MessageService);

    constructor() {}

    success(detail: string, summary: string = 'Éxito') {
        this.messageService.add({
            key: 'global',
            severity: 'success',
            summary,
            detail,
            life: 3000
        });
    }

    error(detail: string, summary: string = 'Error') {
        this.messageService.add({
            key: 'global',
            severity: 'error',
            summary,
            detail,
            life: 4000
        });
    }

    warn(detail: string, summary: string = 'Advertencia') {
        this.messageService.add({
            severity: 'warn',
            key: 'global',
            summary,
            detail,
            life: 3500
        });
    }

    info(detail: string, summary: string = 'Información') {
        this.messageService.add({
            severity: 'info',
            key: 'global',
            summary,
            detail,
            life: 3000
        });
    }

    clear() {
        this.messageService.clear();
    }
}
