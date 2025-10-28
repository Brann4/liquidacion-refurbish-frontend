import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

export interface DialogOptions {
    header: string;
    message: string;
    icon?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptSeverity?: 'danger' | 'success' | 'info' | 'warning' | 'primary';
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialog {
    private confirmationService = inject(ConfirmationService);

    confirmDelete(message: string = '¿Realmente deseas eliminar este elemento? Esta acción no se puede deshacer.'): Observable<boolean> {
        const options: DialogOptions = {
            header: 'Confirmar Eliminación',
            message: message,
            icon: 'pi pi-trash',
            acceptLabel: 'Eliminar',
            acceptSeverity: 'danger'
        };
        return this.confirmAction(options);
    }

    confirmSave(message: string = '¿Deseas guardar la información ingresada?'): Observable<boolean> {
        const options: DialogOptions = {
            header: 'Confirmar Guardado',
            message: message,
            icon: 'pi pi-save',
            acceptLabel: 'Guardar',
            acceptSeverity: 'success'
        };
        return this.confirmAction(options);
    }

    confirmUpdate(message: string = '¿Deseas aplicar los cambios?'): Observable<boolean> {
        const options: DialogOptions = {
            header: 'Confirmar Cambios',
            message: message,
            icon: 'pi pi-pencil',
            acceptLabel: 'Guardar Cambios',
            acceptSeverity: 'primary'
        };
        return this.confirmAction(options);
    }

    private confirmAction(options: DialogOptions): Observable<boolean> {
        const result$ = new Subject<boolean>();

        this.confirmationService.confirm({
            header: options.header,
            message: options.message,
            icon: options.icon || 'pi pi-exclamation-triangle',
            closeOnEscape: true,
            closable: true,
            rejectButtonStyleClass: 'p-button-text',
            acceptLabel: options.acceptLabel || 'Aceptar',
            rejectLabel: options.rejectLabel || 'Cancelar',
            acceptButtonProps: {
                severity: options.acceptSeverity || 'primary'
            },
            rejectButtonProps: {
                severity: 'secondary'
            },
            accept: () => {
                result$.next(true);
                result$.complete();
            },
            reject: () => {
                result$.next(false);
                result$.complete();
            }
        });

        return result$.asObservable();
    }
}
