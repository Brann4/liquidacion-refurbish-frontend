export interface DTOPartidaItem {
  id: number;
  partidaId?: number | null;
  descripcion: string;
  precioItem: number;
  unidadItem: number;
  usuarioCreacion: number;
  fechaCreacion: Date;
  fechaModificacion?: Date | null;
}
