"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import JSZip from "jszip";
import { kml } from "@tmcw/togeojson";
import type { ElectricalComponentDTO, ComponentType } from "@/types/component";
import { COMPONENT_TYPE_LABELS, COMPONENT_TYPE_COLORS, COMPONENT_TYPE_ICONS } from "@/types/component";

const PUENTE_DE_IXTLA: [number, number] = [18.6117, -99.3104];
const DEFAULT_ZOOM = 14;

interface KmzMapProps {
    components?: ElectricalComponentDTO[];
    selectedComponent?: ElectricalComponentDTO | null;
    onNavigate?: (component: ElectricalComponentDTO) => void;
}

function createMarkerIcon(type: ComponentType): L.DivIcon {
    const color = COMPONENT_TYPE_COLORS[type];
    const icon = COMPONENT_TYPE_ICONS[type];

    return L.divIcon({
        className: "component-marker",
        html: `<div style="
            background: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
        ">${icon}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
    });
}

function MapFocusHandler({ selectedComponent, components }: { selectedComponent?: ElectricalComponentDTO | null, components: ElectricalComponentDTO[] }) {
    const map = useMap();
    
    useEffect(() => {
        if (selectedComponent && map) {
            map.flyTo([selectedComponent.latitude, selectedComponent.longitude], 18, {
                animate: true,
                duration: 1.5,
            });
        }
    }, [selectedComponent, map]);

    return null;
}

export function KmzDiagramMap({ components = [], selectedComponent = null, onNavigate }: KmzMapProps) {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [confirmNav, setConfirmNav] = useState<ElectricalComponentDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadKmz() {
            try {
                // Fetch the static KMZ file from public directory
                const response = await fetch("/diagramas.kmz");
                if (!response.ok) {
                    throw new Error("No se encontró el archivo diagramas.kmz en la carpeta public/. Por favor agrégalo.");
                }
                const blob = await response.blob();
                
                // Unzip KMZ
                const zip = await JSZip.loadAsync(blob);
                
                // Find KML file inside zip
                const kmlFile = Object.keys(zip.files).find(name => name.toLowerCase().endsWith(".kml"));
                
                if (!kmlFile) {
                    throw new Error("No se encontró archivo KML dentro del KMZ.");
                }

                // Extract KML text
                const kmlText = await zip.files[kmlFile].async("text");
                
                // Parse KML to DOM
                const dom = new DOMParser().parseFromString(kmlText, "text/xml");
                
                // Convert to GeoJSON
                const converted = kml(dom);
                
                // Opcional: Filtrar puntos si son demasiados y no aportan a la línea del diagrama
                // converted.features = converted.features.filter((f: any) => f.geometry?.type !== "Point");
                
                setGeoJsonData(converted);
            } catch (err: any) {
                console.error("Error loading KMZ:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadKmz();
    }, []);

    // Custom styles for GeoJSON
    const onEachFeature = (feature: any, layer: any) => {
        if (feature.properties && feature.properties.name) {
            layer.bindPopup(`<b>${feature.properties.name}</b><br/>${feature.properties.description || ""}`);
        }
    };
    
    // Convert default markers to lightweight circle markers to boost performance and fix broken icons
    const pointToLayer = (feature: any, latlng: L.LatLng) => {
        return L.circleMarker(latlng, {
            radius: 3,
            fillColor: "#16a34a",
            color: "#ffffff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    };

    if (loading) {
        return (
            <div className="w-full h-full bg-[var(--cfe-gray-100)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[var(--cfe-green)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm shadow-sm font-medium text-gray-500">Cargando diagramas unifilares y optimizando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={PUENTE_DE_IXTLA}
                zoom={DEFAULT_ZOOM}
                className="w-full h-full"
                zoomControl={true}
                preferCanvas={true} // Boost performance by rendering on Canvas instead of SVG/DOM
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {geoJsonData && (
                    <GeoJSON 
                        data={geoJsonData} 
                        onEachFeature={onEachFeature}
                        pointToLayer={pointToLayer}
                        style={{
                            color: "#16a34a", // CFE green approx
                            weight: 3,
                            opacity: 0.8
                        }}
                    />
                )}

                {/* Renderizar los componentes eléctricos encima del KMZ */}
                {components.map((comp) => {
                    const icon = createMarkerIcon(comp.type);
                    const isSelected = selectedComponent?.id === comp.id;
                    return (
                        <Marker
                            key={comp.id}
                            position={[comp.latitude, comp.longitude]}
                            icon={icon}
                            ref={(ref) => {
                                if (ref && isSelected) {
                                    setTimeout(() => ref.openPopup(), 1500);
                                }
                            }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="text-sm font-bold text-gray-900 m-0">{COMPONENT_TYPE_LABELS[comp.type]}</h3>
                                    <p className="text-xs text-gray-500 m-0 mb-2 font-mono">{comp.code}</p>
                                    <div className="text-xs space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Nombre:</span>
                                            <span className="font-medium">{comp.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">ICC:</span>
                                            <span className="font-medium">{comp.icc} kA</span>
                                        </div>
                                    </div>

                                    {onNavigate && (
                                        <button
                                            onClick={() => setConfirmNav(comp)}
                                            className="mt-3 w-full py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition cursor-pointer border-none"
                                        >
                                            🧭 Navegar hacia aquí
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapFocusHandler selectedComponent={selectedComponent} components={components} />
            </MapContainer>

            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg border border-red-200">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de navegación */}
            {confirmNav && onNavigate && (
                <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-green-600 p-4 text-white text-center">
                            <div className="text-3xl mb-1">🧭</div>
                            <h3 className="text-xl font-bold">Confirmar Destino</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 text-center mb-4">
                                ¿Deseas navegar hacia este componente?
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 mb-5 text-sm">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tipo</p>
                                    <p className="font-semibold text-gray-900">{COMPONENT_TYPE_LABELS[confirmNav.type]}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Código</p>
                                        <p className="font-mono font-bold text-blue-700">{confirmNav.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ICC</p>
                                        <p className="font-semibold text-gray-900">{confirmNav.icc} kA</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nombre</p>
                                    <p className="font-semibold text-gray-900">{confirmNav.name}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmNav(null)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        onNavigate(confirmNav);
                                        setConfirmNav(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition cursor-pointer border-none shadow-md shadow-green-600/20"
                                >
                                    Confirmar Ruta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
