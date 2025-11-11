export enum Estado {
    Inactivo = 0,
    Activo = 1,
    Todos = -1
}

export enum Rol{
    SuperAdmin = 1,
    Administrador = 2,
    JefeOperario = 3,
    Supervisor = 4
}

export const unidadesMedida = [
    { label: 'MOVIMIENTO', value: 'Mov' },
    { label: 'PERSONA', value: 'Persona' },
    { label: 'DÍA', value: 'dia' },
    { label: 'HORAS', value: 'hrs' },
    { label: 'UNIDAD', value: 'und' }
];
