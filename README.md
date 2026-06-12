# Test de Usabilidad — SICAU

Herramienta web para **planificar, ejecutar y documentar** pruebas de usabilidad moderadas. Separa de forma estricta la **vista del moderador** (configuración, cronómetro, métricas, observaciones) de la **vista del participante** (escenarios narrativos, sin carga metodológica visible).

**Repositorio:** [github.com/JorgeAndresRamirez/usability-test-management](https://github.com/JorgeAndresRamirez/usability-test-management)

Desarrollada para apoyar el flujo metodológico del SICAU: Think Aloud, eficacia vs éxito, errores críticos/no críticos, satisfacción opcional por situación e informes ejecutivos orientados a decisiones.

---

## Características principales

### Gestión de proyectos
- Crear, clonar y eliminar proyectos de usabilidad
- Estados del proyecto: Borrador → Activo → Completado → Archivado
- Metadatos editables (nombre, fechas, prototipo, perfil de usuarios) **solo antes** de registrar participantes o respuestas
- Pantalla de bienvenida configurable antes del primer escenario

### Constructor de situaciones (M2)
- Ficha técnica por situación: punto de partida, meta, criterio de éxito, tiempo máximo
- Escenario narrativo para el participante (sin exponer términos metodológicos)
- Satisfacción subjetiva opcional por situación
- Reordenamiento drag-and-drop de situaciones

### Ejecución moderada (M3)
- Cronómetro Time on Task (ToT) visible solo para el moderador
- Registro de resultado: éxito, error no crítico, error crítico
- Métricas ampliadas: completitud, gravedad de errores NC, falsa finalización, solicitud de ayuda
- Flujo separado: **Guardar situación** / **Siguiente situación** / **Detener cronómetro**
- Notas Think Aloud por situación

### Vista participante (M4)
- Acceso por token único (`/p/[token]`)
- Solo recibe etiqueta de situación y narrativa — nunca «tarea», ni tiempo máximo, ni criterios internos

### Reportes y exportación (M5)
- KPIs de decisión: finalización, éxito, brecha de recuperación, éxito autónomo
- Comparación visual entre participantes (tarjetas, matriz de resultados, gráficos)
- Detalle por participante con observaciones situación a situación
- Exportación **CSV** (datos crudos) e **informe ejecutivo PDF** (3 páginas, accionable)

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + TypeScript |
| UI | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Base de datos | [PostgreSQL 16](https://www.postgresql.org/) + [Prisma 6](https://www.prisma.io/) |
| Formularios | React Hook Form + Zod |
| Gráficos | [Recharts](https://recharts.org/) |
| PDF | [@react-pdf/renderer](https://react-pdf.org/) |

**Requisitos:** Node.js 20+, npm 10+

---

## Inicio rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/JorgeAndresRamirez/usability-test-management.git
cd usability-test-management
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` según la opción de base de datos (ver [Variables de entorno](#variables-de-entorno)).

### 3. Base de datos

**Opción A — Prisma Dev (recomendada en desarrollo local)**

```bash
npx prisma dev          # inicia PostgreSQL embebido
npx prisma dev ls       # copia DATABASE_URL y DIRECT_URL a .env
npm run db:push
npm run db:seed         # opcional: datos de demostración
```

**Opción B — Docker Compose**

```bash
docker compose up -d
```

En `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_usabilidad?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/test_usabilidad?schema=public"
```

```bash
npm run db:push
npm run db:seed
```

### 4. Arrancar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | Sí | URL de conexión principal. Con Prisma Dev suele ser `prisma+postgres://…` (puerto **51213**) |
| `DIRECT_URL` | Sí con Prisma Dev | Conexión TCP directa (puerto **51214**). La app la usa en runtime para evitar errores de *prepared statements* |

> Con Prisma Dev, **no** hace falta añadir `pgbouncer=true` manualmente: `lib/prisma.ts` lo aplica automáticamente sobre `DIRECT_URL`.

Con Docker, `DATABASE_URL` y `DIRECT_URL` pueden apuntar a la misma URL.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Genera Prisma Client y compila para producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:push` | Sincroniza el esquema con la base de datos |
| `npm run db:seed` | Inserta proyecto de ejemplo con sesión completada |
| `npm run db:studio` | Abre Prisma Studio |

---

## Módulos y rutas

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **M1 — Dashboard** | `/` | Listado de proyectos, crear, clonar y eliminar |
| **M1 — Configuración** | `/tests/[testId]` | Metadatos, bienvenida, participantes, estado del proyecto |
| **M2 — Constructor** | `/tests/[testId]/setup` | Situaciones técnicas y narrativas |
| **M3 — Ejecución** | `/tests/[testId]/sessions/[sessionId]/run` | Panel en vivo del moderador |
| **M4 — Participante** | `/p/[presentationToken]` | Vista limpia para el usuario en prueba |
| **M5 — Reportes** | `/tests/[testId]/reports` | Análisis, gráficos, exportación |
| **M5 — Detalle sesión** | `/tests/[testId]/reports/sessions/[sessionId]` | Observaciones por participante |

### API REST (resumen)

| Método | Ruta | Uso |
|--------|------|-----|
| `GET/POST` | `/api/tests` | Listar / crear proyectos |
| `GET/PATCH/DELETE` | `/api/tests/[testId]` | Detalle, actualizar, eliminar |
| `POST` | `/api/tests/[testId]/clone` | Duplicar proyecto (sin participantes ni resultados) |
| `GET/POST` | `/api/tests/[testId]/participants` | Participantes |
| `GET/POST` | `/api/tests/[testId]/tasks` | Situaciones |
| `PATCH/DELETE` | `/api/tests/[testId]/tasks/[taskId]` | Editar / eliminar situación |
| `POST` | `/api/tests/[testId]/tasks/reorder` | Reordenar situaciones |
| `GET/PATCH` | `/api/sessions/[sessionId]` | Estado de sesión |
| `POST/PATCH` | `/api/sessions/[sessionId]/executions` | Registrar resultados |
| `GET` | `/api/presentation/[token]` | Datos seguros para vista participante |
| `GET` | `/api/tests/[testId]/reports` | Informe ejecutivo (JSON) |
| `GET` | `/api/tests/[testId]/reports/export/pdf` | Descarga PDF |
| `GET` | `/api/tests/[testId]/reports/export/csv` | Descarga CSV |

---

## Metodología y métricas

### Conceptos clave

| Métrica | Significado |
|---------|-------------|
| **Tasa de finalización (eficacia)** | % de situaciones completadas (incluye recuperación tras error no crítico) |
| **Tasa de éxito** | % de éxito puro, sin fricción relevante |
| **Brecha de recuperación** | Finalización − éxito: indica errores intermedios superados |
| **Éxito autónomo** | Éxito sin solicitar ayuda al moderador |
| **ToT (Time on Task)** | Tiempo en segundos; solo visible para el moderador |
| **Falsa finalización** | El participante cree haber completado la meta sin lograrla |
| **Satisfacción (1–4)** | Escala Likert; solo se pregunta si la situación tiene `askSatisfaction: true` |

### Reglas de la interfaz participante

- El participante **nunca** ve la palabra «Tarea» ni el tiempo máximo configurado
- La API de presentación solo expone `situationLabel` y `narrative`
- No se recogen datos sociodemográficos: solo **código** y **relación usuario-sistema**
- Se recomienda **5–15 participantes** (curva de aprendizaje de Nielsen)

### Edición bloqueada con datos

Los metadatos del proyecto y la pantalla de bienvenida solo se pueden editar mientras **no existan participantes ni respuestas** (`TaskExecution`). Para iterar sobre un diseño ya probado, usa **Clonar proyecto**.

---

## Estructura del proyecto

```
test-usabilidad/
├── app/
│   ├── (app)/                 # Rutas del moderador (dashboard, tests, reportes)
│   ├── api/                   # API REST
│   └── p/[token]/             # Vista participante
├── components/
│   ├── layout/                # Navegación, cabeceras
│   ├── moderator/             # Constructor, ejecución, participantes
│   ├── participant/           # Pantallas del usuario en prueba
│   ├── reports/               # Gráficos, PDF, matrices
│   └── ui/                    # Componentes shadcn/ui
├── lib/
│   ├── analytics.ts           # Agregación de métricas
│   ├── executive-report.ts    # Informe ejecutivo, insights, fricción
│   ├── execution-rules.ts     # Etiquetas y reglas metodológicas
│   ├── prisma.ts              # Cliente Prisma (singleton)
│   └── validators/            # Esquemas Zod
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   └── seed.ts                # Datos de demostración
├── docker-compose.yml         # PostgreSQL para desarrollo
├── .env.example
└── README.md
```

---

## Modelo de datos (resumen)

```
UsabilityTest
 ├── Participant (code, notes, orderIndex)
 ├── Task / Situación (goal, narrative, maxTime, askSatisfaction)
 └── TestSession (por participante)
      └── TaskExecution (result, ToT, satisfaction, thinkAloudNotes, flags)
```

Estados del proyecto: `DRAFT` · `ACTIVE` · `COMPLETED` · `ARCHIVED`  
Estados de sesión: `PENDING` · `IN_PROGRESS` · `COMPLETED`  
Resultados: `SUCCESS` · `NON_CRITICAL_ERROR` · `CRITICAL_ERROR`

---

## Despliegue en producción

```bash
npm run build
npm run start
```

Checklist:

1. PostgreSQL accesible desde el servidor
2. Variables `DATABASE_URL` (y `DIRECT_URL` si usas pooler) configuradas en el entorno
3. Ejecutar `npx prisma db push` (o migraciones) antes del primer arranque
4. El cliente Prisma se genera en `postinstall` — no commitear `lib/generated/prisma` (está en `.gitignore`)

Para Vercel u otros PaaS serverless, usa una URL **directa** para Prisma CLI y considera un adaptador de driver si empleas pooler en runtime.

---

## Solución de problemas

### `prepared statement "sXX" already exists`

Ocurre con **Prisma Dev** cuando la app usa la URL pooled (`51213`) en lugar de la TCP directa.

1. Añade `DIRECT_URL` en `.env` (puerto `51214`, ver `npx prisma dev ls`)
2. Reinicia `npm run dev` tras cambiar `.env` o `lib/prisma.ts`
3. Si persiste: `npx prisma dev stop default && npx prisma dev --detach`

### El cliente Prisma no se encuentra

```bash
npm run db:generate
```

### Datos de prueba

```bash
npm run db:seed
```

Crea un proyecto «Portal Estudiantil SICAU — Piloto» con situaciones, participante y sesión de ejemplo.

---

## Contribuir

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Commit con mensajes claros en español o inglés
4. Abre un Pull Request describiendo el cambio y cómo probarlo

Antes de enviar PR:

```bash
npm run lint
npm run build
```

---

## Licencia

Proyecto académico / institucional del **SICAU**. Consulta con la institución antes de redistribuir o usar en producción fuera del ámbito autorizado.

---

## Créditos

Desarrollado para el **Sistema de Información del Centro de Apoyo Universitario (SICAU)** — pruebas de usabilidad moderadas con enfoque en eficacia, éxito autónomo y reportes accionables para equipos de diseño y producto.
