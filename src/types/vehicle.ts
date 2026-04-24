import { z } from "zod";

export const VehicleStatusEnum = z.enum(["ACTIVO", "MANTENIMIENTO", "BAJA"]);

export type VehicleStatus = z.infer<typeof VehicleStatusEnum>;

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
    ACTIVO: "Activo",
    MANTENIMIENTO: "En Mantenimiento",
    BAJA: "Dado de Baja",
};

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
    ACTIVO: "#10B981",
    MANTENIMIENTO: "#F59E0B",
    BAJA: "#EF4444",
};

export const KM_MAINTENANCE_THRESHOLD = 10000;
export const KM_ALERT_THRESHOLD = 9000;

export const createVehicleSchema = z.object({
    economicNumber: z
        .string()
        .min(1, "El número económico es obligatorio")
        .max(20, "Máximo 20 caracteres"),
    plate: z
        .string()
        .min(1, "La placa es obligatoria")
        .max(15, "Máximo 15 caracteres"),
    brand: z
        .string()
        .min(1, "La marca es obligatoria")
        .max(50, "Máximo 50 caracteres"),
    model: z
        .string()
        .min(1, "El modelo es obligatorio")
        .max(50, "Máximo 50 caracteres"),
    year: z
        .number({ error: "Año inválido" })
        .int("Debe ser entero")
        .min(1990, "Mínimo 1990")
        .max(2030, "Máximo 2030"),
    status: VehicleStatusEnum.default("ACTIVO"),
});

export type CreateVehicleDTO = z.infer<typeof createVehicleSchema>;
export type CreateVehicleInput = z.input<typeof createVehicleSchema>;

export const createDailyLogSchema = z.object({
    vehicleId: z.string().min(1, "El vehículo es obligatorio"),
    date: z.string().min(1, "La fecha es obligatoria"),
    entryTime: z.string().min(1, "La hora de entrada es obligatoria"),
    exitTime: z.string().optional().or(z.literal("")),
    kmToday: z
        .number({ error: "Kilómetros inválidos" })
        .min(0, "Debe ser positivo"),
    notes: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
});

export type CreateDailyLogDTO = z.infer<typeof createDailyLogSchema>;

export interface VehicleDTO {
    id: string;
    economicNumber: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    totalKm: number;
    status: VehicleStatus;
    createdAt: string;
    updatedAt: string;
}

export interface DailyLogDTO {
    id: string;
    vehicleId: string;
    date: string;
    entryTime: string;
    exitTime: string | null;
    kmToday: number;
    notes: string | null;
    createdAt: string;
}
