import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';
import { EstadoPago } from '@/pages/recupero-detalle/entities/estado-pago';

export interface LiquidacionRecuperoDetalle {
    id: number;
    liquidacionRecuperoId: number;
    codigoSAP: string;
    descripcion: string;
    seriePrincipal: string;
    serieSecundaria: string | null;
    codigoSOT: string;
    codigoCliente: string | null;
    cliente: string | null;
    contabilizado: string | null;
    ordenCompra: string | null;
    tipoZonaId: TipoZona;
    distrito: string | null;
    fechaRecibo: string | null;
    plataforma: string | null;
    precio: number;
    estadoPago: EstadoPago;
}
