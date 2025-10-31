import { Injectable } from '@angular/core';
import { read, utils } from 'xlsx';
import { LiquidacionRecuperoDetallePreview } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle-preview';
import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';

@Injectable({
    providedIn: 'root'
})
export class LiquidacionRecuperoExcel {
    private static readonly ColumnKeys = {
        CodigoSAP: 'Código SAP',
        Descripcion: 'Descripción',
        SeriePrincipal: 'Serie Principal',
        SerieSecundaria: 'Serie Secundaria',
        SOT: 'SOT',
        CodigoCliente: 'Código Cliente',
        Cliente: 'Cliente',
        Contabilizado: 'Contabilizado',
        OrdenCompra: 'Orden de Compra',
        Zona: 'Zona',
        Distrito: 'Distrito',
        FechaRecibo: 'Fecha Recibo',
        Plataforma: 'Plataforma'
    } as const;

    private readonly requiredColumns: Record<string, string> = {
        [LiquidacionRecuperoExcel.ColumnKeys.CodigoSAP]: 'codigoSAP',
        [LiquidacionRecuperoExcel.ColumnKeys.Descripcion]: 'descripcion',
        [LiquidacionRecuperoExcel.ColumnKeys.SeriePrincipal]: 'seriePrincipal',
        [LiquidacionRecuperoExcel.ColumnKeys.SerieSecundaria]: 'serieSecundaria',
        [LiquidacionRecuperoExcel.ColumnKeys.SOT]: 'codigoSOT',
        [LiquidacionRecuperoExcel.ColumnKeys.CodigoCliente]: 'codigoCliente',
        [LiquidacionRecuperoExcel.ColumnKeys.Cliente]: 'cliente',
        [LiquidacionRecuperoExcel.ColumnKeys.Contabilizado]: 'contabilizado',
        [LiquidacionRecuperoExcel.ColumnKeys.OrdenCompra]: 'ordenCompra',
        [LiquidacionRecuperoExcel.ColumnKeys.Zona]: 'tipoZona',
        [LiquidacionRecuperoExcel.ColumnKeys.Distrito]: 'distrito',
        [LiquidacionRecuperoExcel.ColumnKeys.FechaRecibo]: 'fechaRecibo',
        [LiquidacionRecuperoExcel.ColumnKeys.Plataforma]: 'plataforma'
    };

    async processFileAsync(file: File): Promise<LiquidacionRecuperoDetallePreview[]> {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = read(arrayBuffer, { type: 'array' });

        const worksheetName = workbook.SheetNames[0];
        if (!worksheetName) {
            throw new Error('El archivo Excel está vacío o no contiene hojas de trabajo.');
        }

        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
            throw new Error('El archivo Excel está vacío o no contiene hojas de trabajo.');
        }

        const headerRow = 0;
        const columnMapping = this.validateAndMapColumns(jsonData[headerRow]);

        const result: LiquidacionRecuperoDetallePreview[] = [];
        const startRow = headerRow + 1;

