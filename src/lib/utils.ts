/**
 * Sanitiza un string removiendo tags HTML para prevenir XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

/**
 * Formatea un número con separador de miles
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat("es-MX").format(num);
}

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(isoDate));
}

/**
 * Formatea hora de un ISO date
 */
export function formatTime(isoDate: string): string {
    return new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(isoDate));
}

/**
 * Clasifica el nivel de km de un vehículo
 */
export function getKmStatus(totalKm: number): "normal" | "warning" | "danger" {
    if (totalKm >= 10000) return "danger";
    if (totalKm >= 9000) return "warning";
    return "normal";
}

/**
 * Calcula km restantes para mantenimiento
 */
export function kmUntilMaintenance(totalKm: number): number {
    const remaining = 10000 - (totalKm % 10000);
    return remaining;
}
