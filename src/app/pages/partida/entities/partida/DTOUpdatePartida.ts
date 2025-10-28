export interface DTOUpdatePartida {
    id: number;
    codigo?: string;
    partidaNombre?: string;
    precioGeneral?: number;
    estado: boolean;
    unidadGeneral?: string;
    fechaModificacion?: Date | null;
}
