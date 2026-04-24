Instituto Tecnológico de [Nombre de tu Instituto]

Opción
Titulación Integral
Informe Técnico de Residencia Profesional

“UNIDAD REMOTA DE GEOLOCALIZACION DE EQUIPOS Y CORRIENTES DE FALLA DE CIRCUITOS”

Que para obtener el título de
Ingeniero en [Tu Carrera, ej. Sistemas Computacionales / Tecnologías de la Información]

Presenta
[Tu nombre completo]

H.H. [Ciudad, Estado] a, [Día] de [Mes] de 2026

---

# Agradecimientos

Agradezco en primer lugar a mi familia por el apoyo brindado a lo largo de toda mi trayectoria estudiantil. Todo el esfuerzo invertido en estos años tiene su origen en el respaldo material y moral que me han proporcionado en cada etapa para lograr esta meta.

A mis profesores y catedráticos del Instituto Tecnológico, por su dedicación durante toda mi formación académica; sus enseñanzas fueron determinantes para forjar mi pensamiento estructurado y técnico.

Finalmente, a la Comisión Federal de Electricidad (CFE) Zona de Distribución Puente de Ixtla, por la oportunidad brindada. Al permitir integrarme a su dinámica de trabajo, logré perfilar y aplicar conocimientos teóricos dentro de escenarios operativos reales. Agradezco también de manera especial a mi asesor externo por la confianza y por la guía técnica proporcionada mediante sus constantes aportaciones sobre el sector eléctrico.

---

# Resumen

En el presente informe se documenta el desarrollo del proyecto “UNIDAD REMOTA DE GEOLOCALIZACION DE EQUIPOS Y CORRIENTES DE FALLA DE CIRCUITOS”, llevado a cabo durante el periodo de residencia profesional en las instalaciones de la Comisión Federal de Electricidad (CFE), Zona de Distribución Puente de Ixtla, Morelos. El objetivo principal de este desarrollo fue dar solución a la latencia operativa causada por depender de planos físicos, archivos CAD y registros manuales no integrados. Estas limitaciones aumentaban significativamente los tiempos de respuesta para identificar e intervenir equipos de distribución durante mantenimientos y contingencias de campo.

Para atender esta necesidad, se diseñó e implementó un sistema de software web bajo una arquitectura de cliente-servidor (Full-Stack). En la porción del servidor, se utilizó Next.js junto con TypeScript, conectando la lógica de negocio mediante la herramienta Prisma ORM hacia una base de datos relacional PostgreSQL alojada en el servicio de nube Supabase.

La interfaz de usuario integró componentes de mapas interactivos utilizando Leaflet.js y React-Leaflet, logrando centralizar dispositivos primordiales de red (restauradores, seccionadores, cuchillas). A la par, se le incorporó una herramienta de geonavegación asistida por OSRM, la cual traza rutas vehiculares hacia el componente fallido leyendo la herramienta GPS de los navegadores móviles.

En cuanto a la infraestructura técnica analítica, el sistema es capaz de leer topologías masivas mediante archivos .KMZ. Adicionalmente, cuenta con un módulo visor de documentos para que los ingenieros registren de manera digital los valores de Corriente de Cortocircuito (ICC) Monofásicos y Trifásicos sobre los esquemas de la zona. Se agregó un apartado interno para el de seguimiento preventivo vehicular por kilometraje acumulado. Operativamente, el sistema mejora la velocidad de localización sin requerir grandes recursos del dispositivo del ingeniero limitando las pérdidas de respuesta interurbana.

---

# Contenido

1 Generalidades del proyecto
  1.1 Introducción
  1.2 Descripción de la empresa u organización
  1.3 Problemas a resolver
  1.4 Objetivos
  1.5 Justificación
  1.6 Alcance y limitaciones
2 Marco Teórico
  2.1 Sistemas de Información Geográfica y Web Mapping
  2.2 Arquitectura Client-Server en Next.js App Router
  2.3 Motores de Bases de Datos (PostgreSQL) y ORM (Prisma)
  2.4 Plataformas Database as a Service (BaaS) - Supabase
  2.5 Estándar KML/KMZ y el procesamiento de mapas del cliente
  2.6 Algoritmos de enrutamiento y la API OSRM
  2.7 TypeScript
  2.8 Framework de Servidor: Next.js
  2.9 PostgreSQL
  2.10 Supabase
  2.11 Librería Leaflet.js
3 Desarrollo
  3.1 Análisis (Levantamiento de Requerimientos y Casos de Uso)
  3.2 Diseño
  3.3 Desarrollo
  3.4 Implantación
  3.5 Pruebas
4 Resultados
5 Conclusiones y Recomendaciones
  5.1 Conclusiones del Proyecto
  5.2 Recomendaciones
  5.3 Experiencia Personal Profesional Adquirida
6 Competencias Desarrolladas y Aplicadas
Fuentes de Información
Anexos

---

# 1 Generalidades del proyecto

