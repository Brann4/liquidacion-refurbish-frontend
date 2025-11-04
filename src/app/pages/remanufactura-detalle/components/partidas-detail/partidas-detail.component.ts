import { PartidaRemanufacturaDetalleStore } from './../../stores/PartidaRemanufacturaDetalleStore';
import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import type { DTOPartida } from '@/pages/partida/entities/partida/DTOPartida';
import type { DTOSeleccionParaResumen } from '../../entities/partidas-detalle/DTOSeleccionParaResumen';
import type { DTOPartidaConItem } from '../../entities/partidas-detalle/DTOPartidaConItem';
import type { DTOPartidaDetalleItem } from '../../entities/partidas-detalle/DTOPartidaDetalleItem';
import type { DTOPartidaSeleccionada } from '../../entities/partidas-detalle/DTOPartidaSeleccionada';
import type { DTOCreatePartidasSeleccionadas } from '../../entities/partidas-detalle/DTOCreatePartidasSeleccionadas';
import { ToastService } from '@/layout/service/toast.service';
import { StepperModule } from 'primeng/stepper';
import { RemanufacturaDetalleStore } from '../../stores/RemanufacturaDetalleStore';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';
import { CommonModule, NgClass } from '@angular/common';

@Component({
    selector: 'remanufactura-partidas-detail',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, FormsModule, StepperModule, FormatCurrencyPipe, NgClass, CommonModule],
    templateUrl: './partidas-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemanufacturaPartidasDetailComponent {
    remanufacturaDetalleStore = inject(RemanufacturaDetalleStore);
    partidaRemanufacturaDetalleStore = inject(PartidaRemanufacturaDetalleStore);
    toast = inject(ToastService);

    selectedData!: DTOPartida[] | null;
    activeStep = signal<number>(1);
    selectionMap: { [key: string]: boolean } = {};
    selectedItems = new Map<string, DTOSeleccionParaResumen>();
    resumenItems = signal<DTOSeleccionParaResumen[]>([]);

    filtroPartidas = signal('');

    partidasFiltradas = computed(() => {
        const filtro = this.filtroPartidas().toLowerCase();
        const partidas = this.partidaRemanufacturaDetalleStore.partidasConItems();

        if (!filtro) {
            return partidas; // Sin filtro, devuelve todo
        }

        // Filtra por nombre o código
        return partidas.filter((p) => p.partidaNombre.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro));
    });

    constructor() {
        // Efecto para cargar datos cuando se abre el modal
        effect(
            () => {
                if (this.partidaRemanufacturaDetalleStore.isOpenPartidasManagment()) {
                    const detalleId = this.partidaRemanufacturaDetalleStore.currentDetalleId();

                    if (detalleId) {
                        // Llama a AMBOS métodos de carga del store
                        this.partidaRemanufacturaDetalleStore.loadPartidasItems();
                        this.partidaRemanufacturaDetalleStore.loadSelections(detalleId);
                    } else {
                        // Limpia por si acaso, aunque el modal no debería abrirse
                        this.handleCloseModal();
                    }
                }
            },
            { allowSignalWrites: true }
        );

        effect(() => {
            // Lee los signals del store
            const selecciones = this.partidaRemanufacturaDetalleStore.seleccionesGuardadas();
            const partidas = this.partidaRemanufacturaDetalleStore.partidasConItems();

            // --- La Clave de Sincronización ---
            // 1. Asegúrate de que el modal esté abierto.
            // 2. Asegúrate de que AMBAS listas hayan cargado (no solo iniciadas).
            // 3. Asegúrate de que no hayamos poblado los mapas AÚN (selectedItems.size === 0).
            if (
                this.partidaRemanufacturaDetalleStore.isOpenPartidasManagment() &&
                partidas.length > 0 &&
                this.selectedItems.size === 0 // Solo poblar si está vacío
                // 'selecciones' puede estar vacío (length === 0), eso está bien
            ) {
                // ¡Ahora es seguro poblar los mapas!
                this.poblarMapasDesdeSelecciones(selecciones, partidas);
            }
        });
    }

    // --- AÑADIR ESTE MÉTODO ---
    /**
     * Verifica si una partida (o alguno de sus items) está seleccionada.
     * Se usa para resaltar el cabezal del acordeón.
     */
    isPartidaSelected(partida: DTOPartidaConItem): boolean {
        // 1. Revisa si la partida general está en el mapa
        if (this.selectedItems.has('partida-' + partida.id)) {
            return true;
        }
        // 2. Revisa si CUALQUIERA de sus items está en el mapa
        return partida.items.some((item) => this.selectedItems.has('item-' + item.id));
    }

    // --- AÑADIR ESTE MÉTODO ---
    /**
     * Cuenta cuántos items de una partida están seleccionados.
     * Se usa para el <p-tag> en el cabezal.
     */
    getSelectedCountForPartida(partida: DTOPartidaConItem): number {
        let count = 0;
        for (const item of partida.items) {
            if (this.selectedItems.has('item-' + item.id)) {
                count++;
            }
        }
        return count;
    }

