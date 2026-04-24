"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { DiagramsLeftPanel, DiagramComponentsPanel } from "@/features/mapa/components/DiagramPanels";
import { useComponents } from "@/features/mapa/hooks/useComponents";
import { useNavigation } from "@/features/mapa/hooks/useNavigation";
import type { DiagramaInteractvo } from "@/features/mapa/components/DiagramViewer";
import type { ElectricalComponentDTO } from "@/types/component";
import type { LatLngTuple } from "leaflet";

const MapView = dynamic(
    () => import("@/features/mapa/components/MapView").then((mod) => mod.MapView),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Cargando mapa...</p>
                </div>
            </div>
        ),
    }
);

const DiagramViewer = dynamic(
    () => import("@/features/mapa/components/DiagramViewer").then((mod) => mod.DiagramViewer),
    { ssr: false }
);

export default function MapaPage() {
    const {
        filteredComponents,
        selectedComponent,
        setSelectedComponent,
    } = useComponents();

    const {
        route,
        isNavigating,
        distance,
        duration,
        startNavigation,
        stopNavigation,
    } = useNavigation();

    const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
    const [selectedDiagram, setSelectedDiagram] = useState<DiagramaInteractvo | null>(null);
    const [showPdfViewer, setShowPdfViewer] = useState(false);

    const handleNavigate = useCallback(
        (component: ElectricalComponentDTO) => {
            if (typeof navigator !== "undefined" && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const loc: LatLngTuple = [position.coords.latitude, position.coords.longitude];
                        setUserLocation(loc);
                        void startNavigation(loc, [component.latitude, component.longitude], position.coords.accuracy);
                    },
                    () => {
                        const fallback: LatLngTuple = [18.6117, -99.3104];
                        setUserLocation(fallback);
                        void startNavigation(fallback, [component.latitude, component.longitude], 999); // Error de GPS simulado
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                const fallback: LatLngTuple = [18.6117, -99.3104];
                setUserLocation(fallback);
                void startNavigation(fallback, [component.latitude, component.longitude], 999); // Error de GPS simulado
            }
        },
        [startNavigation]
    );

    const handleNavigateToComponentByCode = useCallback((codigoCFE: string) => {
        const comp = filteredComponents.find((c) => c.code.toLowerCase() === codigoCFE.toLowerCase());
        if (comp) {
            setSelectedComponent(comp);
        }
    }, [filteredComponents, setSelectedComponent]);

    return (
        <div className="flex h-full">

            {/* Panel izquierdo: lista de diagramas */}
            <DiagramsLeftPanel
                selectedDiagram={selectedDiagram}
                onSelectDiagram={(d) => {
                    setSelectedDiagram(d);
                    setShowPdfViewer(false);
                }}
            />

            {/* Centro: mapa */}
            <div className="flex-1 relative">
                <MapView
                    components={filteredComponents}
                    selectedComponent={selectedComponent}
                    route={route}
                    userLocation={userLocation}
                    onComponentClick={setSelectedComponent}
                    onNavigate={handleNavigate}
                />

                {/* Navegación activa (badge flotante) */}
                {isNavigating && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-gray-800">Navegando</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span><strong>{distance}</strong></span>
                            <span><strong>{duration}</strong></span>
                        </div>
                        <button
                            onClick={stopNavigation}
                            className="text-xs text-red-500 font-medium hover:text-red-700 transition cursor-pointer"
                        >
                            Detener
                        </button>
                    </div>
                )}

                {/* Status bar */}
                <div className="absolute bottom-0 left-0 right-0 h-7 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-400 z-10">
                    <span>{filteredComponents.length} componente{filteredComponents.length !== 1 ? "s" : ""}</span>
                    <span>Puente de Ixtla, Morelos</span>
                </div>
            </div>

            {/* Panel derecho: componentes del diagrama seleccionado */}
            {selectedDiagram && (
                <DiagramComponentsPanel
                    diagram={selectedDiagram}
                    onNavigateToComponent={handleNavigateToComponentByCode}
                    onViewDiagram={() => setShowPdfViewer(true)}
                />
            )}

            {/* Visor PDF (modal) */}
            {showPdfViewer && selectedDiagram && (
                <DiagramViewer
                    diagrama={selectedDiagram}
                    onComponenteClick={(code) => {
                        handleNavigateToComponentByCode(code);
                        setShowPdfViewer(false);
                    }}
                    onClose={() => setShowPdfViewer(false)}
                />
            )}
        </div>
    );
}
