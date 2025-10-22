import { Estado } from './Constants';

export class Helper {
    static setStatus(status: number | boolean): 'success' | 'danger' | 'info' {
        if (typeof status === 'boolean') {
            return status ? 'success' : 'danger';
        }

        switch (status) {
            case Estado.Activo:
                return 'success';
            case Estado.Inactivo:
                return 'danger';
            default:
                return 'info';
        }
    }

    static formatDate(date: string | Date): string {
        const d = new Date(date);
        return d.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}
