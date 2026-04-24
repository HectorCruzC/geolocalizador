import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Uso de una instancia the Prisma instanciada dinámicamente o global
export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const diagramas = await prisma.diagrama.findMany({
            include: {
                componentesInteractivos: true,
                puntosIcc: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, diagramas });
    } catch (error: any) {
        console.error("Error fetching diagramas:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
