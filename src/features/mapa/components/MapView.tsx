"use client";

import { useEffect, useState, useMemo } from "react";
import {
    MapContainer as LeafletMap,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { ElectricalComponentDTO } from "@/types/component";
import {
    COMPONENT_TYPE_LABELS,
    COMPONENT_TYPE_COLORS,
    COMPONENT_TYPE_ICONS,
} from "@/types/component";
import type { ComponentType } from "@/types/component";

const PUENTE_DE_IXTLA: LatLngTuple = [18.6117, -99.3104];
const DEFAULT_ZOOM = 14;

interface MapViewProps {
    components: ElectricalComponentDTO[];
    selectedComponent: ElectricalComponentDTO | null;
    route: LatLngTuple[] | null;
    userLocation: LatLngTuple | null;
    onComponentClick: (component: ElectricalComponentDTO) => void;
    onNavigate: (component: ElectricalComponentDTO) => void;
}

function createMarkerIcon(type: ComponentType): L.DivIcon {
    const color = COMPONENT_TYPE_COLORS[type];
    const icon = COMPONENT_TYPE_ICONS[type];

    return L.divIcon({
        className: "component-marker",
        html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
    ">${icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
    });
}

function FlyToComponent({
    component,
}: {
    component: ElectricalComponentDTO | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (component) {
            map.flyTo([component.latitude, component.longitude], 17, {
                duration: 1.5,
            });
        }
    }, [component, map]);

    return null;
}

function FitRoute({ route }: { route: LatLngTuple[] | null }) {
    const map = useMap();

    useEffect(() => {
        if (route && route.length > 0) {
            const bounds = L.latLngBounds(route);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, map]);

    return null;
}

export function MapView({
    components,
    selectedComponent,
    route,
    userLocation,
    onComponentClick,
    onNavigate,
}: MapViewProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [confirmNavigationComponent, setConfirmNavigationComponent] = useState<ElectricalComponentDTO | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const markerIcons = useMemo(() => {
        const icons: Partial<Record<ComponentType, L.DivIcon>> = {};
        const types: ComponentType[] = [
            "RESTAURADOR",
            "SECCIONADOR",
            "CUCHILLA_POLAR",
            "CUCHILLA_OPERACION_GRUPO",
            "CUCHILLA_UNIPOLAR",
            "FUSIBLE_RAMAL",
        ];
        types.forEach((type) => {
            icons[type] = createMarkerIcon(type);
        });
        return icons;
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-full bg-[var(--cfe-gray-100)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[var(--cfe-green)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--cfe-gray-500)]">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <LeafletMap
            center={PUENTE_DE_IXTLA}
            zoom={DEFAULT_ZOOM}
            className="w-full h-full"
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToComponent component={selectedComponent} />
            <FitRoute route={route} />

            {components.map((comp) => (
                <Marker
                    key={comp.id}
                    position={[comp.latitude, comp.longitude]}
                    icon={markerIcons[comp.type]}
                    eventHandlers={{
                        click: () => onComponentClick(comp),
                    }}
                >
                    <Popup>
                        <div className="p-3 min-w-[260px]">
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                                    style={{
                                        backgroundColor: COMPONENT_TYPE_COLORS[comp.type],
                                    }}
                                >
                                    {COMPONENT_TYPE_ICONS[comp.type]}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--cfe-gray-900)] m-0">
                                        {COMPONENT_TYPE_LABELS[comp.type]}
                                    </p>
                                    <p className="text-xs text-[var(--cfe-gray-500)] m-0 font-mono">
                                        {comp.code}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1 text-xs mb-3">
                                <div className="flex justify-between">
                                    <span className="text-[var(--cfe-gray-500)]">Nombre:</span>
                                    <span className="font-medium">{comp.name}</span>
                                </div>
                                {comp.alias && (
                                    <div className="flex justify-between">
                                        <span className="text-[var(--cfe-gray-500)]">Alias:</span>
                                        <span className="font-medium">{comp.alias}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-[var(--cfe-gray-500)]">Marca:</span>
                                    <span className="font-medium">{comp.brand}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--cfe-gray-500)]">Icc:</span>
                                    <span className="font-medium">{comp.icc} kA</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--cfe-gray-500)]">Barrido:</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${comp.swept
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {comp.swept ? "Sí" : "No"}
                                    </span>
                                </div>
                            </div>
                            
                            {/* FIX 5: Mostrar fecha de actualización y advertencia si es antigua */}
                            {comp.updatedAt && (() => {
                                const diffDays = Math.floor((new Date().getTime() - new Date(comp.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
                                const timeStr = formatDistanceToNow(new Date(comp.updatedAt), { addSuffix: true, locale: es });
                                const colorClass = diffDays > 90 ? "text-red-600 bg-red-50" : diffDays > 30 ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50";
                                
                                return (
                                    <div className={`mt-2 mb-3 p-2 rounded-lg text-xs font-medium border border-transparent ${diffDays > 90 ? 'border-red-200' : diffDays > 30 ? 'border-amber-200' : 'border-green-200'} ${colorClass}`}>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>Actualizado: {timeStr}</span>
                                        </div>
                                        {diffDays > 90 && (
                                            <p className="mt-1 mb-0 text-[10px] leading-tight text-red-700 font-bold">
                                                ⚠️ Datos posiblemente desactualizados. Verificar antes de operar la red.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            {comp.imageUrl && (
                                <img
                                    src={comp.imageUrl}
                                    alt={comp.name}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                            )}

                            {/* FIX 1: En lugar de navegar directamente, abrir modal de confirmación */}
                            <button
                                onClick={() => setConfirmNavigationComponent(comp)}
                                className="w-full py-2 bg-[var(--cfe-green)] text-white text-sm font-medium rounded-lg hover:bg-[var(--cfe-green-dark)] transition-colors cursor-pointer border-none"
                            >
                                🧭 Navegar hacia aquí
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={L.divIcon({
                        className: "user-location-marker",
                        html: `<div style="
                            background: #3B82F6;
                            width: 16px;
                            height: 16px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
                        "></div>`,
                        iconSize: [22, 22],
                        iconAnchor: [11, 11],
                    })}
                >
                    <Popup>Tu ubicación actual</Popup>
                </Marker>
            )}

            {route && (
                <Polyline
                    positions={route}
                    pathOptions={{
                        color: "var(--cfe-green)",
                        weight: 5,
                        opacity: 0.8,
                    }}
                />
            )}

            {/* FIX 1: Modal de confirmación de navegación */}
            {confirmNavigationComponent && (
                <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ fontFamily: "inherit" }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-red-600 p-4 text-white text-center">
                            <svg className="w-12 h-12 mx-auto mb-2 text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-xl font-bold">Confirmar Destino</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm font-medium text-gray-800 text-center mb-4">
                                ¿Estás seguro de que deseas navegar al siguiente componente? Un error podría tener consecuencias graves.
                            </p>
                            
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mb-5">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tipo de Componente</p>
                                    <p className="text-sm font-semibold text-gray-900">{COMPONENT_TYPE_LABELS[confirmNavigationComponent.type]}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Código</p>
                                        <p className="text-sm font-mono font-bold text-blue-700">{confirmNavigationComponent.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">ICC</p>
                                        <p className="text-sm font-semibold text-gray-900">{confirmNavigationComponent.icc} kA</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Nombre</p>
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{confirmNavigationComponent.name}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setConfirmNavigationComponent(null)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => {
                                        onNavigate(confirmNavigationComponent);
                                        setConfirmNavigationComponent(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition cursor-pointer border-none shadow-md shadow-red-600/20"
                                >
                                    Confirmar Ruta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LeafletMap>
    );
}