## 1.1 Introducción
El sector eléctrico operativo moderno exige respuestas dinámicas e ininterrumpidas. Dentro de las actividades diarias de los operarios de campo y distribución, la identificación oportuna de las fallas, la ubicación geográfica rápida de la infraestructura averiada y la consulta constante de los diagramas técnicos unifilares representan indicadores críticos dentro de las métricas de Restauración del Suministro.

Previamente, en centros de operación rurales y semiurbanos, la localización dependía de métodos manuales, basando la labor en el monitoreo de planos impresos o documentos ofimáticos inconexos. El presente informe técnico detalla la concepción total del sistema “UNIDAD REMOTA DE GEOLOCALIZACION DE EQUIPOS Y CORRIENTES DE FALLA DE CIRCUITOS”, un desarrollo creado con el objetivo principal de abastecer al personal de la CFE de mecanismos informáticos modernos para interactuar, trazar rutas y registrar valores técnicos sobre un plano digital directo desde sus teléfonos móviles.

## 1.2 Descripción de la empresa u organización
La Comisión Federal de Electricidad (CFE) es una empresa productiva perteneciente al Estado Mexicano cuyo control logístico administra la generación, transmisión, distribución y comercialización de energía a escala nacional. Este proyecto se desenvolvió operativamente en la Zona de Distribución Puente de Ixtla (Morelos), una demarcación que abarca amplios niveles de población y atiende a múltiples municipios críticos.

## 1.3 Problemas a resolver
Durante la fase técnica preliminar, se identificaron cuatro grandes rubros de carencia a intervenir obligatoriamente:
1. Problemas de Ubicación (Geolocalización inactiva): En campo, no contar con mapas actualizados en móvil para seguir un transformador elevaba drásticamente la latencia de respuesta para atender reparaciones en zonas ajenas al circuito habitual del técnico operativo.
2. Limitantes de Visualización de Hardware Portátil: Analizar documentos o mapas de alta carga vectorial generaba inconvenientes por desbordamiento de memoria sobre terminales de bajas especificaciones de los usuarios.
3. Registro ICC Unificado y Complejo: Registrar los valores picos de Corriente de Falla Monofásica versus Trifásica carecía de interfaces dinámicas, llevándose tradicionalmente en formas sueltas sin persistencia visual ligada hacia las partes vitales de un plano en imagen.
4. Ausencia de Diagnóstico Automatizado de Transportes: Se realizaban revisiones de vehículos con formatos no ligados cronológicamente a alertas centralizadas por distancia recorrida, mermando los controles mecánicos de servicio correctivo.

## 1.4 Objetivos

### 1.4.1 Objetivo general
Diseñar, estructurar e implementar una plataforma remota completa orientada geográficamente y dotada de navegación activa en dispositivos distribuidos. Esta Unidad Remota busca digitalizar a formato geo-analítico el esquema de los equipos y corrientes de falla para agilizar los trabajos logísticos en la Zona Puente de Ixtla aplicando el uso central de redes relacionales en la nube.

### 1.4.2 Objetivos específicos
- Recopilar, interpretar y modelar los datos de localización de infraestructura operables por la institución en formatos estables por base de datos tipados.
- Desarrollar un cliente visual interactivo de mapa ligero utilizando bibliotecas optimizadas para consumo de baja memoria.
- Integrar la API de geolocalización asíncrona de posicionamiento libre (OSRM) para trazar rutas vehiculares a componentes dañados.
- Construir herramientas internas que analicen matrices de archivos cartográficos en texto directo procesando KMZ.
- Elaborar componentes para capturar coordinadamente el esquema PDF de planos incluyendo variables de Corriente de Cortocircuito distribuidas.

## 1.5 Justificación
Disminuir el margen de tiempo para localización presencial significa estabilizar horas laborales por parte de la empresa, a la vez que restaura prontamente servicios energéticos directos al usuario civil. Además, estandarizando componentes informativos cartográficos dentro de un esquema móvil, el conocimiento y ubicaciones complejas geográficas dejan de ser un recuerdo personal logrando una asimilación técnica distribuible universal; lo anterior asegura capacitación instantánea si se designa personal nuevo frente al área metropolitana tratada. 

## 1.6 Alcance y limitaciones
El sistema posee funcionalidad Web (uso de APIs satelitales en Leaflet/OSRM) mediante redes o navegación local. Cubre controles, mapas, e inyectores de visualización ICC integrales de CFE Puente de Ixtla. Como limitación principal, el desarrollo precisa de una conexión telefónica o de internet regular para efectuar un trazado de ruta óptimo y obtener imágenes, puesto que no realiza indexaciones satelitales en caché estricto total (Off-grid) en sierras por limitaciones lógicas de infraestructura.


# 2 Marco Teórico

Este capítulo constituye el sustento científico y técnico de la investigación. En él se describen los fundamentos de la transformación digital en la empresa energética, la arquitectura de sistemas cliente-servidor, el uso y transacciones de bases de datos relacionales, y las herramientas tecnológicas modernas empleadas como Next.js, Supabase, y Prisma. Asimismo, se establecen las bases teóricas de ruteo y visualización que garantizan la viabilidad operativa y calidad del proyecto.

