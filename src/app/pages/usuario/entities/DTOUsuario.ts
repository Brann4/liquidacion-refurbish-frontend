export interface DTOUsuario {
  id: number;
  rolId: number;
  nombreUsuario: string;
  nombres: string;
  apellidos: string;
  passwordHash: string;
  fechaRegistro?: Date | string | null;
  bloqueadoHasta?: Date | string | null;
  fechaModificacion?: Date | string | null;
  intentosFallidos: number;
  estado: boolean;
  isAdmin: boolean;
}
