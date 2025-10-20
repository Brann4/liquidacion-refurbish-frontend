import { Estado } from '@/utils/Constants';
import { PrimeModules } from '@/utils/PrimeModule';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { RolStore } from '@/pages/rol/stores/RolStore';
import { DTOCreateRol } from '../../entities/DTOCreateRol';

@Component({
    selector: 'app-rol-create',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, CommonModule],
    templateUrl: './rol-create.component.html',
    styleUrl: './rol-create.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolCreateComponent {
    rolStore = inject(RolStore);
    fb = inject(FormBuilder);

    createForm = this.fb.group({
        descripcion: new FormControl<string>('', [Validators.required]),
        estado: new FormControl<boolean>(false, [Validators.required]),
        usuarioCreacion: new FormControl<number>(1)
    });

    stateOptions = signal<any[]>([
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]);

    isSubmitting = signal<boolean>(false);

    constructor() {
    }

    resetFormData() {
        this.createForm.reset({
            descripcion: '',
            estado: false,
            usuarioCreacion:1
        });
    }

    isInvalid(controlName: string) {
        const control = this.createForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }
    handleCloseModal() {
        this.rolStore.closeModalCreate();
        this.resetFormData();
    }
    handleSubmit() {
        this.createForm.markAllAsTouched();
        const newUsuario = this.createForm.getRawValue();
        if (this.createForm.valid) {
            this.rolStore.create(newUsuario as DTOCreateRol);
            this.resetFormData();
        }
        /*Prevencion de errores visuales*/
        this.createForm.markAsPristine();
        this.createForm.markAsUntouched();
    }
}
