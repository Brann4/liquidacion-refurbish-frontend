export interface DTOUpdatePartidaItem {
    id: number;
    partidaId?: number | null;
    descripcion: string;
    precioItem: number;
    unidadItem: number;
    estado: boolean;
    fechaModificacion: Date ;
}
