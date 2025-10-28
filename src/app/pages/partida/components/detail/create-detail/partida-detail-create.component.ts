import { DTOPartida } from '@/pages/partida/entities/partida/DTOPartida';
import { DTOCreatePartidaItem } from '@/pages/partida/entities/partidaItem/DTOCreatePartidaItem';
import { PartidaDetalleStore } from '@/pages/partida/stores/PartidaDetalleStore';
import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'partida-detail-create',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './partida-detail-create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartidaDetailCreate {
    partidaDetalleEntity = input.required<DTOPartida | null>();
    partidaDetalleStore = inject(PartidaDetalleStore);
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);

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

    createDetailForm = this.fb.group({
        partidaId: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
        descripcion: new FormControl<string>('', [Validators.required, Validators.maxLength(250)]),
        precioItem: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        unidadItem: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
        estado: new FormControl<boolean>(false, [Validators.required]),
        usuarioCreacion: new FormControl<number>(1, [Validators.required]),
        fechaCreacion: new FormControl<Date | null>(null, [Validators.required])
    });

    resetFormData() {
        this.createDetailForm.reset({
            partidaId: 0,
            descripcion: '',
            precioItem: 0,
            unidadItem: 0,
            estado: false,
            fechaCreacion: null,
            usuarioCreacion: 1
        });
    }

    isInvalid(controlName: string) {
        const control = this.createDetailForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }

    handleCloseModal() {
        this.partidaDetalleStore.closeModalCreate();
        this.resetFormData();
    }

    handleSubmit() {
        this.createDetailForm.markAllAsTouched();

        this.createDetailForm.patchValue({
            partidaId: this.partidaDetalleEntity()?.id,
            fechaCreacion: new Date(),
            precioItem: this.partidaDetalleEntity()?.precioGeneral,
            unidadItem: this.partidaDetalleEntity()?.unidadGeneral
        });

        if (this.createDetailForm.valid) {
            const newItem = this.createDetailForm.getRawValue();
            this.partidaDetalleStore.create(newItem as DTOCreatePartidaItem);
            this.resetFormData();
        }
        /*Prevencion de errores visuales*/
        this.createDetailForm.markAsPristine();
        this.createDetailForm.markAsUntouched();
    }
}