## 2.1 Transformación Digital en Sistemas de Energía y Gestión Analítica de Infraestructura
La transformación digital en el sector de servicios estratégicos (como la energía eléctrica) se define como la integración táctica de tecnologías avanzadas en todos los aspectos de la cadena de respuesta empresarial. No se trata simplemente de la adopción aislada de dispositivos tecnológicos portables, sino de una reestructuración profunda de los procesos operativos (Sánchez, 2023). Un pilar fundamental para esta transformación radica en la centralización de sus procesos geográficos; las cuadrillas de campo dependen históricamente de registros impresos o archivos fraccionados, aumentando la susceptibilidad a la latencia de respuesta frente a eventualidades. La implementación de plataformas centralizadas convierte datos sin procesar en conocimiento accionable, reduciendo el desgaste de personal, evitando desperdicios de kilómetros rodados y aportando una trazabilidad histórica de alto valor auditivo.

## 2.2 Sistemas de Información Geográfica (GIS) y Web Mapping
La técnica central de un Sistema de Información Geográfica (GIS por sus siglas en inglés) consiste en amalgamar ubicaciones operacionales de contexto real y cruzarlas analíticamente con bases de datos estáticas o dinámicas almacenadas en una computadora central (Longley, 2015). El concepto histórico del GIS ha evolucionado drásticamente, pasando de pesados paquetes de software instalados localmente hacia la modalidad de "Web Mapping". Esta modalidad permite que las bibliotecas de programación (ej. Leaflet.js) interactúen con servidores visuales de origen, procesando el globo terráqueo mediante secciones denominadas teselas (Tiles). Las teselas operan como baldosas que fraccionan la imagen del mundo y envían al usuario únicamente la porción visual requerida, economizando el consumo de datos y potenciando la fluidez del mapa sin saturar las terminales de hardware ligero.

## 2.3 Arquitectura Cliente-Servidor y Modos de Renderizado Isomorfo
La arquitectura cliente-servidor es un modelo de software donde las tareas se reparten entre proveedores de recursos, definidos como servidores (las máquinas remotas que procesan datos), y los clientes, identificados como navegadores o aplicaciones. En la época antigua de la web, sistemas tradicionales delegaban pesadas cargas gráficas topográficas hacia los celulares locales (Client-Side Rendering), congelando frecuentemente la RAM de trabajo. Con el despliegue del framework Next.js bajo la tutela de Renderizado del Lado del Servidor (SSR), las operaciones matriciales se validan en bases remotas blindadas detrás del servidor. A los clientes de campo solo se les envía respuestas de marcado HTML pre-cálculado al vuelo, eliminando brechas de inyecciones de código e impidiendo manipular lógicas críticas localmente.

## 2.4 Servicios Web, API REST y Semántica HTTP
Una API REST (Interfaz de Programación de Aplicaciones de Transferencia de Estado Representacional) es un estilo informático que faculta la comunicación interconectada entre diversos softwares empleando los estándares de la red HTTP. El ecosistema desarrollado bajo Next.js App Router expone "Endpoints" transparentes y unificados (Fielding, 2000). A través de estas rutas, el panel móvil interactúa mediante verbos semánticos: GET (consultar diagramas estáticos), POST (crear la base de un nuevo transformador ICC), PUT (actualizar kilometraje) y DELETE (erradicar nodos espurios). Al operar como agentes "Stateless" (sin estado), la API no almacena la sesión de manera residual procesando peticiones consecutivas masivas procedentes de múltiples ingenieros simultáneos sin provocar degradaciones de velocidad en las consultas satelitales.

## 2.5 Relaciones de Datos Estructurales e Integridad Referencial SQL
Una base de datos relacional organiza la información estricta operando mediante tablas interconectadas formadas por filas y columnas identificadas. Dicho diseño cobra relevancia absoluta gracias al concepto estructural de "Integridad Referencial" en conjunto a llaves foráneas (Foreign Keys). La integridad referencial asegura firmemente que los vínculos entre los esquemas de CFE permanezcan constantes e infalibles (Silberschatz et al., 2020). Prácticamente, el sistema niega rotundamente la inserción de métricas o variables sueltas (como Corrientes de Cortocircuito Tri o Monofásicas) si éstas no guardan una estricta declaración o sujeción a un componente cartográfico originario activo. Este fundamento anula enteramente la propagación perjudicial de "datos huérfanos" facilitando la consolidación segura de métricas reportadas cruzadas.

## 2.6 Principios Resolutivos en Transacciones de Red y Propiedades ACID
Cuando una lectura de componente interacciona y modifica múltiples bases de datos de manera paralela a otras operaciones, este procedimiento de sub-tareas se conoce como Transacción (Ramakrishnan & Gehrke, 2023). Al ingresar el diagnóstico, el proyecto ampara la información por el paradigma referencial inamovible conocido por sus siglas: ACID (Atomicidad, Consistencia, Aislamiento, y Durabilidad). Su virtud principal y más notoria reside en el efecto atómico del mandato "Todo o Nada"; es decir, o el sistema guarda exitosamente los datos geográficos a la vez que actualiza los valores del servidor sin interrupciones, o de presentarse caídas de voltaje de telefonía intermedias en carreteras despobladas, la transacción se retrotrae (Rollback) por completo resguardando el banco limpio contra inscripciones de lecturas parciales defectuosas.

