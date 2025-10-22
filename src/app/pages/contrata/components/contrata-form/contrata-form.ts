import { Component, computed, effect, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { ContrataFormType, ContrataFormValue } from '@/pages/contrata/components/contrata-form/contrata-form.model';
import { PrimeModules } from '@/utils/PrimeModule';
import { FormControlError } from '@/utils/form-control-error/form-control-error';

@Component({
    selector: 'app-contrata-form',
    imports: [PrimeModules, ReactiveFormsModule, FormControlError],
    templateUrl: './contrata-form.html',
    styles: ``
})
export class ContrataForm {
    private readonly formBuilder = inject(FormBuilder);

    public readonly contrataData = input.required<Contrata | null>();
    public readonly isLoading = input<boolean>(false);
    public readonly visible = input.required<boolean>();
    public readonly save = output<ContrataFormValue>();
    public readonly cancel = output<void>();
    public readonly visibleChange = output<boolean>();

    protected readonly formTitle = computed(() => (this.contrataData() ? 'Editar Contrata' : 'Crear Contrata'));
    protected readonly isEditMode = computed(() => !!this.contrataData());

    protected readonly contrataForm: FormGroup<ContrataFormType> = this.formBuilder.nonNullable.group({
        ruc: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(11)]),
        razonSocial: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(200)])
    });

    constructor() {
        effect(() => {
            const currentContrataData = this.contrataData();

            if (currentContrataData) {
                this.contrataForm.patchValue({
                    ruc: currentContrataData.ruc,
                    razonSocial: currentContrataData.razonSocial
                });
            }
        });
    }

    get controls() {
        return this.contrataForm.controls;
    }

    protected onSubmitForm(): void {
        if (this.contrataForm.valid) {
            this.save.emit(this.contrataForm.getRawValue());
        } else {
            this.contrataForm.markAllAsTouched();
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
