export interface DTOCreatePartida {
    codigo: string;
    partidaNombre: string;
    precioGeneral: number;
    estado: boolean;
    unidadGeneral: string;
    usuarioCreacion: number;
    fechaCreacion: Date | null;
}
