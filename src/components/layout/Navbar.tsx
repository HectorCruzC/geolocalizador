"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    {
        href: "/mapa",
        label: "Mapa",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
    },
    {
        href: "/vehiculos",
        label: "Vehículos",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16H2m11 0h4m4 0h-4m0 0V9.5L16 6h-3" />
            </svg>
        ),
    },
    {
        href: "/diagramas",
        label: "Diagramas",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
    },
    {
        href: "/componentes/nuevo",
        label: "Cargar Componente",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        ),
    },
] as const;

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0">
            <Link href="/mapa" className="flex items-center gap-3 no-underline group">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs tracking-tight">CFE</span>
                </div>
                <div className="hidden sm:block leading-none">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">Geolocalizador</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Puente de Ixtla, Morelos</p>
                </div>
            </Link>

            <div className="flex items-center gap-0.5">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-150
                                ${isActive
                                    ? "bg-green-50 text-green-700"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                }
                            `}
                        >
                            {item.icon}
                            <span className="hidden md:inline">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
