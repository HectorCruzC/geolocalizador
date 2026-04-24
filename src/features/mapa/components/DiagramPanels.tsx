"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { DiagramaInteractvo } from "./DiagramViewer";

const DiagramViewer = dynamic(
    () => import("./DiagramViewer").then((mod) => mod.DiagramViewer),
    { ssr: false }
);

interface DiagramsLeftPanelProps {
    selectedDiagram: DiagramaInteractvo | null;
    onSelectDiagram: (d: DiagramaInteractvo) => void;
}

export function DiagramsLeftPanel({ selectedDiagram, onSelectDiagram }: DiagramsLeftPanelProps) {
    const [diagrams, setDiagrams] = useState<DiagramaInteractvo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/diagramas/list")
            .then((r) => r.json())
            .then((data) => setDiagrams(data.diagramas || []))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="px-4 py-3.5 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Diagramas</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : diagrams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-xs text-gray-400">Sin diagramas cargados</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-0.5">
                        {diagrams.map((d) => {
                            const isSelected = selectedDiagram?.id === d.id;
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => onSelectDiagram(d)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer group ${isSelected
                                            ? "bg-green-50 text-green-800"
                                            : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isSelected ? "bg-green-500" : "bg-gray-300"}`} />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium leading-snug truncate ${isSelected ? "text-green-800" : "text-gray-800"}`}>
                                                {d.nombre}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Zona {d.zona}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Panel derecho: componentes del diagrama ──────────────────────────────────

interface DiagramComponentsPanelProps {
    diagram: DiagramaInteractvo;
    onNavigateToComponent: (code: string) => void;
    onViewDiagram: () => void;
}

export function DiagramComponentsPanel({
    diagram,
    onNavigateToComponent,
    onViewDiagram,
}: DiagramComponentsPanelProps) {
    return (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                    Diagrama seleccionado
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">{diagram.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">Zona {diagram.zona}</p>
            </div>

            {/* Ver PDF */}
            <div className="px-3 py-2.5 border-b border-gray-100">
                <button
                    onClick={onViewDiagram}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition cursor-pointer border-none"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ver plano PDF
                </button>
            </div>

            {/* Lista de componentes */}
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Componentes · {diagram.componentesInteractivos.length}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {diagram.componentesInteractivos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                        <p className="text-xs text-gray-400">Este diagrama no tiene componentes registrados</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-0.5">
                        {diagram.componentesInteractivos.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={() => onNavigateToComponent(comp.codigoCFE)}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 bg-green-50 border border-green-200 rounded-md flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-800 truncate leading-tight">{comp.codigoCFE}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Ubicar en mapa →</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
