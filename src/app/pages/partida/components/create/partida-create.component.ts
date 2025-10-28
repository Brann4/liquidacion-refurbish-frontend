import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { ActivatedRoute } from '@angular/router';
import { PartidaStore } from '../../stores/PartidaStore';
import { DTOCreatePartida } from '../../entities/partida/DTOCreatePartida';

@Component({
    selector: 'partida-create',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './partida-create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartidaCreateComponent {
    partidaStore = inject(PartidaStore);
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);

    createForm = this.fb.group({
        codigo: new FormControl<string>('', [Validators.required, Validators.maxLength(20)]),
        partidaNombre: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
        precioGeneral: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        unidadGeneral: new FormControl<string>('', [Validators.required, Validators.min(1)]),
        usuarioCreacion: new FormControl<number>(1, [Validators.required]),
        estado: new FormControl<boolean>(false, [Validators.required]),
        fechaCreacion: new FormControl<Date | null>(null, [Validators.required])
    });

    stateOptions = signal<any[]>([
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]);

    unidadesMedida = signal<{ label: string; value: string }[]>([
        { label: 'MOVIMIENTO', value: 'Mov' },
        { label: 'PERSONA', value: 'Persona' },
        { label: 'DÍA', value: 'dia' },
        { label: 'HORAS', value: 'hrs' },
        { label: 'UNIDAD', value: 'und' }
    ]);

    isSubmitting = signal<boolean>(false);

    resetFormData() {
        this.createForm.reset({
            codigo: '',
            partidaNombre: '',
            precioGeneral: 0,
            unidadGeneral: '',
            fechaCreacion: null,
            estado: false,
            usuarioCreacion: 1
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
        this.createForm.patchValue({ fechaCreacion: new Date() });

        if (this.createForm.valid) {
            const newData = this.createForm.getRawValue();
            this.partidaStore.create(newData as DTOCreatePartida, this.route);
            this.resetFormData();
        } else {
            this;
        }
        /*Prevencion de errores visuales*/
        this.createForm.markAsPristine();
        this.createForm.markAsUntouched();
    }
}
