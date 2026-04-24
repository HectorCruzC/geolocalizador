import * as XLSX from 'xlsx';

export interface ExcelRowParsed {
    zona: string;
    nombre: string;
    alias: string;
    latitud: number;
    longitud: number;
    marca: string;
}

export class ExcelParserService {
    /**
     * Parse an Excel file buffer and extract component data.
     */
    static parseFromBuffer(excelBuffer: Buffer): ExcelRowParsed[] {
        try {
            const workbook = XLSX.read(excelBuffer, { type: 'buffer' });

            if (!workbook.SheetNames.length) {
                throw new Error("El archivo Excel está vacío.");
            }

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON array
            // A => zona, B => nombre, C => alias, D => latitud, E => longitud, F => marca
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

            const parsedData: ExcelRowParsed[] = [];

            // Skip header row (index 0)
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];

                // Skip empty rows
                if (!row || row.length === 0 || !row[1]) continue;

                parsedData.push({
                    zona: String(row[0] || ''),
                    nombre: String(row[1] || ''),
                    alias: String(row[2] || ''),
                    latitud: parseFloat(row[3]) || 0,
                    longitud: parseFloat(row[4]) || 0,
                    marca: String(row[5] || ''),
                });
            }

            return parsedData;
        } catch (error) {
            console.error("Error parsing Excel:", error);
            throw new Error("Fallo al parsear el archivo Excel. Asegúrate de que tenga el formato correcto.");
        }
    }
}
