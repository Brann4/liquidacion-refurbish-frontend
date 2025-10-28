export interface DTOPartidaItem {
    id: number;
    partidaId?: number | null;
    descripcion: string;
    precioItem: number;
    unidadItem: number;
    estado: boolean;
    usuarioCreacion: number;
    fechaCreacion: Date;
    fechaModificacion?: Date | null;
}
