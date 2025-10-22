import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { PrimeModules } from '@/utils/PrimeModule';

@Component({
    selector: 'app-form-control-error',
    imports: [PrimeModules],
    template: ` <p-message severity="error" variant="simple" size="small">{{ errorMessage }}</p-message> `,
    styles: ``
})
export class FormControlError {
    @Input({ required: true }) control!: AbstractControl;
    @Input() controlName: string = 'Este campo';

    get errorMessage(): string {
        if (!this.control?.errors) {
            return '';
        }

        const errors = this.control.errors;

        const errorMessages: { [key: string]: () => string } = {
            required: () => `${this.controlName} es obligatorio.`,
            email: () => 'Por favor, introduce un formato de correo válido.',
            minlength: () => `${this.controlName} debe tener al menos ${errors['minlength'].requiredLength} caracteres.`,
            maxlength: () => `${this.controlName} no puede tener más de ${errors['maxlength'].requiredLength} caracteres.`,
            pattern: () => `El formato de ${this.controlName.toLowerCase()} no es válido.`,
            mustMatch: () => 'Los campos no coinciden.'
        };

        const errorKey = Object.keys(errorMessages).find((key) => errors[key]);

        return errorKey ? errorMessages[errorKey]() : `El valor de ${this.controlName.toLowerCase()} no es válido.`;
    }
}
