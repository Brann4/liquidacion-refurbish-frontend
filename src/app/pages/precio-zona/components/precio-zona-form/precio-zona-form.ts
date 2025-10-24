import { Component, computed, effect, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrecioZona } from '@/pages/precio-zona/entities/precio-zona';
import { PrecioZonaFormType, PrecioZonaFormValue, TipoZonaOptions } from '@/pages/precio-zona/components/precio-zona-form/precio-zona-form.model';
import { PrimeModules } from '@/utils/PrimeModule';
import { FormControlError } from '@/utils/form-control-error/form-control-error';

@Component({
    selector: 'app-precio-zona-form',
    imports: [PrimeModules, ReactiveFormsModule, FormControlError],
    templateUrl: './precio-zona-form.html',
    styles: ``
})
export class PrecioZonaForm {
    private readonly formBuilder = inject(FormBuilder);

    public readonly precioZonaData = input.required<PrecioZona | null>();
    public readonly isLoading = input<boolean>(false);
    public readonly visible = input.required<boolean>();
    public readonly save = output<PrecioZonaFormValue>();
    public readonly cancel = output<void>();
    public readonly visibleChange = output<boolean>();

    protected readonly formTitle = computed(() => (this.precioZonaData() ? 'Editar Precio de Zona' : 'Crear Precio de Zona'));
    protected readonly tipoZonaOptions = TipoZonaOptions;

    protected readonly precioZonaForm: FormGroup<PrecioZonaFormType> = this.formBuilder.nonNullable.group({
        precio: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0.01)]),
        tipoZonaId: this.formBuilder.nonNullable.control(0, [Validators.required])
    });

    constructor() {
        effect(() => {
            const currentPrecioZonaData = this.precioZonaData();

            if (currentPrecioZonaData) {
                this.precioZonaForm.patchValue({
                    precio: currentPrecioZonaData.precio,
                    tipoZonaId: currentPrecioZonaData.tipoZonaId
                });
            }
        });
    }

    get controls() {
        return this.precioZonaForm.controls;
    }

    protected onSubmitForm(): void {
        if (this.precioZonaForm.valid) {
            this.save.emit(this.precioZonaForm.getRawValue());
        } else {
            this.precioZonaForm.markAllAsTouched();
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
