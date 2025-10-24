import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { ActivatedRoute } from '@angular/router';
import { PartidaStore } from '../../stores/PartidaStore';
import { DTOCreatePartida } from '../../entities/partida/DTOCreatePartida';

@Component({
    selector: 'apartida-create',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './partida-create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemanufacturaCreateComponent {
    partidaStore = inject(PartidaStore);
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);

    createForm = this.fb.group({
        partidaNombre: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
        precioGeneral: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        unidadGeneral: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
        usuarioCreacion: new FormControl<number>(0, [Validators.required]),
        fechaCreacion: new FormControl<Date | null>(null, [Validators.required]),
    });

    stateOptions = signal<any[]>([
        { label: 'Activo', value: Estado.Activo },
        { label: 'Inactivo', value: Estado.Inactivo }
    ]);

    isSubmitting = signal<boolean>(false);

    resetFormData() {
        this.createForm.reset({
            partidaNombre: '',
            precioGeneral: 0,
            unidadGeneral: 0,
            fechaCreacion: null,
            usuarioCreacion: 0
        });
    }

    isInvalid(controlName: string) {
        const control = this.createForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }

    handleCloseModal() {
        this.partidaStore.closeModalCreate();
        this.resetFormData();
    }
    handleSubmit() {
        this.createForm.markAllAsTouched();
        if (this.createForm.valid) {
            const newRemanufactura = this.createForm.getRawValue();
            this.partidaStore.create(newRemanufactura as DTOCreatePartida, this.route);
            this.resetFormData();
        }
        /*Prevencion de errores visuales*/
        this.createForm.markAsPristine();
        this.createForm.markAsUntouched();
    }
}
