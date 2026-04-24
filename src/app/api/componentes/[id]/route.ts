import { NextResponse } from "next/server";
import { componentRepository } from "@/services/componentRepository";
import { createComponentSchema } from "@/types/component";
import { sanitizeString } from "@/lib/utils";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: unknown = await request.json();
        const validation = createComponentSchema.partial().safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        const sanitizedData = {
            ...data,
            name: data.name ? sanitizeString(data.name) : undefined,
            alias: data.alias ? sanitizeString(data.alias) : undefined,
            brand: data.brand ? sanitizeString(data.brand) : undefined,
            code: data.code ? sanitizeString(data.code) : undefined,
        };

        const component = await componentRepository.update(id, sanitizedData);
        return NextResponse.json(component);
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
        await componentRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