## 2.7 Bases Multiversión y Sistema Gestor Operativo (PostgreSQL)
PostgreSQL es un sistema de bases de datos objeto-relacional catalogado universalmente como el líder de confiabilidad operativa a grado empresarial en tareas corporativas críticas. En la geolocalización simultánea su punto más sólido se encasilla sobre el "Control de Concurrencia Multiversión" (MVCC). Dicha mecánica provee una resiliencia inusitada al certificar que ingenieros realizando lecturas pesadas y prolongadas de la cartografía al interior de Subestaciones nunca bloqueen en tiempo informático a terceros operadores localizando fallas. Adicional al soporte nativo matricial híbrido, provee la garantía resolutiva para escalabilidad hacia el futuro, absorbiendo integraciones masivas sin desestabilizar la retícula fundamental existente (PostgreSQL Global Development Group, 2024).

## 2.8 Control de Abstracción Relacional e Inspección de Variables (Prisma ORM)
Intercambiar cadenas lógicas directamente a un motor SQL impone métodos arduos para disuadir ataques de inyección de código exterior. En su lugar, la herramienta Mapeador Objeto-Relacional (ORM) llamada Prisma establece un puente de alta abstracción estática. Dicha capa de conversión técnica fuerza, por regla nativa, que al enviar coordenadas (como latitud o altitud) sus entidades receptoras cumplan formatos matemáticos (Float types). Prisma ORM veta terminantemente ejecuciones no declaradas antes que rocen el núcleo físico, automatizando en contrapartida el enroscado manual entre componentes, diagramas e interfaces evitando que los desarrolladores manipulen cadenas crudas y facilitando el diseño seguro frente al servidor de datos (Prisma, 2024).

## 2.9 El Entorno Híbrido Database as a Service Perimetral (BaaS - Supabase)
Operar los directorios físicos de red forzaba históricamente un gasto masivo local constante en Racks de servidores para control y balanceos geográficos en instancias locales. Ante su migración natural, los esquemas de bases se instalan vía BaaS (Database as a Service). Encapsulando el componente de PostgreSQL sobre la plataforma escalable en nube de "Supabase", el producto se blinda tras cortafuegos autoadministrados y cifrados SSL de cajón. Asimismo, el núcleo adopta la barrera denominada Seguridad a Nivel de Filas o Row Level Security (RLS). Estas políticas funcionan como filtros herméticos sobre la misma base central, obligando desde sus entrañas a rechazar solicitudes directas espurias en el servicio impidiendo alteraciones maliciosas profundas fuera de perfiles validados formalmente (Supabase, 2024; Mora, 2025).

## 2.10 Estándar Geográfico Keyhole Markup (KML/KMZ) e Inyección Vectorial
En mediciones referenciadas cardinalmente para la industria e infraestructuras magnas, el leguaje Keyhole Markup Language (KML) dictaminado tras resoluciones mundiales por el OGC (Open Geospatial Consortium, 2015), actúa como patrón principal identificando perímetros, postes o cables geolocalizados a través del formato XML abierto. Su formato denso derivó a un método compactador .ZIP asumiendo la nomenclatura .KMZ. Dentro del proyecto móvil, descomprimir estas estructuras e incrustarlas para visualización rápida precisaba ejecutar rutinas en JavaScript que revirtieran su peso masivo extralimitándolo directamente hacia estándares universales "GeoJSON", forjando estelas matemáticas instantáneas sobre el lienzo de mapa dinámico intermitente.

## 2.11 Análisis y Lógica Heurística en el Trazado (API OSRM)
Abastecer un visualizador cartográfico inerte carece de propósitos resolutivos tangibles si el operario no se transporta a la zona perimetral del componente averiado. Para enlazar el ruteo se emplean asistencias lógicas algorítmicas integradas al proyecto vía el ruteador de uso abierto OSRM (Open Source Routing Machine). Su núcleo matemático evalúa incesantemente esquemas A-Star de grafos reduciendo derivaciones innecesarias del peso nodo de las calles conectadas. Confrontando dinámicamente mediante el protocolo HTTP las latitudes GPS provenientes del localizador del smartphone frente a las rutas predeterminadas, la interfaz asimila y dibuja iterativamente el contorno topográfico preciso economizándole esfuerzo procesal drástico al microprocesador portante de origen del trabajador en movilización. (Luxen et al., 2011).

## 2.12 Reglas Transversales Tipadas Dinámicas Modernas (TypeScript)
Todos los bloques informáticos integradores y pre-procesadores del frontend o backend se estructuraron bajo JavaScript formal: TypeScript. Superando la laxitud tradicional del sistema web del milenio pasado, TypeScript inserta a sus cimientos declaraciones inamovibles (Contratos strict null checking). Toda matriz que necesite recolectar textos rechazará sin compilar el proyecto global en caso de proveérsele cifras; impidiendo in situ a las cuadrillas de operarios sufrir de sobreposiciones visuales denominadas en el gremio bajo el término de interrupciones o “crashes” lógicos terminales que truncarían un día laboral severamente (Bierman, Abadi & Torgersen, 2014).

