import { DTOPartidaSeleccionada } from "./DTOPartidaSeleccionada";

export interface DTOCreatePartidasSeleccionadas {
  liquidacionRemanufacturaDetalleId: number;
  selecciones: DTOPartidaSeleccionada[]; // Un array de las partidas seleccionadas
}
