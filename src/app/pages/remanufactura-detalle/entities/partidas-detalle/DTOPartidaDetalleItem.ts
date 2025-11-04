export interface DTOPartidaDetalleItem {
  id: number;
  descripcion: string;
  precioItem: number | null; // decimal? se convierte en number | null
  unidadItem: string | null; // string? se convierte en string | null
}
