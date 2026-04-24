"use client";

import { useState, useCallback } from "react";
import type { LatLngTuple } from "leaflet";

const MAX_GPS_ACCURACY_METERS = 30;

interface RouteStep {
    instruction: string;
    distance: number;
    duration: number;
}

interface UseNavigationReturn {
    route: LatLngTuple[] | null;
    steps: RouteStep[];
    isNavigating: boolean;
    distance: string;
    duration: string;
    startNavigation: (
        from: LatLngTuple,
        to: LatLngTuple,
        gpsAccuracy: number
    ) => Promise<void>;
    stopNavigation: () => void;
    error: string | null;
}

export function useNavigation(): UseNavigationReturn {
    const [route, setRoute] = useState<LatLngTuple[] | null>(null);
    const [steps, setSteps] = useState<RouteStep[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [error, setError] = useState<string | null>(null);

    const startNavigation = useCallback(
        async (from: LatLngTuple, to: LatLngTuple, gpsAccuracy: number) => {
            try {
                setError(null);

                // Bloquear navegación si la precisión GPS es insuficiente
                if (gpsAccuracy > MAX_GPS_ACCURACY_METERS) {
                    console.warn(
                        `⚠️ Señal GPS de baja precisión (±${Math.round(gpsAccuracy)} m). ` +
                        `Trazando ruta de todos modos para fines de prueba.`
                    );
                    // return; <-- Removido para permitir pruebas en PC
                }

                setIsNavigating(true);

                const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;

                const res = await fetch(url);
                if (!res.ok) throw new Error("Error al calcular la ruta");

                const data = await res.json() as {
                    code: string;
                    routes?: Array<{
                        distance: number;
                        duration: number;
                        geometry: { coordinates: [number, number][] };
                        legs?: Array<{
                            steps?: Array<{
                                maneuver?: { instruction?: string };
                                distance: number;
                                duration: number;
                            }>;
                        }>;
                    }>;
                };

                if (data.code !== "Ok" || !data.routes?.[0]) {
                    throw new Error("No se encontró una ruta");
                }

                const routeData = data.routes[0];
                const coordinates: LatLngTuple[] =
                    routeData.geometry.coordinates.map(
                        (coord) => [coord[1], coord[0]] as LatLngTuple
                    );

                setRoute(coordinates);

                const totalDistance = routeData.distance;
                const totalDuration = routeData.duration;

                setDistance(
                    totalDistance >= 1000
                        ? `${(totalDistance / 1000).toFixed(1)} km`
                        : `${Math.round(totalDistance)} m`
                );

                const mins = Math.round(totalDuration / 60);
                setDuration(mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins} min`);

                const routeSteps: RouteStep[] =
                    routeData.legs?.[0]?.steps?.map((step) => ({
                        instruction: step.maneuver?.instruction ?? "Continuar",
                        distance: step.distance,
                        duration: step.duration,
                    })) ?? [];

                setSteps(routeSteps);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Error de navegación"
                );
                setIsNavigating(false);
            }
        },
        []
    );

    const stopNavigation = useCallback(() => {
        setRoute(null);
        setSteps([]);
        setIsNavigating(false);
        setDistance("");
        setDuration("");
        setError(null);
    }, []);

    return {
        route,
        steps,
        isNavigating,
        distance,
        duration,
        startNavigation,
        stopNavigation,
        error,
    };
}
