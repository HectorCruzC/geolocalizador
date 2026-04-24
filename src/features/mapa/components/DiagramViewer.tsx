"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker from local public dir to avoid CDN CORS & localhost module import restrictions
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export interface DiagramaInteractvo {
    id: string;
    nombre: string;
    urlPdf: string;
    zona: string;
    componentesInteractivos: {
        id: string;
        codigoCFE: string;
        xRelativo: number;
        yRelativo: number;
    }[];
    puntosIcc?: {
        id: string;
        iccMonofasica: number;
        iccTrifasica: number;
        xRelativo: number;
        yRelativo: number;
    }[];
}

interface DiagramViewerProps {
    diagrama: DiagramaInteractvo;
    onComponenteClick: (codigoCFE: string) => void;
    onClose: () => void;
}

export function DiagramViewer({ diagrama, onComponenteClick, onClose }: DiagramViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ICC states
    const [isAddingIcc, setIsAddingIcc] = useState(false);
    const [newIccPoint, setNewIccPoint] = useState<{ xRelativo: number; yRelativo: number } | null>(null);
    const [iccMonofasicaInput, setIccMonofasicaInput] = useState("");
    const [iccTrifasicaInput, setIccTrifasicaInput] = useState("");
    const [puntosIccList, setPuntosIccList] = useState(diagrama.puntosIcc || []);
    const [isSavingIcc, setIsSavingIcc] = useState(false);

    // Card popup for viewing saved ICC points
    const [selectedIccPoint, setSelectedIccPoint] = useState<typeof puntosIccList[number] | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const handleHitboxClick = (e: React.MouseEvent, codigoCFE: string) => {
        if (isAddingIcc) return;
        e.preventDefault();
        e.stopPropagation();
        onComponenteClick(codigoCFE);
    };

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isAddingIcc) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setNewIccPoint({
            xRelativo: (x / rect.width) * 100,
            yRelativo: (y / rect.height) * 100,
        });
    };

    const handleSaveIcc = async () => {
        if (!newIccPoint || !iccMonofasicaInput || !iccTrifasicaInput) return;

        setIsSavingIcc(true);
        try {
            const res = await fetch(`/api/diagramas/${diagrama.id}/icc`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    iccMonofasica: parseFloat(iccMonofasicaInput),
                    iccTrifasica: parseFloat(iccTrifasicaInput),
                    xRelativo: newIccPoint.xRelativo,
                    yRelativo: newIccPoint.yRelativo,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setPuntosIccList([...puntosIccList, data.point]);
                setNewIccPoint(null);
                setIccMonofasicaInput("");
                setIccTrifasicaInput("");
                setIsAddingIcc(false);
            } else {
                alert("Error al guardar el punto ICC.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de red.");
        } finally {
            setIsSavingIcc(false);
        }
    };

    const handleDeleteIcc = async (pointId: string) => {
        if (!confirm("¿Eliminar este punto ICC?")) return;
        try {
            const res = await fetch(`/api/diagramas/${diagrama.id}/icc?pointId=${pointId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setPuntosIccList(puntosIccList.filter((p) => p.id !== pointId));
                if (selectedIccPoint?.id === pointId) setSelectedIccPoint(null);
            } else {
                alert("Error al eliminar el punto ICC.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{diagrama.nombre}</h3>
                        <p className="text-sm text-slate-500">Zona: {diagrama.zona}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setIsAddingIcc(!isAddingIcc);
                                setNewIccPoint(null);
                                setSelectedIccPoint(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${isAddingIcc
                                    ? "bg-amber-100 text-amber-700 border border-amber-300"
                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <span className="text-lg">⚡</span>
                            {isAddingIcc ? "Cancelar ICC" : "Añadir ICC"}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            title="Cerrar diagrama"
                        >
                            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mode indicator */}
                {isAddingIcc && (
                    <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-800 font-medium shrink-0">
                        ⚡ Haz clic en el diagrama para colocar un punto de corriente de cortocircuito.
                    </div>
                )}

                {/* Viewer Area */}
                <div className="relative flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">

                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cfe-green)] mb-4"></div>
                            <p className="text-slate-600 font-medium">Cargando plano técnico...</p>
                        </div>
                    )}

                    <div
                        className={`relative inline-block shadow-lg border border-slate-300 ${isAddingIcc ? "cursor-crosshair" : ""}`}
                        onClick={handleContainerClick}
                    >
                        <Document
                            file={diagrama.urlPdf}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading=""
                            error={
                                <div className="p-8 text-center text-red-500">
                                    ⚠️ No se pudo cargar el archivo PDF.
                                </div>
                            }
                        >
                            <Page
                                pageNumber={1}
                                renderTextLayer={false}
                                className="max-w-full"
                                width={800}
                            />
                        </Document>

                        {/* Interactive Overlay - Navigation Hitboxes */}
                        {!isLoading && diagrama.componentesInteractivos.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={(e) => handleHitboxClick(e, comp.codigoCFE)}
                                className={`absolute z-20 group hover:bg-yellow-400/40 border-2 border-transparent hover:border-yellow-500 rounded-sm transition-all shadow-[0_0_10px_rgba(250,204,21,0.5)] opacity-0 hover:opacity-100 ${isAddingIcc ? "pointer-events-none" : "cursor-pointer"}`}
                                style={{
                                    top: `calc(${comp.yRelativo}% - 20px)`,
                                    left: `calc(${comp.xRelativo}% - 20px)`,
                                    width: "40px",
                                    height: "40px",
                                }}
                                title={`Componente: ${comp.codigoCFE}`}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
                                    📍 Ubicar en mapa: {comp.codigoCFE}
                                </div>
                            </button>
                        ))}

                        {/* Interactive Overlay - ICC Points */}
                        {!isLoading && puntosIccList.map((point) => (
                            <div
                                key={point.id}
                                className="absolute z-20 flex items-center justify-center"
                                style={{
                                    top: `calc(${point.yRelativo}%)`,
                                    left: `calc(${point.xRelativo}%)`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isAddingIcc) {
                                            setSelectedIccPoint(selectedIccPoint?.id === point.id ? null : point);
                                        }
                                    }}
                                    className={`bg-amber-400 border-2 border-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-amber-900 shadow-md hover:scale-110 transition-transform cursor-pointer border-none ${isAddingIcc ? "pointer-events-none" : ""}`}
                                    title="Ver corrientes de cortocircuito"
                                >
                                    ⚡
                                </button>

                                {/* Card popup for this ICC point */}
                                {selectedIccPoint?.id === point.id && (
                                    <div
                                        className="absolute z-30 bg-white rounded-xl shadow-2xl border border-amber-200 p-4 w-52"
                                        style={{ bottom: "130%", left: "50%", transform: "translateX(-50%)" }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-base">⚡</span>
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Icc en este punto</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedIccPoint(null)}
                                                className="text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2">
                                                <span className="text-xs text-blue-700 font-semibold">Monofásica (I1)</span>
                                                <span className="text-sm font-bold text-blue-900">{point.iccMonofasica} kA</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-purple-50 rounded-lg px-3 py-2">
                                                <span className="text-xs text-purple-700 font-semibold">Trifásica (I3)</span>
                                                <span className="text-sm font-bold text-purple-900">{point.iccTrifasica} kA</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteIcc(point.id)}
                                            className="w-full py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition cursor-pointer border border-red-200"
                                        >
                                            🗑 Eliminar punto
                                        </button>

                                        {/* Arrow */}
                                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-r border-b border-amber-200 rotate-45" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Ghost pointer when placing ICC */}
                        {isAddingIcc && newIccPoint && (
                            <div
                                className="absolute z-30 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_0_4px_rgba(245,158,11,0.3)] pointer-events-none animate-pulse"
                                style={{
                                    top: `calc(${newIccPoint.yRelativo}%)`,
                                    left: `calc(${newIccPoint.xRelativo}%)`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for new ICC values */}
            {newIccPoint && (
                <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                        <h4 className="text-lg font-bold text-slate-800 mb-1">Registrar Corrientes de Cortocircuito</h4>
                        <p className="text-sm text-slate-500 mb-5">Ingresa los valores para el punto seleccionado.</p>

                        <div className="space-y-4 mb-5">
                            <div>
                                <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">
                                    ⚡ Corriente Monofásica (I1) — kA
                                </label>
                                <input
                                    type="number"
                                    autoFocus
                                    step="0.01"
                                    placeholder="Ej: 3.2"
                                    value={iccMonofasicaInput}
                                    onChange={(e) => setIccMonofasicaInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1.5">
                                    ⚡ Corriente Trifásica (I3) — kA
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Ej: 8.7"
                                    value={iccTrifasicaInput}
                                    onChange={(e) => setIccTrifasicaInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setNewIccPoint(null)}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg font-medium transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveIcc}
                                disabled={!iccMonofasicaInput || !iccTrifasicaInput || isSavingIcc}
                                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition disabled:opacity-50 border-none cursor-pointer disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
                            >
                                {isSavingIcc ? "Guardando..." : "Guardar ICC"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
