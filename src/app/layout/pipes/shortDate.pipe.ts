import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'shortDate',
    standalone: true
})
export class ShortDatePipe implements PipeTransform {
    transform(value: string | Date): string {
        if (!value) return '';
        const date = new Date(value);
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        return localDate.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}
