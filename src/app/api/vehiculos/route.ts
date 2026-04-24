import { NextResponse } from "next/server";
import { vehicleRepository } from "@/services/vehicleRepository";
import { createVehicleSchema } from "@/types/vehicle";
import { sanitizeString } from "@/lib/utils";

export async function GET() {
    try {
        const vehicles = await vehicleRepository.findAll();
        return NextResponse.json(vehicles);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();
        const validation = createVehicleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        const existing = await vehicleRepository.findByPlate(data.plate);
        if (existing) {
            return NextResponse.json(
                { error: "Ya existe un vehículo con esa placa" },
                { status: 409 }
            );
        }

        const sanitizedData = {
            ...data,
            economicNumber: sanitizeString(data.economicNumber),
            plate: sanitizeString(data.plate).toUpperCase(),
            brand: sanitizeString(data.brand),
            model: sanitizeString(data.model),
        };

        const vehicle = await vehicleRepository.create(sanitizedData);
        return NextResponse.json(vehicle, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
