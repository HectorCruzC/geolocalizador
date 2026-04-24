import { prisma } from "@/lib/prisma";
import type { CreateVehicleDTO, CreateDailyLogDTO } from "@/types/vehicle";
import type { VehicleStatus } from "@prisma/client";

export const vehicleRepository = {
    async findAll() {
        return prisma.vehicle.findMany({
            include: { dailyLogs: { orderBy: { date: "desc" }, take: 5 } },
            orderBy: { createdAt: "desc" },
        });
    },

    async findById(id: string) {
        return prisma.vehicle.findUnique({
            where: { id },
            include: { dailyLogs: { orderBy: { date: "desc" } } },
        });
    },

    async findByPlate(plate: string) {
        return prisma.vehicle.findUnique({
            where: { plate },
        });
    },

    async findNearMaintenance() {
        return prisma.vehicle.findMany({
            where: {
                totalKm: { gte: 9000 },
                status: "ACTIVO",
            },
            orderBy: { totalKm: "desc" },
        });
    },

    async create(data: CreateVehicleDTO) {
        return prisma.vehicle.create({
            data: {
                economicNumber: data.economicNumber,
                plate: data.plate,
                brand: data.brand,
                model: data.model,
                year: data.year,
                status: data.status as VehicleStatus,
            },
        });
    },

    async update(id: string, data: Partial<CreateVehicleDTO>) {
        return prisma.vehicle.update({
            where: { id },
            data: {
                ...data,
                status: data.status as VehicleStatus | undefined,
            },
        });
    },

    async delete(id: string) {
        return prisma.vehicle.delete({
            where: { id },
        });
    },

    async addDailyLog(data: CreateDailyLogDTO) {
        const log = await prisma.dailyLog.create({
            data: {
                vehicleId: data.vehicleId,
                date: new Date(data.date),
                entryTime: new Date(`${data.date}T${data.entryTime}`),
                exitTime: data.exitTime
                    ? new Date(`${data.date}T${data.exitTime}`)
                    : null,
                kmToday: data.kmToday,
                notes: data.notes || null,
            },
        });

        await prisma.vehicle.update({
            where: { id: data.vehicleId },
            data: {
                totalKm: { increment: data.kmToday },
            },
        });

        return log;
    },

    async getDailyLogs(vehicleId: string) {
        return prisma.dailyLog.findMany({
            where: { vehicleId },
            orderBy: { date: "desc" },
        });
    },
};
