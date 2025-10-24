export interface DTOPartida {
  id: number;
  partidaNombre: string;
  precioGeneral: number;
  unidadGeneral: number;
  usuarioCreacion: number;
  fechaCreacion: Date;
  fechaModificacion?: Date | null;
}
