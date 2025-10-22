import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeModules } from '@/utils/PrimeModule';
import { CommonModule } from '@angular/common';
import { RolStore } from '@/pages/rol/stores/RolStore';
import { DTOUpdateRol } from '../../entities/DTOUpdateRol';

@Component({
    selector: 'app-rol-edit',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, FormsModule, CommonModule],
    templateUrl: './rol-edit.component.html',
    styleUrl: './rol-edit.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolEditComponent {
    rolStore = inject(RolStore);
    fb = inject(FormBuilder);

    updateForm = this.fb.group({
        id: new FormControl<number>({ value: 0, disabled: true }, { validators: [Validators.min(1)], nonNullable: true }),
        descripcion: new FormControl<string>('', [Validators.required]),
        estado: new FormControl<boolean>(false, [Validators.required])
    });
    stateOptions = signal<any[]>([
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]);

    hasLoaded = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);

    constructor() {
        effect(() => {
            if (this.rolStore.isOpenEdit() && !this.hasLoaded()) {
                this.loadEditData();
                this.hasLoaded.set(true);
            }
        });
    }

    loadEditData() {
        const usuario = this.rolStore.entityEdit();
        if (usuario) {
            this.updateForm.patchValue({
                ...usuario
            });
            this.hasLoaded.set(true);
        }
    }
    resetFormData() {
        this.updateForm.reset({
            id: 0,
            descripcion: '',
            estado: false
        });
    }

    handleCloseModal() {
        this.rolStore.closeModalEdit();
        this.resetFormData();
        this.hasLoaded.set(false);
    }

    isInvalid(controlName: string) {
        const control = this.updateForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }

    handleSubmit() {
        this.updateForm.markAllAsTouched();

        if (this.updateForm.valid) {
            const newRemanufactura = this.updateForm.getRawValue();
            this.rolStore.update(newRemanufactura as DTOUpdateRol);
        }
        /*Prevencion de errores visuales*/
        this.updateForm.markAsPristine();
        this.updateForm.markAsUntouched();
    }
}
