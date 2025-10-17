import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { RemanufacturaStore } from '../../stores/RemanufacturaStore';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { PrimeModules } from '@/utils/PrimeModule';
import { DTOUpdateLiquidacionRemanufactura } from '../../entities/remanufactura/DTOUpdateLiquidacionRemanufactura';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-remanufactura-edit',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './remanufactura-edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers:[MessageService]
})
export class EditComponent {
    remanufacturaStore = inject(RemanufacturaStore);
    fb = inject(FormBuilder);

    updateForm = this.fb.group({
        id: new FormControl<number>({ value: 0, disabled: true }, { validators: [Validators.min(1)], nonNullable: true }),
        nombreLiquidacion: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
        fechaIngreso: new FormControl<Date | null>(null, [Validators.required]),
        estado: new FormControl<number>(Estado.Inactivo, [Validators.required]),
        usuarioId: new FormControl<number>(1)
    });

    stateOptions = signal<any[]>([
        { label: 'Activo', value: Estado.Activo },
        { label: 'Inactivo', value: Estado.Inactivo }
    ]);

    hasLoaded = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);

    constructor() {
        effect(() => {
            if (this.remanufacturaStore.isOpenEdit() && !this.hasLoaded()) {
                this.loadEditData();
                this.hasLoaded.set(true);
            }
        });
    }

    loadEditData() {
        const liquidacion = this.remanufacturaStore.entityEdit();
        if (liquidacion) {
            this.updateForm.patchValue({
                ...liquidacion,
                fechaIngreso: liquidacion.fechaIngreso ? new Date(liquidacion.fechaIngreso) : null
            });
            this.hasLoaded.set(true);
        }
    }
    resetFormData() {
        this.updateForm.reset({
            nombreLiquidacion: '',
            fechaIngreso: null,
            estado: Estado.Inactivo,
            usuarioId: 1
        });
    }

    handleCloseModal() {
        this.remanufacturaStore.closeModalEdit();
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
            this.remanufacturaStore.update(newRemanufactura as DTOUpdateLiquidacionRemanufactura);
        }
        /*Prevencion de errores visuales*/
        this.updateForm.markAsPristine();
        this.updateForm.markAsUntouched();
    }
}
