export interface UpdateProductoDescontinuadoRequest {
    codigoSAP: string;
    nombreProducto: string;
    fechaDescontinuado: string;
    estado: boolean;
}