        for (let rowIndex = startRow; rowIndex < jsonData.length; rowIndex++) {
            const row = jsonData[rowIndex];

            if (this.isRowEmpty(row)) {
                continue;
            }

            const item: Partial<LiquidacionRecuperoDetallePreview> = {};
            const errors: string[] = [];
            const currentRow = rowIndex + 1;

            for (const [columnName, columnIndex] of Object.entries(columnMapping)) {
                const cellValue = row[columnIndex]?.toString()?.trim() || '';

                switch (columnName) {
                    case LiquidacionRecuperoExcel.ColumnKeys.CodigoSAP:
                        if (!cellValue) {
                            errors.push(`Fila ${currentRow}: Código SAP no puede ser nulo o vacío`);
                        } else {
                            item.codigoSAP = cellValue;
                        }
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.Descripcion:
                        if (!cellValue) {
                            errors.push(`Fila ${currentRow}: Descripción no puede ser nula o vacía`);
                        } else {
                            item.descripcion = cellValue;
                        }
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.SeriePrincipal:
                        if (!cellValue) {
                            errors.push(`Fila ${currentRow}: Serie Principal no puede ser nula o vacía`);
                        } else {
                            item.seriePrincipal = cellValue;
                        }
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.SerieSecundaria:
                        item.serieSecundaria = cellValue || null;
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.SOT:
                        if (!cellValue) {
                            errors.push(`Fila ${currentRow}: SOT no puede ser nulo o vacío`);
                        } else {
                            item.codigoSOT = cellValue;
                        }
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.CodigoCliente:
                        item.codigoCliente = cellValue || null;
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.Cliente:
                        item.cliente = cellValue || null;
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.Contabilizado:
                        item.contabilizado = cellValue || null;
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.OrdenCompra:
                        item.ordenCompra = cellValue || null;
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.Zona:
                        if (!cellValue) {
                            errors.push(`Fila ${currentRow}: Zona no puede ser nula o vacía`);
                        } else {
                            const zonaValue = cellValue.toUpperCase().replace(/\s/g, '');
                            if (zonaValue === 'LIMAMETROPOLITANA') {
                                item.tipoZonaId = TipoZona.LimaMetropolitana;
                            } else if (zonaValue === 'PROVINCIAS') {
                                item.tipoZonaId = TipoZona.Provincias;
                            } else {
                                errors.push(`Fila ${currentRow}: Valor de Zona '${cellValue}' no es válido. Debe ser 'LIMA METROPOLITANA' o 'PROVINCIAS'`);
                            }
                        }
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.Distrito:
                        item.distrito = cellValue || null;
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.FechaRecibo:
                        if (cellValue) {
                            const fecha = this.parseDate(cellValue);
                            if (fecha) {
                                item.fechaRecibo = fecha;
                            } else {
                                errors.push(`Fila ${currentRow}: Formato de fecha no válido en Fecha Recibo`);
                            }
                        } else {
                            item.fechaRecibo = null;
                        }
                        break;

                    case LiquidacionRecuperoExcel.ColumnKeys.Plataforma:
                        item.plataforma = cellValue || null;
                        break;
                }
            }

            if (errors.length > 0) {
                throw new Error(`Errores en el procesamiento del archivo:\n${errors.join('\n')}`);
            }

            result.push(item as LiquidacionRecuperoDetallePreview);
        }

        if (result.length === 0) {
            throw new Error('El archivo no contiene datos para procesar.');
        }

        return result;
    }

    private validateAndMapColumns(headerRow: any[]): Record<string, number> {
        const columnMapping: Record<string, number> = {};
        const missingColumns: string[] = [];

        for (const requiredColumn of Object.keys(this.requiredColumns)) {
            let found = false;

            for (let col = 0; col < headerRow.length; col++) {
                const headerValue = headerRow[col]?.toString()?.trim();

                if (headerValue && headerValue.toLowerCase() === requiredColumn.toLowerCase()) {
                    columnMapping[requiredColumn] = col;
                    found = true;
                    break;
                }
            }

            if (!found) {
                missingColumns.push(requiredColumn);
            }
        }

        if (missingColumns.length > 0) {
            throw new Error(`Faltan las siguientes columnas en el archivo Excel: ${missingColumns.join(', ')}`);
        }

        return columnMapping;
    }

    private isRowEmpty(row: any[]): boolean {
        return !row || row.every((cell) => cell === null || cell === undefined || (typeof cell === 'string' && cell.trim() === ''));
    }

    private parseDate(cellValue: string): string | null {
        const normalDate = new Date(cellValue);
        if (!isNaN(normalDate.getTime())) {
            return normalDate.toISOString();
        }

        const numericValue = parseFloat(cellValue);
        if (!isNaN(numericValue)) {
            try {
                const excelDate = new Date((numericValue - 25569) * 86400 * 1000);
                if (!isNaN(excelDate.getTime())) {
                    return excelDate.toISOString();
                }
            } catch {
                return null;
            }
        }

        return null;
    }
}