private poblarMapasDesdeSelecciones(
    selecciones: DTOPartidaSeleccionada[],
    partidas: DTOPartidaConItem[]
  ) {
    console.log("Poblando selecciones existentes...");

    // Limpia los estados locales primero
    this.selectionMap = {};
    this.selectedItems.clear();
    const resumen: DTOSeleccionParaResumen[] = [];

    // Si no hay selecciones guardadas, no hay nada que hacer
    if (selecciones.length === 0) {
        this.resumenItems.set([]); // Asegura que el resumen esté vacío
        return;
    }

    for (const sel of selecciones) {
      const partida = partidas.find((p) => p.id === sel.partidaId);
      if (!partida) continue; // La partida guardada ya no existe

      let key: string;
      let itemData: DTOSeleccionParaResumen;

      if (sel.partidaItemId) {
        // --- Es un PartidaItem ---
        const item = partida.items.find((i) => i.id === sel.partidaItemId);
        if (!item) continue;

        key = 'item-' + sel.partidaItemId;
        itemData = {
          partidaId: sel.partidaId,
          partidaItemId: sel.partidaItemId,
          descripcion: `${partida.partidaNombre} - ${item.descripcion}`,
          precioUnitario: sel.precioUnitarioSeleccionado,
          unidad: item.unidadItem ?? partida.unidadGeneral,
          cantidad: sel.cantidad,
          precioTotal: sel.cantidad * sel.precioUnitarioSeleccionado
        };
      } else {
        // --- Es una Partida General ---
        key = 'partida-' + sel.partidaId;
        itemData = {
          partidaId: sel.partidaId,
          partidaItemId: null,
          descripcion: partida.partidaNombre,
          precioUnitario: sel.precioUnitarioSeleccionado,
          unidad: partida.unidadGeneral,
          cantidad: sel.cantidad,
          precioTotal: sel.cantidad * sel.precioUnitarioSeleccionado
        };
      }

      this.selectionMap[key] = true; // Marca el checkbox
      this.selectedItems.set(key, itemData); // Añade al mapa
      resumen.push(itemData); // Añade a la lista de resumen
    }

    // Actualiza el signal que alimenta la tabla del Paso 2
    this.resumenItems.set(resumen);
  }
    onSelectionChange(isChecked: boolean, partida: DTOPartidaConItem, item: DTOPartidaDetalleItem | null) {
        if (item) {
            // --- CASO 1: Se seleccionó un ITEM ---
            const key = 'item-' + item.id;
            if (isChecked) {
                // Añadir item a la selección
                this.selectedItems.set(key, {
                    partidaId: partida.id,
                    partidaItemId: item.id,
                    descripcion: `${partida.partidaNombre} - ${item.descripcion}`,
                    precioUnitario: item.precioItem ?? 0,
                    unidad: item.unidadItem ?? partida.unidadGeneral,
                    cantidad: 0,
                    precioTotal: 0
                });

                // Des-seleccionar la partida "padre" si estaba seleccionada
                const parentKey = 'partida-' + partida.id;
                if (this.selectionMap[parentKey]) {
                    this.selectionMap[parentKey] = false;
                    this.selectedItems.delete(parentKey);
                }
            } else {
                this.selectedItems.delete(key); // Eliminar de la selección
            }
            this.selectionMap[key] = isChecked;
        } else {
            // --- CASO 2: Se seleccionó una PARTIDA GENERAL ---
            const key = 'partida-' + partida.id;
            if (isChecked) {
                // Añadir partida general
                this.selectedItems.set(key, {
                    partidaId: partida.id,
                    partidaItemId: null,
                    descripcion: partida.partidaNombre,
                    precioUnitario: partida.precioGeneral,
                    unidad: partida.unidadGeneral,
                    cantidad: 0,
                    precioTotal: 0
                });

                // Des-seleccionar todos los "hijos" si estaban seleccionados
                for (const childItem of partida.items) {
                    const childKey = 'item-' + childItem.id;
                    if (this.selectionMap[childKey]) {
                        this.selectionMap[childKey] = false;
                        this.selectedItems.delete(childKey);
                    }
                }
            } else {
                this.selectedItems.delete(key);
            }
            this.selectionMap[key] = isChecked;
        }
    }

    /**
     * Se llama al pulsar "Siguiente" en el Paso 1.
     * Transfiere los datos del Map al Signal de la tabla.
     */
    onNextStep(activateCallback: (step: number) => void, nextStep: number) {
        if (nextStep === 2) {
            // Al pasar del Paso 1 al 2
            if (this.selectedItems.size === 0) {
                this.toast.warn('Advertencia', 'Debe seleccionar al menos una partida o item.');
                return; // No avanza
            }
            this.resumenItems.set(Array.from(this.selectedItems.values()));
        }

        // Avanza al siguiente paso
        this.activeStep.set(nextStep);
        activateCallback(nextStep);
    }

    // Llama a la función de callback para retroceder
    onPrevStep(activateCallback: (step: number) => void, prevStep: number) {
        this.activeStep.set(prevStep);
        activateCallback(prevStep);
    }

    updateTotal(rowIndex: number) {
        this.resumenItems.update((items) => [...items]);
    }

    removeItemFromResumen(itemToRemove: DTOSeleccionParaResumen) {
        // 1. Determinar la clave
        const key = itemToRemove.partidaItemId ? 'item-' + itemToRemove.partidaItemId : 'partida-' + itemToRemove.partidaId;
        // 2. Eliminar de los estados
        this.selectedItems.delete(key);
        this.selectionMap[key] = false; // Desmarca el checkbox
        // 3. Actualizar el signal de la tabla
        this.resumenItems.set(Array.from(this.selectedItems.values()));
    }

    /**
     * Se llama en el Paso 3 para el gran total.
     */
    calcularTotalGeneral(): number {
        return this.resumenItems().reduce((total, item) => total + item.cantidad * item.precioUnitario, 0);
    }

    /**
     * Se llama al pulsar "Guardar Partidas" en el footer (Paso 3).
     * Construye el DTO y lo envía al store/backend.
     */
    handleSubmit() {
        const detalleId = this.partidaRemanufacturaDetalleStore.currentDetalleId();
        if (!detalleId) {
            this.toast.error('Error', 'No se pudo identificar el detalle de liquidación.');
            return;
        }

        const selecciones: DTOPartidaSeleccionada[] = this.resumenItems().map((item) => ({
            partidaId: item.partidaId,
            partidaItemId: item.partidaItemId,
            cantidad: item.cantidad,
            precioUnitarioSeleccionado: item.precioUnitario,
            precioTotal: item.precioUnitario * item.cantidad
        }));

        const payload: DTOCreatePartidasSeleccionadas = {
            liquidacionRemanufacturaDetalleId: detalleId,
            selecciones: selecciones
        };

        this.partidaRemanufacturaDetalleStore.savePartidas(payload);
        this.handleCloseModal();
    }

    /**
     * Limpia todo el estado al cerrar el modal.
     */
    handleCloseModal() {
        this.partidaRemanufacturaDetalleStore.closeModalPartidasManagment();
        this.activeStep.set(1);
        this.selectionMap = {};
        this.selectedItems.clear();
        this.resumenItems.set([]);
        this.filtroPartidas.set('');
    }

    clearFilters(table: Table) {
        table.clear();
        table.filterGlobal('', '');
    }
}
