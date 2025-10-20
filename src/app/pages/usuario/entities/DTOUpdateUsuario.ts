export interface DTOUpdateUsuario {
    id: number;
    rolId: number;
    nombreUsuario: string;
    nombres: string;
    apellidos: string;
    passwordHash?: string;
    estado: boolean;
    isAdmin: boolean;
}
