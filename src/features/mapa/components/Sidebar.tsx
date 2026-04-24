"use client";

import { useState } from "react";
import type { ElectricalComponentDTO, ComponentType } from "@/types/component";
import {
    COMPONENT_TYPE_LABELS,
    COMPONENT_TYPE_COLORS,
} from "@/types/component";

interface SidebarProps {
    components: ElectricalComponentDTO[];
    searchQuery: string;
    onSearchChange: (q: string) => void;
    selectedType: ComponentType | null;
    onTypeChange: (type: ComponentType | null) => void;
    onComponentSelect: (component: ElectricalComponentDTO) => void;
    isNavigating: boolean;
    distance: string;
    duration: string;
    onStopNavigation: () => void;
}

const ALL_TYPES: ComponentType[] = [
    "RESTAURADOR",
    "SECCIONADOR",
    "CUCHILLA_POLAR",
    "CUCHILLA_OPERACION_GRUPO",
    "CUCHILLA_UNIPOLAR",
    "FUSIBLE_RAMAL",
];

export function Sidebar({
    components,
    searchQuery,
    onSearchChange,
    selectedType,
    onTypeChange,
    onComponentSelect,
    isNavigating,
    distance,
    duration,
    onStopNavigation,
}: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0 ${isCollapsed ? "w-12" : "w-72"}`}>

            {/* Collapse */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-10 flex items-center justify-center border-b border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                title={isCollapsed ? "Expandir" : "Contraer"}
            >
                <svg className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {!isCollapsed && (
                <>
                    {/* Navegación activa */}
                    {isNavigating && (
                        <div className="mx-3 mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-semibold text-green-800">Navegando</span>
                                </div>
                                <button
                                    onClick={onStopNavigation}
                                    className="text-xs text-red-500 font-medium hover:text-red-700 transition cursor-pointer"
                                >
                                    Detener
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white rounded-lg p-2 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Distancia</p>
                                    <p className="text-sm font-bold text-gray-900">{distance}</p>
                                </div>
                                <div className="bg-white rounded-lg p-2 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tiempo</p>
                                    <p className="text-sm font-bold text-gray-900">{duration}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Búsqueda */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar componente..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="px-3 py-2.5 border-b border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Tipo</p>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => onTypeChange(null)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition border-none ${!selectedType ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            >
                                Todos
                            </button>
                            {ALL_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onTypeChange(type)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition border-none ${selectedType === type ? "text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                    style={selectedType === type ? { backgroundColor: COMPONENT_TYPE_COLORS[type] } : undefined}
                                >
                                    {COMPONENT_TYPE_LABELS[type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto">
                        {components.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-500">Sin resultados</p>
                                <p className="text-xs text-gray-400 mt-1">Ajusta los filtros de búsqueda</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                <p className="text-[10px] text-gray-400 px-2 pt-1 pb-0.5">
                                    {components.length} elemento{components.length !== 1 ? "s" : ""}
                                </p>
                                {components.map((comp) => (
                                    <button
                                        key={comp.id}
                                        onClick={() => onComponentSelect(comp)}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: COMPONENT_TYPE_COLORS[comp.type] }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                                                    {comp.name || comp.code}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                                                    {comp.code}
                                                </p>
                                            </div>
                                            <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