## 2.13 Mapeos Nativos Reactivos y Sintéticos (Leaflet al DOM)
El cliente visual web programático inyectado para gestionar áreas masivas regionales como Leaflet.js contrasta con emuladores anticuados del rubro pesado, minimizando y simplificando destructividades gráficas referidas hacia el "Document Object Model" (DOM reactivo). El método de refrescos sutiles repara acciones de arrastres geográficos en móviles que se enfrenten a temperaturas corporativas extenuantes al intemperie, evadiendo paralelismos procesadores estancados gracias a incrustaciones por CSS de hardware. Esta metodología previene la ralentización visual general entregando controles táctiles puros en los acercamientos técnicos sin importar el ancho o extensión total de la grilla de líneas a analizar en primer plano.

## 2.14 Teoría Lógica de la Exigencia Mecánica Preventiva de Patrullaje
En las ingenierías de logísticas de flotillas unidas al cumplimiento general en el ecosistema, alienar y separar teóricamente la ubicación satelital temporal y omitir el padrón vehícular arruina estadísticas de desgastes internos de la paraestatal. El apartado lógico requiere entrelazar obligatoriamente un acumulado del tacómetro respecto al trayecto rutinario asignado diario. Realizando y contrastando cruces preventivos aritméticos sobre valores logaritmos en bitácoras, el sistema infiere notificaciones mediante cuadros restrictivos o semaforizados asegurando en un tope kilométrico innegociable retener y canalizar un automotor corporativo limitando fallas costosas sorpresivas antes que detengan intermitencias técnicas a toda una cuadrilla por desgastes invisibles subyacentes logísticos no controlados en reportes.


# 3 Desarrollo

## 3.1 Análisis (Levantamiento de Requerimientos y Casos de Uso)
### 3.1.1 Técnicas de Recolección de Datos
El principal acercamiento fue acompañar los procesos por inspección personal observacional, acompañando como analista secundario los diagnósticos y validando rutas manuales sobre circuitos urbanos. Como segunda tarea, se sostuvo pautas dialogadas o entrevistas controladas referidas respecto a cómo registraban valores teóricos a falta de sistemas actualizados e interconectores georeferenciados.

### 3.1.2 Interpretación de los Datos y Procesos
Las observaciones directas confirmaron confusiones continuas, ya que las hojas de datos se desconectaban visual y estadísticamente entre corrientes cortas o fallas. Los usuarios anotaban fallas Monofásicas frente a Trifásicas indistintamente, por lo que el esquema operativo tuvo que ser analizado para ser digitalizado hacia un visor independiente.

Casos de Uso Primordiales
[Caso 01] Integración de Puntos Especiales de Circuito "ICC" Duales en Planos PDF
1.	Planificador se autentica e ingresa a sección "Mapa Circuitos Diagramas".
2.	El entorno carga el esquema KMZ y el panel del plano a procesar.
3.	El usuario marca un nodo estipulando visualmente un objetivo en la geometría del papel de red digitalizado.
4.	El backend pide insertar la variable "Corriente Monofásica" y "Corriente Trifásica".
5.	Tras un evento asíncrono, se guarda bajo Base de Datos Supabase.
6.	La aplicación representa la nueva etiqueta o "Card" incrustada frente al panel PDF.

[Caso 02] Geonavegación Externa Interurbana y GPS
1.	Un integrante operador consulta un activo eléctrico de campo directamente en el mapa y lo selecciona.
2.	Invoca comando "Navegar". El API exige lecturas al sensor Geolocation (GPS) confirmadas.
3.	La plataforma lanza evento a la API OSRM externa.
4.	Se traza secuencial y paralelamente los puntos resultantes elaborando un vector interurbano que funciona de estela direccional en alta precisión al usuario de la unidad terrestre.

### 3.1.3 Requerimientos Funcionales Extendidos
[RF-01] Gestión Cartográfica y Modificación Total: Crear interacciones servidor para enlistar y catalogar postes y equipos dentro del servicio general de la base (CRUD).
[RF-02] Renderizador KMZ Interno: Emular internamente lecturas tabulares geográficas importadas para traducir KML a formas nativas reactivas al mapa virtual.
[RF-03] Sistema de Bitácora Paramétrico: Esquema restrictivo acumulador para advertir o programar mantenimientos para automotores que alcancen los tabuladores kilométricos estáticos de los diez mil.
[RF-04] Trazador Algorítmico Interurbano: Conectar las ubicaciones base institucionales versus el tránsito lógico satelital para navegación guiada sin uso pesado de memoria del equipo.
[RF-05] Visor Raster Híbrido Clicable ICC: Integrar visualización React-PDF programando eventos capturadores de la matriz y separando esquemas de corriente Dual entre monofásica versus trifásica en componentes "Modal" tipo tarjetas insertables inamovibles.
[RF-06] Reglas Transaccionales de Servidor Tipadas: Analizar validaciones nulas provenientes del entorno Front denegando ingresos incompletos desde el inicio local bajo bloqueadores NextJS de red.

