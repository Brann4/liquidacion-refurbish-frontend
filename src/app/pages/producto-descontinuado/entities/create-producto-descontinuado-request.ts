export interface CreateProductoDescontinuadoRequest {
    codigoSAP: string;
    nombreProducto: string;
    fechaDescontinuado: string;
    estado: boolean;
    usuarioId: number;
}
