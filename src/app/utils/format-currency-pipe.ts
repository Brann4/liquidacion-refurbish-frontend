import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@/utils/locale.config';

@Pipe({
    name: 'formatCurrency'
})
export class FormatCurrencyPipe implements PipeTransform {
    transform(value: number | string | null | undefined, countryCode: string = 'PE'): string {
        if (value === null || value === undefined || value === '') return '';

        const numberValue = Number(value);
        if (isNaN(numberValue)) return value.toString();

        const symbols: Record<string, string> = {
            PE: 'S/', // Perú
            US: '$', // Estados Unidos
            EU: '€', // Europa
            CL: '$', // Chile
            MX: '$', // México
            CO: '$', // Colombia
            AR: '$', // Argentina
            BR: 'R$', // Brasil
            GB: '£', // Reino Unido
            JP: '¥' // Japón
        };

        const symbol = symbols[countryCode.toUpperCase()] || '';

        // Formatear con 2 decimales
        const formatted = numberValue.toLocaleString('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return `${symbol} ${formatted}`;
    }
}
