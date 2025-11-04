export interface DTOPartidaSeleccionada {
  partidaId: number;
  partidaItemId: number | null; // Es null si se seleccionó la partida general
  cantidad: number;
  precioUnitarioSeleccionado: number;
  precioTotal: number;
}
