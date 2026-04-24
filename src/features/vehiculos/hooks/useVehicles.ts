"use client";

import { useState, useCallback, useEffect } from "react";
import type { VehicleDTO, CreateDailyLogDTO } from "@/types/vehicle";
import { KM_ALERT_THRESHOLD } from "@/types/vehicle";

interface UseVehiclesReturn {
    vehicles: VehicleDTO[];
    loading: boolean;
    error: string | null;
    alertVehicles: VehicleDTO[];
    refreshVehicles: () => Promise<void>;
    addDailyLog: (data: CreateDailyLogDTO) => Promise<boolean>;
}

export function useVehicles(): UseVehiclesReturn {
    const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/vehiculos");
            if (!res.ok) throw new Error("Error al cargar vehículos");
            const data: VehicleDTO[] = await res.json();
            setVehicles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchVehicles();
    }, [fetchVehicles]);

    const alertVehicles = vehicles.filter(
        (v) => v.totalKm >= KM_ALERT_THRESHOLD && v.status === "ACTIVO"
    );

    const addDailyLog = useCallback(
        async (data: CreateDailyLogDTO): Promise<boolean> => {
            try {
                const res = await fetch(`/api/vehiculos/${data.vehicleId}/registros`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Error al registrar");
                }
                await fetchVehicles();
                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
                return false;
            }
        },
        [fetchVehicles]
    );

    return {
        vehicles,
        loading,
        error,
        alertVehicles,
        refreshVehicles: fetchVehicles,
        addDailyLog,
    };
}
