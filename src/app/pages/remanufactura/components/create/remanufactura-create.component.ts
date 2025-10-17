import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RemanufacturaStore } from '../../stores/RemanufacturaStore';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { DTOCreateLiquidacionRemanufactura } from '../../entities/remanufactura/DTOCreateLiquidacionRemanufactura';

@Component({
    selector: 'app-remanufactura-create',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './remanufactura-create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemanufacturaCreateComponent {
    remanufacturaStore = inject(RemanufacturaStore);
    fb = inject(FormBuilder);

    createForm = this.fb.group({
        nombreLiquidacion: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
        fechaIngreso: new FormControl<string>('', [Validators.required]),
        estado: new FormControl<number>(Estado.Inactivo, [Validators.required]),
        usuarioId: new FormControl<number>(1)
    });

    stateOptions = signal<any[]>([
        { label: 'Activo', value: Estado.Activo },
        { label: 'Inactivo', value: Estado.Inactivo }
    ]);

    isSubmitting = signal<boolean>(false);

    resetFormData() {
        this.createForm.reset({
            nombreLiquidacion: '',
            fechaIngreso: null,
            estado: Estado.Inactivo,
            usuarioId: 1
        });
    }

    isInvalid(controlName: string) {
        const control = this.createForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }

    handleCloseModal() {
        this.remanufacturaStore.closeModalCreate();
        this.resetFormData();
    }
    handleSubmit() {
        this.createForm.markAllAsTouched();
        if (this.createForm.valid) {
            const newRemanufactura = this.createForm.getRawValue();
            this.remanufacturaStore.create(newRemanufactura as DTOCreateLiquidacionRemanufactura);
            this.resetFormData();
        }
        /*Prevencion de errores visuales*/
        this.createForm.markAsPristine();
        this.createForm.markAsUntouched();
    }
}
