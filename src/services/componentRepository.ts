import { prisma } from "@/lib/prisma";
import type { CreateComponentDTO } from "@/types/component";
import type { ComponentType } from "@prisma/client";

export const componentRepository = {
    async findAll() {
        return prisma.electricalComponent.findMany({
            orderBy: { createdAt: "desc" },
        });
    },

    async findByCode(code: string) {
        return prisma.electricalComponent.findUnique({
            where: { code },
        });
    },

    async findByType(type: ComponentType) {
        return prisma.electricalComponent.findMany({
            where: { type },
            orderBy: { createdAt: "desc" },
        });
    },

    async search(query: string) {
        return prisma.electricalComponent.findMany({
            where: {
                OR: [
                    { code: { contains: query, mode: "insensitive" } },
                    { name: { contains: query, mode: "insensitive" } },
                    { alias: { contains: query, mode: "insensitive" } },
                ],
            },
            orderBy: { createdAt: "desc" },
        });
    },

    async create(data: CreateComponentDTO) {
        return prisma.electricalComponent.create({
            data: {
                type: data.type,
                code: data.code,
                name: data.name,
                alias: data.alias || null,
                brand: data.brand,
                imageUrl: data.imageUrl || null,
                latitude: data.latitude,
                longitude: data.longitude,
                icc: data.icc,
                swept: data.swept,
            },
        });
    },

    async update(id: string, data: Partial<CreateComponentDTO>) {
        return prisma.electricalComponent.update({
            where: { id },
            data: {
                ...data,
                alias: data.alias || null,
                imageUrl: data.imageUrl || null,
            },
        });
    },

    async delete(id: string) {
        return prisma.electricalComponent.delete({
            where: { id },
        });
    },
};
