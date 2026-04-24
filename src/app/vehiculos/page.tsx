"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVehicles } from "@/features/vehiculos/hooks/useVehicles";
import {
    createVehicleSchema,
    createDailyLogSchema,
    VEHICLE_STATUS_LABELS,
    VEHICLE_STATUS_COLORS,
    KM_ALERT_THRESHOLD,
    KM_MAINTENANCE_THRESHOLD,
    type CreateVehicleDTO,
    type CreateVehicleInput,
    type CreateDailyLogDTO,
    type VehicleDTO,
} from "@/types/vehicle";
import { formatNumber, getKmStatus, kmUntilMaintenance } from "@/lib/utils";

export default function VehiculosPage() {
    const { vehicles, loading, error, alertVehicles, refreshVehicles, addDailyLog } = useVehicles();
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [showLogForm, setShowLogForm] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleDTO | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    return (
        <div className="h-full overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto py-8 px-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-0.5">CFE · Geolocalizador</p>
                        <h1 className="text-xl font-bold text-gray-900">Bitácora de Vehículos</h1>
                    </div>
                    <button
                        onClick={() => setShowVehicleForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition cursor-pointer border-none"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Vehículo
                    </button>
                </div>

                {/* Alerta mantenimiento */}
                {alertVehicles.length > 0 && (
                    <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900 mb-1.5">
                                {alertVehicles.length} vehículo{alertVehicles.length > 1 ? "s" : ""} próximos a mantenimiento
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {alertVehicles.map((v) => (
                                    <span key={v.id} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium">
                                        {v.plate} — {formatNumber(kmUntilMaintenance(v.totalKm))} km restantes
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(error || serverError) && (
                    <div className="mb-5 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error || serverError}
                    </div>
                )}

                {/* Modals */}
                {showVehicleForm && (
                    <VehicleFormModal
                        onClose={() => setShowVehicleForm(false)}
                        onSuccess={() => { setShowVehicleForm(false); void refreshVehicles(); }}
                        setServerError={setServerError}
                    />
                )}
                {showLogForm && (
                    <DailyLogFormModal
                        vehicleId={showLogForm}
                        onClose={() => setShowLogForm(null)}
                        onSuccess={async (data) => { const ok = await addDailyLog(data); if (ok) setShowLogForm(null); }}
                    />
                )}

                {/* Tabla */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-gray-700 mb-1">Sin vehículos registrados</p>
                        <p className="text-sm text-gray-400">Agrega el primer vehículo para comenzar</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Placa</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidad</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Año</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Km Acum.</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mant. en</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th className="px-5 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {vehicles.map((vehicle) => {
                                        const status = getKmStatus(vehicle.totalKm);
                                        return (
                                            <tr
                                                key={vehicle.id}
                                                className={`hover:bg-gray-50 transition-colors ${status === "danger" ? "bg-red-50/50" : status === "warning" ? "bg-amber-50/50" : ""}`}
                                            >
                                                <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{vehicle.economicNumber}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className="font-semibold text-gray-900">{vehicle.plate}</span>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-600">{vehicle.brand} {vehicle.model}</td>
                                                <td className="px-5 py-3.5 text-gray-400">{vehicle.year}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`font-semibold ${status === "danger" ? "text-red-600" : status === "warning" ? "text-amber-600" : "text-gray-900"}`}>
                                                        {formatNumber(vehicle.totalKm)} km
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-400 text-sm">{formatNumber(kmUntilMaintenance(vehicle.totalKm))} km</td>
                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                                                        style={{ backgroundColor: VEHICLE_STATUS_COLORS[vehicle.status] }}
                                                    >
                                                        {VEHICLE_STATUS_LABELS[vehicle.status]}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <button
                                                            onClick={() => setShowLogForm(vehicle.id)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition cursor-pointer border-none"
                                                        >
                                                            Registrar km
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedVehicle(vehicle)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition cursor-pointer border-none"
                                                        >
                                                            Detalle
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                            <span>{vehicles.length} vehículos</span>
                            <span>Mantenimiento c/ {formatNumber(KM_MAINTENANCE_THRESHOLD)} km</span>
                        </div>
                    </div>
                )}

                {selectedVehicle && (
                    <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
                )}
            </div>
        </div>
    );
}

// ─── Modal base helpers ───────────────────────────────────────────────────────

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition";
const labelCls = "block text-xs font-medium text-gray-500 mb-1.5";

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

// ─── Vehicle Form ─────────────────────────────────────────────────────────────

function VehicleFormModal({ onClose, onSuccess, setServerError }: {
    onClose: () => void;
    onSuccess: () => void;
    setServerError: (e: string | null) => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<CreateVehicleInput>({
        resolver: zodResolver(createVehicleSchema),
        defaultValues: { status: "ACTIVO" },
    });

    const onSubmit = async (data: CreateVehicleInput) => {
        try {
            setIsSubmitting(true);
            setServerError(null);
            const res = await fetch("/api/vehiculos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Error al crear vehículo"); }
            onSuccess();
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalShell title="Nuevo Vehículo" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Número Económico *</label>
                        <input {...register("economicNumber")} placeholder="V-001" className={inputCls} />
                        {errors.economicNumber && <p className="text-xs text-red-500 mt-1">{errors.economicNumber.message}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Placa *</label>
                        <input {...register("plate")} placeholder="MOR-1234" className={inputCls} />
                        {errors.plate && <p className="text-xs text-red-500 mt-1">{errors.plate.message}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Marca *</label>
                        <input {...register("brand")} placeholder="Toyota" className={inputCls} />
                        {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Modelo *</label>
                        <input {...register("model")} placeholder="Hilux" className={inputCls} />
                        {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>Año *</label>
                        <input {...register("year", { valueAsNumber: true })} type="number" placeholder="2024" className={inputCls} />
                        {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year.message}</p>}
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition cursor-pointer">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition cursor-pointer disabled:opacity-50 border-none">
                        {isSubmitting ? "Guardando..." : "Guardar vehículo"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Daily Log Form ───────────────────────────────────────────────────────────

function DailyLogFormModal({ vehicleId, onClose, onSuccess }: {
    vehicleId: string;
    onClose: () => void;
    onSuccess: (data: CreateDailyLogDTO) => Promise<void>;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<CreateDailyLogDTO>({
        resolver: zodResolver(createDailyLogSchema),
        defaultValues: { vehicleId, date: new Date().toISOString().split("T")[0] },
    });

    const onSubmit = async (data: CreateDailyLogDTO) => {
        setIsSubmitting(true);
        await onSuccess(data);
        setIsSubmitting(false);
    };

    return (
        <ModalShell title="Registro de Kilómetros" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register("vehicleId")} />
                <div>
                    <label className={labelCls}>Fecha *</label>
                    <input {...register("date")} type="date" className={inputCls} />
                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Hora de entrada *</label>
                        <input {...register("entryTime")} type="time" className={inputCls} />
                        {errors.entryTime && <p className="text-xs text-red-500 mt-1">{errors.entryTime.message}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Hora de salida</label>
                        <input {...register("exitTime")} type="time" className={inputCls} />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Km recorridos hoy *</label>
                    <input {...register("kmToday", { valueAsNumber: true })} type="number" step="0.1" placeholder="85.5" className={inputCls} />
                    {errors.kmToday && <p className="text-xs text-red-500 mt-1">{errors.kmToday.message}</p>}
                </div>
                <div>
                    <label className={labelCls}>Notas</label>
                    <textarea {...register("notes")} rows={2} placeholder="Observaciones del día..." className={`${inputCls} resize-none`} />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition cursor-pointer">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition cursor-pointer disabled:opacity-50 border-none">
                        {isSubmitting ? "Guardando..." : "Registrar"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Vehicle Detail ───────────────────────────────────────────────────────────

function VehicleDetailModal({ vehicle, onClose }: { vehicle: VehicleDTO; onClose: () => void }) {
    const status = getKmStatus(vehicle.totalKm);
    const remaining = kmUntilMaintenance(vehicle.totalKm);
    const progress = ((vehicle.totalKm % KM_MAINTENANCE_THRESHOLD) / KM_MAINTENANCE_THRESHOLD) * 100;

    const statusColor = status === "danger" ? "#dc2626" : status === "warning" ? "#d97706" : "#16a34a";

    return (
        <ModalShell title="Detalle del Vehículo" onClose={onClose}>
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                        ["Nro. Económico", vehicle.economicNumber],
                        ["Placa", vehicle.plate],
                        ["Marca", vehicle.brand],
                        ["Modelo", vehicle.model],
                        ["Año", vehicle.year],
                    ].map(([label, value]) => (
                        <div key={label as string}>
                            <p className="text-xs text-gray-400">{label}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                        </div>
                    ))}
                    <div>
                        <p className="text-xs text-gray-400">Estado</p>
                        <span
                            className="inline-flex items-center px-2.5 py-1 mt-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: VEHICLE_STATUS_COLORS[vehicle.status] }}
                        >
                            {VEHICLE_STATUS_LABELS[vehicle.status]}
                        </span>
                    </div>
                </div>

                {/* Barra de km */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900">Kilómetros acumulados</p>
                        <p className="text-lg font-bold" style={{ color: statusColor }}>
                            {formatNumber(vehicle.totalKm)} km
                        </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: statusColor }}
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        Próximo mantenimiento en {formatNumber(remaining)} km
                        {status === "warning" && " · Preventivo próximo"}
                        {status === "danger" && " · Mantenimiento requerido"}
                    </p>
                </div>

                <button onClick={onClose} className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition cursor-pointer border-none">
                    Cerrar
                </button>
            </div>
        </ModalShell>
    );
}
