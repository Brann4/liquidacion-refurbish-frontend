export interface DTOPartidaItem {
    id: number;
    partidaId?: number | null;
    descripcion: string;
    precioItem: number;
    unidadItem: string;
    estado: boolean;
    usuarioCreacion: number;
    fechaCreacion: Date;
    fechaModificacion?: Date | null;
}
