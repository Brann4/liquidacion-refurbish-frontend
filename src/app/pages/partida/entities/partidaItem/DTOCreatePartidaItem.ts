export interface DTOCreatePartidaItem{
  partidaId?: number | null;
  descripcion: string;
  precioItem: number;
  unidadItem: number;
  estado: boolean;
  usuarioCreacion: number;
  fechaCreacion: Date;
}