## 3.2 Diseño
### 3.2.1 Diseño de almacenaje SQL en Base Centralizada
Todo el repositorio quedó estipulado en PRISMA SCHEMA operando en Supabase. Se definieron por un lado componentes de redes, por otra parte el segmento vehículos y el registro estricto "DiagramaIccPoint", anclado internamente bajo una llave foránea de sujeción (Cascade) protegiendo el orden contra huérfanos numéricos al lado de los componentes lógicos de diagramas base.

### 3.2.2 Diseño Interfaces Visuales de Operación Móvil 
Se modeló evitando cargar componentes lentos en pantalla, priorizando TailwindCSS con uso completo de escala adaptable. Se asignó 25% superior y lateral al componente barra estructural mientras el lienzo geográfico obtuvo proporción y espacio dominante para visibilidad; con paletas unificadas estéticamente limpias, propiciando facilidad a los teclados presenciales o bajo un uso a luz exterior directa en los municipios operativos.

## 3.3 Desarrollo
Nota: A continuación se detallan las secciones de código implementado junto con los espacios marcados donde se colocarán capturas fuente del desarrollo del programa.

### 3.3.1 Esquema de Base de Datos Base (Prisma Schema) con Restricción Relacional 
Una implementación obligada fue dotar el esquema del Mapeador Objeto-Relacional las estructuras independientes ICC en doble vertiente (Monofásico, Trifásico). 
Procedimiento Técnico: Se formularon parámetros de tipo Float para atrapar decimales mediante iccMonofasica e iccTrifasica acoplados al enlace matriz referenciado que estandariza eliminaciones coordinadas a Postgres, prohibiendo variables desconectadas visualmente sin relación de Padre-Hijo en Base.

[ PEGAR AQUÍ CAPTURA DE PANTALLA: Archivo prisma/schema.prisma mostrando el modelo DiagramaIccPoint ]

### 3.3.2 Enrutador API y Bloques Posteriores Integrativos
Al pulsar guardar lecturas en pantalla gráfica, el programa demanda integraciones controlables sin estatus desde las interfaces hacia el procesador central. 
Procedimiento Técnico: Un handler estricto asíncrono ejecuta destructuración para desglosar el Body Payload interceptable desde "POST", analizando a profundidad y generando confirmaciones locales con prisma.diagramaIccPoint.create(). Lo anterior sanea envíos numéricos antes de otorgar un "HTTP 201 Created".

[ PEGAR AQUÍ CAPTURA DE PANTALLA: Archivo src/app/api/diagramas/[id]/icc/route.ts mostrando el POST y bloque Prisma create ]

### 3.3.3 Mapa Navegable Client-Side de Rutas Interurbanas
Resolver la trazabilidad obligó entrelazar eventos asíncronos propios entre geocoordenadas reales mediante "State Variables" o banderas lógicas desde el ReactJS. 
Procedimiento Técnico: Recurriendo a invocaciones HighAccuracy procedentes del objeto Javascript navigator.geolocation, componentes rebotan sus latitudes extraídas procesándolas en APIs foráneas libres "OSRM". El polígono entregado es consumido reordenándose e insertando una polyline azul al Canvas final con avisos condicionales simultáneos de seguimiento para orientación técnica en curso.

[ PEGAR AQUÍ CAPTURA DE PANTALLA: Archivo src/components/map/KmzDiagramMap.tsx enfocado en funciones Navigate UI o polyline renders ]

### 3.3.4 Visor Híbrido ICC Reactivo con Coordenadas Matemáticas XY
Para inyectar formularios sobre PDF inertes era requerido acoplar mediciones de entorno interactivos del DOM navegador a bases relativas dimensionales. 
Procedimiento Técnico: Se interceptan métricas estandarizadas "getBoundingClientRect()", y con porcentajes matemáticos comparativos resultantes, el lienzo activa el levantamiento reactivo en estado (setNewIccPoint) desencadenando aperturas gráficas "Modal" receptivas de amperajes correctos desde eventos teclado hacia base. 

[ PEGAR AQUÍ CAPTURA DE PANTALLA: Archivo src/features/mapa/components/DiagramViewer.tsx enseñando inputs finales de Icc I1 y I3 ]

### 3.3.5 Configuración de Entornos Temporales Prevención y Timeouts Transaccionales
Para absorber mallas documentales inmensas se optimizan las subidas previniendo aborciones sistemáticas transaccionales limitantes dentro de las bases de datos de alta envergadura.
Procedimiento Técnico: Se estructuraron los componentes al encapsular invocaciones push insertables a prisma.$transaction ordenando esperas extendidas a factores de veinte segundos explícitos en configuraciones MaxWait; con esto PostgreSQL rinde bloques enteros de cargas masificadoras seguras.

