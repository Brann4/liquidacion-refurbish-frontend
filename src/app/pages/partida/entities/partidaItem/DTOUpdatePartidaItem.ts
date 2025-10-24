export interface DTOUpdatePartidaItem{
  id: number;
  partidaId?: number | null;
  descripcion: string;
  precioItem: number;
  unidadItem: number;
  fechaModificacion?: Date | null;
}
