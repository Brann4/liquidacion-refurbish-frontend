import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { UsuarioStore } from '../../stores/UsuarioStore';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { PrimeModules } from '@/utils/PrimeModule';
import { CommonModule } from '@angular/common';
import { DTOUpdateUsuario } from '../../entities/DTOUpdateUsuario';
import { RolStore } from '@/pages/rol/stores/RolStore';

@Component({
    selector: 'app-usuario-edit',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, FormsModule, CommonModule],
    templateUrl: './usuario-edit.component.html',
    styleUrl: './usuario-edit.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent {
    usuarioStore = inject(UsuarioStore);
    rolStore = inject(RolStore);
    fb = inject(FormBuilder);

    updateForm = this.fb.group({
        id: new FormControl<number>({ value: 0, disabled: true }, { validators: [Validators.min(1)], nonNullable: true }),
        rolId: new FormControl<number>(0, [Validators.required]),
        nombreUsuario: new FormControl<string>('', [Validators.required]),
        nombres: new FormControl<string>('', [Validators.required]),
        apellidos: new FormControl<string>('', [Validators.required]),
        passwordHash: new FormControl<string>(''),
        estado: new FormControl<boolean>(false, [Validators.required]),
        isAdmin: new FormControl<boolean>(false, [Validators.required])
    });

    stateOptions = signal<any[]>([
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]);

    hasLoaded = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);

    constructor() {
        effect(() => {
            if (this.usuarioStore.isOpenEdit() && !this.hasLoaded()) {
                this.loadEditData();
                this.hasLoaded.set(true);
            }
        });
    }

    loadEditData() {
        const usuario = this.usuarioStore.entityEdit();
        if (usuario) {
            this.updateForm.patchValue({
                ...usuario,
                passwordHash: ''
            });
            this.hasLoaded.set(true);
        }
    }
    resetFormData() {
        this.updateForm.reset({
            id: 0,
            rolId: 1,
            nombreUsuario: '',
            nombres: '',
            apellidos: '',
            passwordHash: '',
            estado: false,
            isAdmin: false
        });
    }

    handleCloseModal() {
        this.usuarioStore.closeModalEdit();
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
            this.usuarioStore.update(newRemanufactura as DTOUpdateUsuario);
        }
        /*Prevencion de errores visuales*/
        this.updateForm.markAsPristine();
        this.updateForm.markAsUntouched();
    }
}