[ PEGAR AQUÍ CAPTURA DE PANTALLA: Archivo src/app/api/diagramas/... mostrando prisma.$transaction y timeouts ]

### 3.3.6 Lectura Volátil Local de Estructura Excel a Variables Mapeo
Para omitir cargas pesadas de registros XLSX se habilitó absorción por código emulado en RAM operativa estricta, traduciendo a matrices iterativas seguras JSON.
Procedimiento Técnico: Apoyándose mediante implementaciones orientadas de clase estática estandarizada y lecturas buffer nativas por dependencias XLSX importadas en métodos Node, procesan columnas descartando casillas corrompidas validando contratos tipados para transferencias a sistemas inalterables relacionales.

[ PEGAR AQUÍ CAPTURA DE PANTALLA: Archivo src/features/diagramas/services/ExcelParserService.ts funciones principales de lectura a memoria Buffer ]

## 3.4 Implantación
Lograr proveer funciones lógicas, geográficas estables demandó desplegar en servidores operables Node.js resolutivos por migraciones unificadas `npx prisma generate`. Instanciarlo en modo constructivo pre-renderizado (SSR Build Production) permite que un celular de bajo nivel administrativo en campo ejecute tareas fluidamente e inicie sistemas transaccionales con URL directas eximiendo aplicaciones preinstalables para uso gubernamental regularizado.

## 3.5 Pruebas
Nota: A continuación se detallan las descripciones operativas de las pruebas realizadas. Inserta la comprobación visual fotográfica (captura de pantalla) en los espacios asignados.

1. Creación e Inserción de un Nuevo Componente
Mediante la interfaz principal, se corroboró el acceso al formulario de altas, en el cual el operador ingresó parámetros clave (Código de identificación, tipo de estructura eléctrica y coordenadas geográficas manuales). Al ejecutar la orden de guardado, se validó la inserción asíncrona hacia la base de datos Supabase, observando de manera inmediata la aparición gráfica de su marcador o "Pin" sobre el lienzo del mapa principal sin requerir un reinicio del sistema.
(Espacio: Pegar captura de pantalla FrontEnd mostrando el formulario de "Nuevo Componente" diligenciado o el marcador recién creado sobre el mapa).

2. Navegación Asistida hacia un Componente Eléctrico
Se verificó el proceso de intercepción GPS seleccionando un componente interactivo ya establecido sobre el mapa de la zona (React-Leaflet). Al accionar el comando visual de "Navegar", el entorno detectó y concedió los permisos de lectura de la latitud y longitud móvil, contactó a la validación de OSRM, y procedió a dibujar instantáneamente el trazado vectorial o ruta en un color identificable (azul) sobre la topología de calles, demostrando un seguimiento estable.
(Espacio: Pegar captura de pantalla del mapa con el ruteador activo dibujando la línea o ruta de origen hacia el componente).

3. Registros de Corriente de Cortocircuito (ICC) en Diagramas
Se certificó el funcionamiento híbrido estructural abriendo un documento maestro de red unifilar y produciendo un clic voluntario sobre su superficie. El entorno reaccionó desplegando el módulo de captura de datos exigiendo magnitudes precisas para Corriente Monofásica y Trifásica. Al enviar dichas entradas numéricas, el sistema comprobó la ausencia de errores (Timeouts) grabando con éxito el registro numérico y posicional bajo una tarjeta estática anclada a las exactas coordenadas de interacción iniciales del plano PDF. 
(Espacio: Pegar captura visual mostrando las pequeñas tarjetas o modales de campos de ICC Mono y Trifásica renderizadas flotantes sobre la imagen del diagrama).

4. Alta Vehicular y Bitácora de Kilómetros Recorridos
Se emularon rutinas de gestión introduciendo fichas de seguimiento logístico para los medios de transporte de la flotilla. El operario ingresó los valores base del padrón de unidad y se efectuaron inserciones de su recorrido diario kilométrico. El sistema demostró recibir coherentemente los kilómetros rodados iterando las operaciones aritméticas que, en caso de aproximarse a cuotas preventivas programadas (por desgaste), accionan tableros o paneles visuales con semaforización referida para mandar a revisión técnica el automotor en cuestión.
(Espacio: Pegar captura del módulo de Vehículos donde se perciba el formulario de kilómetros rellenado o el listado del historial vehicular acumulado).


# 4 Resultados

Se alcanzó por completo la funcionalidad de una matriz virtual web "UNIDAD REMOTA DE GEOLOCALIZACION", omitiendo limitantes operativas históricas e impulsando las métricas estáticas tecnológicas a parámetros web dinámicos. En la visualización se logró estabilidad separando lógicas visuales para cargas, operando a alta precisión sin bloqueos interurbanos la API rutera GPS. Las configuraciones PDF duales operan correctamente de manera asíncrona validando lecturas relacionales directas base Prisma-Supabase, minimizando latencias transaccionales y centralizando finalmente documentos fragmentarios frente al área y su personal operario logístico al cierre de desarrollo.


# 5 Conclusiones y Recomendaciones

