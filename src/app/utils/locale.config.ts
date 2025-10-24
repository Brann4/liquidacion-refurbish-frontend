import { setDefaultOptions } from 'date-fns';
import { es } from 'date-fns/locale';

export function configureDateFnsLocale(): void {
    setDefaultOptions({
        locale: es,
        weekStartsOn: 1
    });
}

export const CURRENCY_CONFIG = {
    locale: 'es-PE',
    currency: 'PEN',
    currencyOptions: {
        style: 'currency' as const,
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
} as const;

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, CURRENCY_CONFIG.currencyOptions).format(amount);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale).format(value);
}
