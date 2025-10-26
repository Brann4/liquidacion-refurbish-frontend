import { Component, computed, effect, inject, input, output, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LiquidacionRecupero } from '@/pages/recupero/entities/liquidacion-recupero';
import { RecuperoFormType, RecuperoFormValue } from '@/pages/recupero/components/recupero-form/recupero-form.model';
import { PrimeModules } from '@/utils/PrimeModule';
import { FormControlError } from '@/utils/form-control-error/form-control-error';
import { ContrataStore } from '@/pages/contrata/store/contrata.store';

@Component({
    selector: 'app-recupero-form',
    imports: [PrimeModules, ReactiveFormsModule, FormControlError],
    templateUrl: './recupero-form.html',
    styles: ``
})
export class RecuperoForm implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly contrataStore = inject(ContrataStore);

    public readonly recuperoData = input.required<LiquidacionRecupero | null>();
    public readonly isLoading = input<boolean>(false);
    public readonly visible = input.required<boolean>();
    public readonly save = output<RecuperoFormValue>();
    public readonly cancel = output<void>();
    public readonly visibleChange = output<boolean>();

    protected readonly formTitle = computed(() => (this.recuperoData() ? 'Editar Recupero' : 'Crear Recupero'));
    protected readonly contratas = computed(() => this.contrataStore.entities());

    protected readonly recuperoForm: FormGroup<RecuperoFormType> = this.formBuilder.nonNullable.group({
        contrataId: this.formBuilder.nonNullable.control(null as number | null, [Validators.required]),
        fechaIngreso: this.formBuilder.nonNullable.control(null as Date | null, [Validators.required])
    });

    ngOnInit(): void {
        this.contrataStore.getAll();
    }

    constructor() {
        effect(() => {
            const currentRecuperoData = this.recuperoData();

            if (currentRecuperoData) {
                this.recuperoForm.patchValue({
                    contrataId: currentRecuperoData.contrataId,
                    fechaIngreso: new Date(currentRecuperoData.fechaIngreso)
                });
            }
        });
    }

    get controls() {
        return this.recuperoForm.controls;
    }

    protected onSubmitForm(): void {
        if (this.recuperoForm.valid) {
            this.save.emit(this.recuperoForm.getRawValue());
        } else {
            this.recuperoForm.markAllAsTouched();
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
