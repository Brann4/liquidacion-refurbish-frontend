export interface DTOPartida {
  id: number;
  codigo: string;
  partidaNombre: string;
  precioGeneral: number;
  unidadGeneral: number;
  estado: boolean;
  usuarioCreacion: number;
  fechaCreacion: Date;
  fechaModificacion?: Date | null;
}
