import { Component, computed, effect, inject, input, output, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LiquidacionPostventa } from '@/pages/postventa/entities/liquidacion-postventa';
import { PostventaFormType, PostventaFormValue } from '@/pages/postventa/components/postventa-form/postventa-form.model';
import { PrimeModules } from '@/utils/PrimeModule';
import { FormControlError } from '@/utils/form-control-error/form-control-error';
import { ContrataStore } from '@/pages/contrata/store/contrata.store';

@Component({
    selector: 'app-postventa-form',
    imports: [PrimeModules, ReactiveFormsModule, FormControlError],
    templateUrl: './postventa-form.html',
    styles: ``
})
export class PostventaForm implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly contrataStore = inject(ContrataStore);

    public readonly postventaData = input.required<LiquidacionPostventa | null>();
    public readonly isLoading = input<boolean>(false);
    public readonly visible = input.required<boolean>();
    public readonly save = output<PostventaFormValue>();
    public readonly cancel = output<void>();
    public readonly visibleChange = output<boolean>();

    protected readonly formTitle = computed(() => (this.postventaData() ? 'Editar Postventa' : 'Crear Postventa'));
    protected readonly contratas = computed(() => this.contrataStore.entities());

    protected readonly postventaForm: FormGroup<PostventaFormType> = this.formBuilder.nonNullable.group({
        contrataId: this.formBuilder.nonNullable.control(null as number | null, [Validators.required]),
        fechaIngreso: this.formBuilder.nonNullable.control(null as Date | null, [Validators.required])
    });

    ngOnInit(): void {
        this.contrataStore.getAll();
    }

    constructor() {
        effect(() => {
            const currentPostventaData = this.postventaData();

            if (currentPostventaData) {
                this.postventaForm.patchValue({
                    contrataId: currentPostventaData.contrataId,
                    fechaIngreso: new Date(currentPostventaData.fechaIngreso)
                });
            }
        });
    }

    get controls() {
        return this.postventaForm.controls;
    }

    protected onSubmitForm(): void {
        if (this.postventaForm.valid) {
            this.save.emit(this.postventaForm.getRawValue());
        } else {
            this.postventaForm.markAllAsTouched();
        }
    }

    protected onCancelForm(): void {
        this.cancel.emit();
    }

    protected onDialogVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.cancel.emit();
        }
        this.visibleChange.emit(visible);
    }

    protected isInvalid(control: AbstractControl | null): boolean {
        return !!(control?.invalid && (control.touched || this.isLoading()));
    }
}
