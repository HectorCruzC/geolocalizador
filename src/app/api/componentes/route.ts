import { NextResponse } from "next/server";
import { componentRepository } from "@/services/componentRepository";
import { createComponentSchema, ComponentTypeEnum } from "@/types/component";
import { sanitizeString } from "@/lib/utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const typeParam = searchParams.get("type");

        let components;

        if (query) {
            const sanitizedQuery = sanitizeString(query);
            components = await componentRepository.search(sanitizedQuery);
        } else if (typeParam) {
            const parsed = ComponentTypeEnum.safeParse(typeParam);
            if (!parsed.success) {
                return NextResponse.json(
                    { error: "Tipo de componente inválido", validTypes: ComponentTypeEnum.options },
                    { status: 400 }
                );
            }
            components = await componentRepository.findByType(parsed.data);
        } else {
            components = await componentRepository.findAll();
        }

        return NextResponse.json(components);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();
        const validation = createComponentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        const existing = await componentRepository.findByCode(data.code);
        if (existing) {
            return NextResponse.json(
                { error: "Ya existe un componente con ese código" },
                { status: 409 }
            );
        }

        const sanitizedData = {
            ...data,
            name: sanitizeString(data.name),
            alias: data.alias ? sanitizeString(data.alias) : undefined,
            brand: sanitizeString(data.brand),
            code: sanitizeString(data.code),
        };

        const component = await componentRepository.create(sanitizedData);
        return NextResponse.json(component, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
