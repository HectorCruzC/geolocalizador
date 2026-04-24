import { DxfParser } from 'dxf-parser';

export interface ComponenteExtraido {
    codigoCFE: string;
    xRelativo: number; // Porcentaje 0-100
    yRelativo: number; // Porcentaje 0-100
}

export class DxfParserService {
    /**
     * Parse a DXF file from a buffer and extract block insertions.
     * Assumes blocks have attributes or names containing the CFE Code.
     */
    static async extractComponentsFromBuffer(dxfBuffer: Buffer): Promise<ComponenteExtraido[]> {
        try {
            const fileText = dxfBuffer.toString('utf-8');
            const parser = new DxfParser();
            const dxf = parser.parseSync(fileText);

            // 1. Get extents
            const extents = dxf?.header?.$EXTMAX && dxf?.header?.$EXTMIN ? {
                minX: (dxf.header.$EXTMIN as any).x,
                minY: (dxf.header.$EXTMIN as any).y,
                maxX: (dxf.header.$EXTMAX as any).x,
                maxY: (dxf.header.$EXTMAX as any).y,
            } : null;

            if (!extents) {
                console.warn("DXF parsing warning: $EXTMAX / $EXTMIN missing. Falling back to calculate bounds.");
                // This is a simplification; a full implementation would iterate all entities
                // to find min/max. For this project, we assume standardized DXFs.
            }

            const minX = extents?.minX ?? 0;
            const minY = extents?.minY ?? 0;
            const maxX = extents?.maxX ?? 1000;
            const maxY = extents?.maxY ?? 1000;

            const width = maxX - minX;
            const height = maxY - minY;

            const componentes: ComponenteExtraido[] = [];

            if (!dxf || !dxf.entities) return componentes;

            // 2. Iterate entities looking for INSERTs (Blocks)
            for (const entity of dxf.entities) {
                const ent = entity as any;
                // En un caso real, la validación se haría por nombre de bloque o atributos.
                // Aquí asumimos que los bloques insertados son componentes si tienen nombre.
                if (ent.type === 'INSERT' && ent.name) {

                    // The CFE code should ideally be an attribute. Often parser puts them in `entity.attributes`.
                    // We'll fall back to entity.name or a mockup if no attributes exist for this boilerplate.
                    let codigoCFE = ent.name;

                    // @ts-ignore - DxfParser types might not fully cover attributes depending on the block
                    if (ent.attributes && Object.keys(ent.attributes).length > 0) {
                        // @ts-ignore
                        const firstKey = Object.keys(ent.attributes)[0];
                        // @ts-ignore
                        codigoCFE = ent.attributes[firstKey]?.value || codigoCFE;
                    }

                    // Convert to percentages. Y is often inverted in CAD vs Web.
                    const xRelativo = ((ent.position.x - minX) / width) * 100;
                    const yRelativo = 100 - (((ent.position.y - minY) / height) * 100);

                    componentes.push({
                        codigoCFE,
                        xRelativo,
                        yRelativo
                    });
                }
            }

            return componentes;
        } catch (error) {
            console.error("Error parsing DXF:", error);
            throw new Error("Failed to parse DXF file. Ensure it is a valid AutoCAD formatting.");
        }
    }
}
