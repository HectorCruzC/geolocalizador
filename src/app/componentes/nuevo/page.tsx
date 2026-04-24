"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TipoComponente =
    | "RESTAURADOR"
    | "SECCIONADOR"
    | "CUCHILLA_POLAR"
    | "CUCHILLA_OPERACION_GRUPO"
    | "CUCHILLA_UNIPOLAR"
    | "FUSIBLE_RAMAL";

const TIPO_LABELS: Record<TipoComponente, string> = {
    RESTAURADOR: "Restaurador",
    SECCIONADOR: "Seccionador",
    CUCHILLA_POLAR: "Cuchilla Polar",
    CUCHILLA_OPERACION_GRUPO: "Cuchilla Operación Grupo",
    CUCHILLA_UNIPOLAR: "Cuchilla Unipolar",
    FUSIBLE_RAMAL: "Fusible Ramal",
};

interface ComponenteManual {
    nombre: string;
    alias: string;
    latitud: string;
    longitud: string;
    marca: string;
    tipo: TipoComponente;
}

const emptyComp = (): ComponenteManual => ({
    nombre: "", alias: "", latitud: "", longitud: "", marca: "", tipo: "RESTAURADOR"
});

export default function SubirDiagramaPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [componentsData, setComponentsData] = useState<ComponenteManual[]>([emptyComp()]);

    const handleComponentChange = (index: number, field: keyof ComponenteManual, value: string) => {
        setComponentsData(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const addComponent = () => setComponentsData(prev => [...prev, emptyComp()]);
    const removeComponent = (index: number) => {
        if (componentsData.length > 1) {
            setComponentsData(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const hasEmpty = componentsData.some(c => !c.nombre || !c.latitud || !c.longitud);
        if (hasEmpty) {
            setError("Todos los componentes requieren código, latitud y longitud.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.append("componentsData", JSON.stringify(componentsData));

        try {
            const res = await fetch("/api/diagramas", { method: "POST", body: formData });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al procesar el diagrama");
            }
            router.push("/mapa");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-full bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Encabezado */}
                <div className="mb-8">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">CFE · Geolocalizador</p>
                    <h1 className="text-2xl font-bold text-gray-900">Cargar Diagrama</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sube el plano DXF y PDF, luego registra los componentes que aparecen en el diagrama.
                    </p>
                </div>

                {/* Error global */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Sección 1: Información del diagrama */}
                    <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Información del diagrama</h2>
                        </div>
                        <div className="px-6 py-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre del diagrama</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Ej: Unifilar Amacuzac"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Zona CFE</label>
                                <input
                                    type="text"
                                    name="zone"
                                    required
                                    placeholder="Ej: PTI, XCH, TLZ"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sección 2: Archivos */}
                    <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Archivos del plano</h2>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <FileField
                                label="Visualización PDF"
                                name="pdf"
                                accept=".pdf"
                                hint="Diagrama en formato legible para los operadores"
                            />
                        </div>
                    </section>

                    {/* Sección 3: Componentes */}
                    <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-800">Componentes</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Un registro por cada elemento en el diagrama</p>
                            </div>
                            <button
                                type="button"
                                onClick={addComponent}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Agregar
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {componentsData.map((comp, i) => (
                                <div key={i} className="px-6 py-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                            Componente {i + 1}
                                        </span>
                                        {componentsData.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeComponent(i)}
                                                className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Código *" >
                                            <input type="text" placeholder="Ej: 4015 R4030" required
                                                value={comp.nombre}
                                                onChange={e => handleComponentChange(i, "nombre", e.target.value)}
                                                className={inputCls} />
                                        </Field>
                                        <Field label="Alias / Nombre">
                                            <input type="text" placeholder="Ej: Huatitlan"
                                                value={comp.alias}
                                                onChange={e => handleComponentChange(i, "alias", e.target.value)}
                                                className={inputCls} />
                                        </Field>
                                        <Field label="Latitud *">
                                            <input type="number" step="any" placeholder="18.6234" required
                                                value={comp.latitud}
                                                onChange={e => handleComponentChange(i, "latitud", e.target.value)}
                                                className={inputCls} />
                                        </Field>
                                        <Field label="Longitud *">
                                            <input type="number" step="any" placeholder="-99.3287" required
                                                value={comp.longitud}
                                                onChange={e => handleComponentChange(i, "longitud", e.target.value)}
                                                className={inputCls} />
                                        </Field>
                                        <Field label="Tipo *">
                                            <select required value={comp.tipo}
                                                onChange={e => handleComponentChange(i, "tipo", e.target.value)}
                                                className={inputCls}>
                                                {(Object.keys(TIPO_LABELS) as TipoComponente[]).map(t => (
                                                    <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Marca">
                                            <input type="text" placeholder="Ej: NOJA, COOPER"
                                                value={comp.marca}
                                                onChange={e => handleComponentChange(i, "marca", e.target.value)}
                                                className={inputCls} />
                                        </Field>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Acciones */}
                    <div className="flex gap-3 pb-8">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Procesando diagrama...
                                </>
                            ) : (
                                "Cargar y procesar plano"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

const inputCls = "w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function FileField({ label, name, accept, hint }: { label: string; name: string; accept: string; hint: string }) {
    return (
        <div className="flex items-start gap-4 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-0.5">{label}</p>
                <p className="text-xs text-gray-400 mb-2">{hint}</p>
                <input
                    type="file"
                    name={name}
                    accept={accept}
                    required
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-700 file:transition file:cursor-pointer"
                />
            </div>
        </div>
    );
}
