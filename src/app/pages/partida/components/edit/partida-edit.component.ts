import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { PrimeModules } from '@/utils/PrimeModule';
import { MessageService } from 'primeng/api';
import { PartidaStore } from '../../stores/PartidaStore';
import { DTOUpdatePartida } from '../../entities/partida/DTOUpdatePartida';

@Component({
    selector: 'partida-edit',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './partida-edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})
export class PartidaEditComponent {
    partidaStore = inject(PartidaStore);
    fb = inject(FormBuilder);

    updateForm = this.fb.group({
        id: new FormControl<number>(0, { nonNullable: true }),
        codigo: new FormControl<string>('', [Validators.required, Validators.maxLength(20)]),
        partidaNombre: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
        precioGeneral: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        unidadGeneral: new FormControl<string>('', [Validators.required, Validators.min(1)]),
        estado: new FormControl<boolean>(false, [Validators.required]),
        fechaModificacion: new FormControl<Date | null>(null, [Validators.required])
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

    hasLoaded = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);

    constructor() {
        effect(() => {
            if (this.partidaStore.isOpenEdit() && !this.hasLoaded()) {
                this.loadEditData();
                this.hasLoaded.set(true);
            }
        });
    }

    loadEditData() {
        const entity = this.partidaStore.entityEdit();
        if (entity) {
            this.updateForm.patchValue({
                ...entity
            });
            this.hasLoaded.set(true);
        }
    }
    resetFormData() {
        this.updateForm.reset({
            id: 0,
            codigo: '',
            partidaNombre: '',
            precioGeneral: 0,
            unidadGeneral: '',
            estado: false,
            fechaModificacion: null
        });
    }

    handleCloseModal() {
        this.partidaStore.closeModalEdit();
        this.resetFormData();
        this.hasLoaded.set(false);
    }

    isInvalid(controlName: string) {
        const control = this.updateForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }

    handleSubmit() {
        this.updateForm.markAllAsTouched();
        this.updateForm.patchValue({ fechaModificacion: new Date() });

        if (this.updateForm.valid) {
            const newRemanufactura = this.updateForm.getRawValue();
            this.partidaStore.update(newRemanufactura as DTOUpdatePartida);
        }
        /*Prevencion de errores visuales*/
        this.updateForm.markAsPristine();
        this.updateForm.markAsUntouched();
    }
}
