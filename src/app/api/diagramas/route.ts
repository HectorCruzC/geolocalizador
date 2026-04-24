import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { DxfParserService, type ComponenteExtraido } from "../../../features/diagramas/services/DxfParserService";
import { ExcelParserService, type ExcelRowParsed } from "../../../features/diagramas/services/ExcelParserService";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // 1. Get files and other fields
        const pdfFile = formData.get("pdf") as File;
        const dxfFile = formData.get("dxf") as File;
        const componentsDataStr = formData.get("componentsData") as string;
        const diagramName = formData.get("name") as string;
        const diagramZone = formData.get("zone") as string;

        if (!pdfFile || !componentsDataStr || !diagramName || !diagramZone) {
            return NextResponse.json({ error: "Faltan archivos (PDF) o campos requeridos." }, { status: 400 });
        }

        // 2. Read buffers
        const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

        // 3. Save PDF to public folder
        const uploadDir = join(process.cwd(), "public", "uploads", "diagramas");

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { /* ignore if exists */ }

        const uniqueFileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, "_")}`;
        const pdfPath = join(uploadDir, uniqueFileName);
        const pdfUrl = `/uploads/diagramas/${uniqueFileName}`;

        await writeFile(pdfPath, pdfBuffer);

        // 4. Parse DXF and Excel data
        let dxfComponents: ComponenteExtraido[] = [];
        if (dxfFile) {
            const dxfBuffer = Buffer.from(await dxfFile.arrayBuffer());
            try {
                dxfComponents = await DxfParserService.extractComponentsFromBuffer(dxfBuffer);
            } catch (e: any) {
                return NextResponse.json({ error: `Error parseando DXF: ${e.message}` }, { status: 400 });
            }
        }

        let excelRows: any[] = [];
        try {
            excelRows = JSON.parse(componentsDataStr);
            // Convertir lat y lng a numeros reales ya que vienen de inputs type=number
            excelRows = excelRows.map(row => ({
                ...row,
                latitud: row.latitud ? parseFloat(row.latitud) : 0,
                longitud: row.longitud ? parseFloat(row.longitud) : 0
            }));
        } catch (e: any) {
            return NextResponse.json({ error: `Error parseando datos manuales: ${e.message}` }, { status: 400 });
        }

        // 5. Build diagram data mapping
        // Para simplificar, asumiremos que si un bloque de AutoCAD tiene código "R-1"
        // Y el excel tiene un componente con nombre o alias "R-1", coinciden.

        // Normalize string for comparison
        const normalizeStr = (s: string) => s.trim().toUpperCase();

        const componentsToProcess: { dxfData: any; excelData: any }[] = [];

        if (dxfComponents.length > 0) {
            for (const dxfComp of dxfComponents) {
                const dxfCodeNorm = normalizeStr(dxfComp.codigoCFE);
                const matchingExcelRow = excelRows.find(row =>
                    normalizeStr(row.nombre) === dxfCodeNorm || normalizeStr(row.alias) === dxfCodeNorm
                );
                componentsToProcess.push({
                    dxfData: dxfComp,
                    excelData: matchingExcelRow || null
                });
            }
        } else {
            // Si no hay DXF, simplemente procesamos todas las filas manuales
            for (const row of excelRows) {
                componentsToProcess.push({
                    dxfData: { codigoCFE: row.nombre, xRelativo: 0, yRelativo: 0 },
                    excelData: row
                });
            }
        }

        // 6. DB Transaction using Prisma
        // Create new Diagram, Create all components in ElectricalComponent if they don't exist, create references in DiagramaComponente
        // @ts-ignore: Tipos nuevos prisma
        const savedDiagram = await prisma.$transaction(async (tx) => {

            // @ts-ignore: Tipos nuevos prisma
            const diagrama = await tx.diagrama.create({
                data: {
                    nombre: diagramName,
                    urlPdf: pdfUrl,
                    zona: diagramZone
                }
            });

            const interactivos = [];

            for (const match of componentsToProcess) {
                const codeToUse = match.dxfData.codigoCFE;

                // If we have excel data, update or create the global Component mapping
                if (match.excelData) {
                    await tx.electricalComponent.upsert({
                        where: { code: codeToUse },
                        update: {
                            name: match.excelData.nombre,
                            alias: match.excelData.alias,
                            zona: match.excelData.zona || diagramZone,
                            latitude: match.excelData.latitud,
                            longitude: match.excelData.longitud,
                            brand: match.excelData.marca,
                        },
                        create: {
                            code: codeToUse,
                            type: match.excelData.tipo || "RESTAURADOR",
                            name: match.excelData.nombre,
                            alias: match.excelData.alias,
                            zona: match.excelData.zona || diagramZone,
                            latitude: match.excelData.latitud,
                            longitude: match.excelData.longitud,
                            brand: match.excelData.marca,
                            icc: 0
                        }
                    });
                }

                // Regardless of Excel match, add hotspot to Diagram
                interactivos.push({
                    diagramaId: diagrama.id,
                    codigoCFE: codeToUse,
                    xRelativo: match.dxfData.xRelativo,
                    yRelativo: match.dxfData.yRelativo
                });
            }

            if (interactivos.length > 0) {
                // @ts-ignore: Tipos nuevos prisma
                await tx.diagramaComponente.createMany({
                    data: interactivos
                });
            }

            // @ts-ignore: Tipos nuevos prisma
            return await tx.diagrama.findUnique({
                where: { id: diagrama.id },
                include: { componentesInteractivos: true }
            });
        }, {
            timeout: 20000,
            maxWait: 10000
        });

        return NextResponse.json({ success: true, diagrama: savedDiagram }, { status: 201 });

    } catch (error: any) {
        console.error("General error in Diagram API Route:", error);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
