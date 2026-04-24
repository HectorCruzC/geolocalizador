import { NextResponse } from "next/server";
import { vehicleRepository } from "@/services/vehicleRepository";
import { createVehicleSchema, createDailyLogSchema } from "@/types/vehicle";
import { sanitizeString } from "@/lib/utils";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const vehicle = await vehicleRepository.findById(id);

        if (!vehicle) {
            return NextResponse.json(
                { error: "Vehículo no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(vehicle);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: unknown = await request.json();
        const validation = createVehicleSchema.partial().safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;
        const sanitizedData = {
            ...data,
            economicNumber: data.economicNumber
                ? sanitizeString(data.economicNumber)
                : undefined,
            plate: data.plate ? sanitizeString(data.plate).toUpperCase() : undefined,
            brand: data.brand ? sanitizeString(data.brand) : undefined,
            model: data.model ? sanitizeString(data.model) : undefined,
        };

        const vehicle = await vehicleRepository.update(id, sanitizedData);
        return NextResponse.json(vehicle);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await vehicleRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
