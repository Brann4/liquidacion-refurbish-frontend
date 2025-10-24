import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@/utils/locale.config';

@Pipe({
    name: 'formatCurrency'
})
export class FormatCurrencyPipe implements PipeTransform {
    transform(value: number): string {
        if (value === null || value === undefined) {
            return '';
        }
        return formatCurrency(value);
    }
}
