import { Component, computed, effect, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoDescontinuado } from '@/pages/producto-descontinuado/entities/producto-descontinuado';
import { ProductoDescontinuadoFormType, ProductoDescontinuadoFormValue } from '@/pages/producto-descontinuado/components/producto-descontinuado-form/producto-descontinuado-form.model';
import { PrimeModules } from '@/utils/PrimeModule';
import { FormControlError } from '@/utils/form-control-error/form-control-error';

@Component({
    selector: 'app-producto-descontinuado-form',
    imports: [PrimeModules, ReactiveFormsModule, FormControlError],
    templateUrl: './producto-descontinuado-form.html',
    styles: ``
})
export class ProductoDescontinuadoForm {
    private readonly formBuilder = inject(FormBuilder);

    public readonly productData = input.required<ProductoDescontinuado | null>();
    public readonly isLoading = input<boolean>(false);
    public readonly visible = input.required<boolean>();
    public readonly save = output<ProductoDescontinuadoFormValue>();
    public readonly cancel = output<void>();
    public readonly visibleChange = output<boolean>();

    protected readonly formTitle = computed(() => (this.productData() ? 'Editar Producto Descontinuado' : 'Crear Producto Descontinuado'));
    protected readonly isEditMode = computed(() => !!this.productData());

    protected readonly discontinuedProductForm: FormGroup<ProductoDescontinuadoFormType> = this.formBuilder.nonNullable.group({
        codigoSAP: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
        nombreProducto: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
        fechaDescontinuado: this.formBuilder.nonNullable.control(null as Date | null, [Validators.required]),
        estado: this.formBuilder.nonNullable.control(true, [Validators.required])
    });

    constructor() {
        effect(() => {
            const currentProductData = this.productData();

            if (currentProductData) {
                this.discontinuedProductForm.patchValue({
                    codigoSAP: currentProductData.codigoSAP,
                    nombreProducto: currentProductData.nombreProducto,
                    fechaDescontinuado: new Date(currentProductData.fechaDescontinuado),
                    estado: currentProductData.estado
                });
            }
        });
    }

    get controls() {
        return this.discontinuedProductForm.controls;
    }

    protected onSubmitForm(): void {
        if (this.discontinuedProductForm.valid) {
            this.save.emit(this.discontinuedProductForm.getRawValue());
        } else {
            this.discontinuedProductForm.markAllAsTouched();
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
