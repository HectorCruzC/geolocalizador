"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { DiagramaInteractvo } from "./DiagramViewer";

const DiagramViewer = dynamic(
    () => import("./DiagramViewer").then((mod) => mod.DiagramViewer),
    { ssr: false }
);
import type { ElectricalComponentDTO } from "@/types/component";

interface DiagramManagerProps {
    onNavigateToComponent: (componentCode: string) => void;
}

export function DiagramManager({ onNavigateToComponent }: DiagramManagerProps) {
    const [diagrams, setDiagrams] = useState<DiagramaInteractvo[]>([]);
    const [selectedDiagram, setSelectedDiagram] = useState<DiagramaInteractvo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // En un caso real, esto se cargaría de la base de datos al iniciar
    // Para el MVP, expondremos un botón que fetchea los diagramas disponibles
    const loadDiagrams = async () => {
        setIsLoading(true);
        try {
            // Nota: Se requiere crear un endpoint GET /api/diagramas si se desea cargar la lista dinámicamente.
            // Por simplicidad, asumimos que este manager se usaría para listar diagramas.
            const res = await fetch("/api/diagramas/list");
            if (res.ok) {
                const data = await res.json();
                setDiagrams(data.diagramas || []);
            }
        } catch (error) {
            console.error("Error cargando diagramas", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComponenteClick = (codigoCFE: string) => {
        onNavigateToComponent(codigoCFE);
        setSelectedDiagram(null); // Cerrar diagrama al navegar
    };

    return (
        <>
            <div className="absolute top-4 right-4 z-[400]">
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen && diagrams.length === 0) loadDiagrams();
                    }}
                    className="bg-white p-2 rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
                >
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">Ver Diagramas</span>
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase">Diagramas Disponibles</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-slate-500">Cargando...</div>
                            ) : diagrams.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">No hay diagramas cargados</div>
                            ) : (
                                diagrams.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => {
                                            setSelectedDiagram(d);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left p-3 hover:bg-emerald-50 border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                        <p className="text-sm font-medium text-slate-800">{d.nombre}</p>
                                        <p className="text-xs text-slate-500">Zona: {d.zona}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedDiagram && (
                <DiagramViewer
                    diagrama={selectedDiagram}
                    onComponenteClick={handleComponenteClick}
                    onClose={() => setSelectedDiagram(null)}
                />
            )}
        </>
    );
}
