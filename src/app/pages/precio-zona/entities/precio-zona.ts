export interface PrecioZona {
    id: number;
    contrataId: number;
    precio: number;
    tipoZonaId: TipoZona;
    usuarioId: number;
    fechaCreacion: string;
}

export enum TipoZona {
    LimaMetropolitana = 0,
    Provincias = 1
}
