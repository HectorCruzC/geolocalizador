import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

// Inyectar / registrar punto corto
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: diagramId } = await params;
        const body = await req.json();

        const { iccMonofasica, iccTrifasica, xRelativo, yRelativo } = body;

        if (iccMonofasica === undefined || iccTrifasica === undefined || xRelativo === undefined || yRelativo === undefined) {
            return NextResponse.json({ error: "Faltan datos de posición o valores ICC." }, { status: 400 });
        }

        // @ts-ignore
        const newPoint = await prisma.diagramaIccPoint.create({
            data: {
                diagramaId: diagramId,
                iccMonofasica: Number(iccMonofasica),
                iccTrifasica: Number(iccTrifasica),
                xRelativo: Number(xRelativo),
                yRelativo: Number(yRelativo)
            }
        });

        return NextResponse.json({ success: true, point: newPoint }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating ICC point:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// Eliminar un punto corto
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const pointId = searchParams.get('pointId');

        if (!pointId) {
            return NextResponse.json({ error: "pointId missing" }, { status: 400 });
        }

        // @ts-ignore
        await prisma.diagramaIccPoint.delete({
            where: {
                id: pointId
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting ICC point:", error);
        return NextResponse.json({ error: "Error al borrar punto." }, { status: 500 });
    }
}
