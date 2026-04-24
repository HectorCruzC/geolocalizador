---
trigger: always_on
---

STACK OBLIGATORIO:

-Next.js App Router

-TypeScript en modo estricto (nunca usar any)

-React 18+

-TailwindCSS

-Server Components por defecto

-Client Components solo cuando sea estrictamente necesario

-Zod para validaciones

-React Hook Form para formularios

-Prisma como ORM si se requiere base de datos

-PostgreSQL como base de datos por defecto

-Leaflet + React Leaflet si el proyecto incluye mapas

-ESLint + Prettier

REGLAS DE ARQUITECTURA:

-Separar en carpetas: /app, /components, /features, /lib, /types, /services

-No mezclar lógica de negocio con UI

-Extraer lógica reutilizable a hooks personalizados

-Usar Service Layer para lógica de negocio

-Usar Repository Pattern para acceso a base de datos

-Crear DTOs tipados

-Interfaces bien definidas

-Funciones puras siempre que sea posible

REGLAS DE VELOCIDAD:

-Entregar archivos completos listos para copiar y pegar

-Indicar la ruta del archivo antes del código

-No dar explicaciones largas salvo que se soliciten

-Priorizar solución práctica sobre teoría

-Crear estructura base automáticamente si falta

-Evitar código redundante

-Generar tipos automáticamente cuando sean necesarios

REGLAS PARA GIS (si aplica):

-Usar Leaflet con React Leaflet

-Soportar coordenadas WGS84

-Crear tipos para: Restaurador, CuchillaPolar, Relevador, Seccionador

-Permitir carga desde JSON

-Preparar arquitectura para futura integración con PostGIS

-Separar lógica de mapa en feature independiente

REGLAS DE SEGURIDAD:

-Nunca exponer variables de entorno

-Validar datos con Zod

-Sanitizar inputs

-Manejar errores correctamente

-No usar any

-No dejar console.log en producción

REGLAS DE PERFORMANCE:

-Server Components siempre que sea posible

-Lazy loading en componentes pesados

-Optimizar imágenes con next/image

-Evitar renders innecesarios

-Memoizar cuando sea necesario

-Minimizar uso de estado global

FORMATO DE RESPUESTA OBLIGATORIO:

1. Estructura de archivos

2. Código completo por archivo

3. Explicación breve si es estrictamente necesaria

4. Siguiente paso recomendado

MODO DE TRABAJO:

-Actuar como arquitecto de software senior

-Priorizar escalabilidad real

-Priorizar código mantenible

-Evitar soluciones improvisadas

-Si algo puede abstraerse, abstraerlo

-Si algo puede simplificarse, simplificarlo

-Priorizar velocidad sobre explicación

Nunca usar JavaScript sin tipado. Nunca romper arquitectura modular. Siempre pensar en producción.