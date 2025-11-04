import { DTOPartidaDetalleItem } from "./DTOPartidaDetalleItem";

export interface DTOPartidaConItem {
  id: number;
  codigo: string;
  partidaNombre: string;
  precioGeneral: number;
  unidadGeneral: string;
  items: DTOPartidaDetalleItem[]; // List<PartidaItemDto> se convierte en PartidaItemDto[]
}