## 5.1 Conclusiones del proyecto
Se comprobó que desarrollar con herramientas estructurales web Open Source de nueva generación erradica la exclusividad sobre pesados componentes geográficos empresariales licenciados y democratiza la precisión del trabajador hacia las cuadrículas corporativas desde teléfonos operables. El modelo construido en TypeScript acoplado a la infraestructura Supabase logró resiliencia formal relacional total mitigando huecos lógicos transaccionales originando asertividad técnica remota que incide directo frente incidencias en distribución rural en corto margen de control metódico.

## 5.2 Recomendaciones
Se dictamina de manera recomendativa programar etapas de adiestramiento directas por talleres formativos visuales hacia responsables tácticos sobre las integraciones. De igual manera a nivel del administrador TI consolidar eventual mudanza estable desde niveles libres compartidos nube Supabase a esquemas permanentes "PRO" de CFE que prevengan colgaduras, sin olvidar aplicar requerimientos restrictivos rigurosos de alta sistemática a infraestructuras a corto plazo que aseguren vigencias constantes al modelo web actual de red sin obsolescencia temprana en sus mapas.

## 5.3 Experiencia Personal Profesional Adquirida
Instrumentar la estructuración tipada y transaccional SQL referida directamente a sistemas funcionales de alta criticidad comunitaria en servicio federal operante aportó profundas directrices lógicas y constructivas formales. Inferir abstracciones a problemáticas presenciales crudas para unirlas hacia algoritmos satelitales interurbanos adaptables catalizó experiencia directa a niveles ingenieriles lógicos productivos y de desarrollo central exigente; forjando así experiencia estricta invaluable frente a estándares altamente rigurosos en materia de arquitecturas corporativas funcionales.


# 6 Competencias Desarrolladas y Aplicadas

- Se desarrollaron procesos estandarizados en Arquitectura FrontEnd y Backend (SSR) sobre enrutamientos de la red operativa central usando implementaciones avanzadas integrando TypeScript y utilidades semánticas modernas en React 18.
- Se seleccionaron configuraciones unificadas ACID relatoras elaborando modelados persistentes referenciales y restricciones con capas prisma estibándolo por base y servicios relacionales externos seguros PostgreSQL (BaaS).
- Se ejecutaron adaptabilidades a redes de coordenadas algorio-matemáticas espaciales originarias geográficamente aplicando enrutamientos bidireccionales complejos "OSRM Routings Vector-Paths".
- Se diseñaron visualizadores funcionales paramétricos inyectados nativamente hibridando herramientas vectoriales (Canvas - Leaflet Layouts - Interacción ICC) estructurando eventos responsivos de experiencia usuario adaptados a condiciones severas visuales ambientales.


# Fuentes de Información

Agafonkin, V. (2011). Leaflet: An Open-Source JavaScript Library for Mobile-Friendly Interactive Maps. Obtenido de http://leafletjs.com

Bierman, G., Abadi, M., & Torgersen, M. (2014). Understanding TypeScript. En ECOOP 2014–Object-Oriented Programming: 28th European Conference, Uppsala, Sweden. Springer. https://doi.org/10.1007/978-3-662-44202-9_11

Díaz, M. y Pérez, J. (2018). Sistemas de Información Geográfica y Cartografía de Código Abierto. Editores Académicos.

Longley, P. A., Goodchild, M. F., Maguire, D. J., & Rhind, D. W. (2015). Geographic Information Science and Systems (4ta ed.). John Wiley & Sons.

Luxen, D. & Vetters, C. (2011). Real-time routing with OpenStreetMap data. En Proceedings of the 19th ACM SIGSPATIAL International Conference on Advances in Geographic Information Systems (pp. 513–516). Association for Computing Machinery. https://doi.org/10.1145/2093973.2094062

Mozilla Developer Network [MDN]. (2024). Geolocation API. MDN Web Docs. Obtenido de https://developer.mozilla.org/es/docs/Web/API/Geolocation_API

Open Geospatial Consortium [OGC]. (2015). OGC KML. Obtenido de https://www.ogc.org/standard/kml/

Prisma Data, Inc. (2024). Prisma Client API reference. Prisma Documentation. Obtenido de https://www.prisma.io/docs

Russell, S. y Norvig, P. (2010). Inteligencia artificial: Un enfoque moderno (3era ed.). Pearson Educación.

Stonebraker, M. & Kemnitz, G. (1991). The POSTGRES next-generation database management system. Communications of the ACM, 34(10), 78–92. https://doi.org/10.1145/105901.105905

Supabase. (2024). Database Documentation (PostgreSQL). Supabase Docs. Obtenido de https://supabase.com/docs/guides/database

Vercel, Inc. (2023). Next.js App Router Documentation. Next.js Docs. Obtenido de https://nextjs.org/docs


# Anexos

Anexo A: Oficio y formato sellado original de carta aval de confirmación operativa para finalización del sistema.
Anexo B: Documentación de código y material suplementario de las configuraciones y validaciones de transacciones de base de datos relacionales en la plataforma oficial Prisma / Supabase.
