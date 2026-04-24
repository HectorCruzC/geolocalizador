import { NextResponse } from "next/server";
import { vehicleRepository } from "@/services/vehicleRepository";
import { createDailyLogSchema } from "@/types/vehicle";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const logs = await vehicleRepository.getDailyLogs(id);
        return NextResponse.json(logs);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: unknown = await request.json();

        const validation = createDailyLogSchema.safeParse({
            ...body as Record<string, unknown>,
            vehicleId: id,
        });

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const log = await vehicleRepository.addDailyLog(validation.data);
        return NextResponse.json(log, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
