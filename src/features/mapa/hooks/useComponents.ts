"use client";

import { useState, useCallback, useEffect } from "react";
import type {
    ElectricalComponentDTO,
    ComponentType,
} from "@/types/component";

interface UseComponentsReturn {
    components: ElectricalComponentDTO[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedType: ComponentType | null;
    setSelectedType: (type: ComponentType | null) => void;
    filteredComponents: ElectricalComponentDTO[];
    selectedComponent: ElectricalComponentDTO | null;
    setSelectedComponent: (c: ElectricalComponentDTO | null) => void;
    refreshComponents: () => Promise<void>;
}

export function useComponents(): UseComponentsReturn {
    const [components, setComponents] = useState<ElectricalComponentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
    const [selectedComponent, setSelectedComponent] =
        useState<ElectricalComponentDTO | null>(null);

    const fetchComponents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/componentes");
            if (!res.ok) throw new Error("Error al cargar componentes");
            const data: ElectricalComponentDTO[] = await res.json();
            setComponents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchComponents();
    }, [fetchComponents]);

    const filteredComponents = components.filter((c) => {
        const matchesSearch =
            !searchQuery ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.alias?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !selectedType || c.type === selectedType;
        return matchesSearch && matchesType;
    });

    return {
        components,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        selectedType,
        setSelectedType,
        filteredComponents,
        selectedComponent,
        setSelectedComponent,
        refreshComponents: fetchComponents,
    };
}
