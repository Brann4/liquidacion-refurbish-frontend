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

    static  formatExcelDate(serial: number): Date {
        const excelEpoch = new Date(1900, 0, 1); // 1 de enero de 1900
        const utcDays = Math.floor(serial) - 2;  // restamos 2 por el bug de Excel y el offset inicial
        const msPerDay = 24 * 60 * 60 * 1000;
        return new Date(excelEpoch.getTime() + utcDays * msPerDay);
        }
}

