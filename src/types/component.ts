import { z } from "zod";

// Bounding box del área de operación: Puente de Ixtla, Morelos (±~8 km)
export const OPERATION_AREA = {
  lat: { min: 18.53, max: 18.70 },
  lng: { min: -99.42, max: -99.22 },
  label: "Puente de Ixtla, Morelos",
} as const;

export const ComponentTypeEnum = z.enum([
  "RESTAURADOR",
  "SECCIONADOR",
  "CUCHILLA_POLAR",
  "CUCHILLA_OPERACION_GRUPO",
  "CUCHILLA_UNIPOLAR",
  "FUSIBLE_RAMAL",
]);

export type ComponentType = z.infer<typeof ComponentTypeEnum>;

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  RESTAURADOR: "Restaurador",
  SECCIONADOR: "Seccionador",
  CUCHILLA_POLAR: "Cuchilla Polar",
  CUCHILLA_OPERACION_GRUPO: "Cuchilla de Operación en Grupo",
  CUCHILLA_UNIPOLAR: "Cuchilla Unipolar",
  FUSIBLE_RAMAL: "Fusible de Ramal",
};

export const COMPONENT_TYPE_ICONS: Record<ComponentType, string> = {
  RESTAURADOR: "⚡",
  SECCIONADOR: "🔌",
  CUCHILLA_POLAR: "❄️",
  CUCHILLA_OPERACION_GRUPO: "⚙️",
  CUCHILLA_UNIPOLAR: "🔧",
  FUSIBLE_RAMAL: "🔥",
};

export const COMPONENT_TYPE_COLORS: Record<ComponentType, string> = {
  RESTAURADOR: "#EF4444",
  SECCIONADOR: "#3B82F6",
  CUCHILLA_POLAR: "#8B5CF6",
  CUCHILLA_OPERACION_GRUPO: "#F59E0B",
  CUCHILLA_UNIPOLAR: "#10B981",
  FUSIBLE_RAMAL: "#EC4899",
};

export const createComponentSchema = z.object({
  type: ComponentTypeEnum,
  code: z
    .string()
    .min(1, "El código es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  alias: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  brand: z
    .string()
    .min(1, "La marca es obligatoria")
    .max(100, "Máximo 100 caracteres"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  latitude: z
    .number()
    .min(OPERATION_AREA.lat.min, `Latitud fuera del área de operación (${OPERATION_AREA.label})`)
    .max(OPERATION_AREA.lat.max, `Latitud fuera del área de operación (${OPERATION_AREA.label})`),
  longitude: z
    .number()
    .min(OPERATION_AREA.lng.min, `Longitud fuera del área de operación (${OPERATION_AREA.label})`)
    .max(OPERATION_AREA.lng.max, `Longitud fuera del área de operación (${OPERATION_AREA.label})`),
  icc: z
    .number({ error: "Corriente de cortocircuito inválida" })
    .min(0, "Debe ser positivo"),
  swept: z.boolean().default(false),
});

export type CreateComponentDTO = z.infer<typeof createComponentSchema>;
export type CreateComponentInput = z.input<typeof createComponentSchema>;

export interface ElectricalComponentDTO {
  id: string;
  type: ComponentType;
  code: string;
  name: string;
  alias: string | null;
  brand: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  icc: number;
  swept: boolean;
  createdAt: string;
  updatedAt: string;
}
