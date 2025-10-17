import { Estado } from './Constants';

export class Helper {
    static setStatus(status: number): 'success' | 'danger' | 'info' {
        switch (status) {
            case Estado.Activo:
                return 'success';
            case 0:
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
