import { Estado } from '@/utils/Constants';
import { PrimeModules } from '@/utils/PrimeModule';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioStore } from '../../stores/UsuarioStore';
import { DTOCreateUsuario } from '../../entities/DTOCreateUsuario';
import { RolStore } from '@/pages/rol/stores/RolStore';
import { RolService } from '@/pages/rol/services/rol.service';

@Component({
    selector: 'app-usuario-create',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, CommonModule],
    templateUrl: './usuario-create.component.html',
    styleUrl: './usuario-create.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateComponent {
    usuarioStore = inject(UsuarioStore);
    rolService = inject(RolService);
    rolStore = inject(RolStore);
    fb = inject(FormBuilder);

    createForm = this.fb.group({
        nombreUsuario: new FormControl<string>('', [Validators.required]),
        nombres: new FormControl<string>('', [Validators.required]),
        apellidos: new FormControl<string>('', [Validators.required]),
        rolId: new FormControl<number | null>(null, [Validators.required]),
        passwordHash: new FormControl<string>('', [Validators.required]),
        estado: new FormControl<boolean>(false, [Validators.required]),
        isAdmin: new FormControl<boolean>(false, [Validators.required])
    });

    stateOptions = signal<any[]>([
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]);

    isSubmitting = signal<boolean>(false);
    roles = computed(() => this.rolStore.entities().filter(rol => rol.estado) )

    constructor() {
        this.loadRols();
    }

    loadRols() {
        this.rolStore.getRols(Estado.Todos);
    }

    resetFormData() {
        this.createForm.reset({
            nombreUsuario: '',
            nombres: '',
            apellidos: '',
            rolId: null,
            passwordHash: '',
            estado: false,
            isAdmin: false
        });
    }

    isInvalid(controlName: string) {
        const control = this.createForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }
    handleCloseModal() {
        this.usuarioStore.closeModalCreate();
        this.resetFormData();
    }
    handleSubmit() {
        this.createForm.markAllAsTouched();
        const newUsuario = this.createForm.getRawValue();
        if (this.createForm.valid) {
            this.usuarioStore.create(newUsuario as DTOCreateUsuario);
            this.resetFormData();
        }
        /*Prevencion de errores visuales*/
        this.createForm.markAsPristine();
        this.createForm.markAsUntouched();
    }
}
