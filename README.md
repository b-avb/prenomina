# prenomina

Plataforma Institucional de Gestión Docente y Proyección de Prenómina Académica — **Universidad Santo Tomás · Seccional Tunja**.

## Estructura del Monorepo

- `packages/domain` (`@usta/domain`): Contratos tipados, motor de validación normativa (ANEXOS 2, 3, 4, 5, 6 y 7) y cálculos de carga académica y PSE (25%).
- `usta-api`: Backend REST API en TypeScript + Kysely + MariaDB 11, autenticación híbrida (JWT `HS256` con revocación instantánea + Microsoft Entra ID SSO) y bitácora inmutable de auditoría.
- `usta-web`: Aplicación web SPA en Vue 3 + Pinia + TypeScript estricto + exportación/importación oficial en Excel (`.xlsx`).

---

## Ejecución en el Servidor / Escritorio Remoto

### Opción A — Servidor o Escritorio Remoto Linux (Ubuntu / Debian) en 1 comando

```bash
git clone https://github.com/b-avb/prenomina.git
cd prenomina
./deploy.sh --local
```

> El script instala automáticamente Node.js 22 LTS, MariaDB y Nginx (si no existen), compila los 3 paquetes, genera `/opt/usta-plataforma/usta-api/.env` con un secreto JWT criptográfico (`openssl rand -hex 32`), ejecuta las migraciones y el seed inicial, y activa el servicio `systemd` (`usta-api`).

### Opción B — Escritorio Remoto Windows Server o Linux con Docker + Node.js

```bash
git clone https://github.com/b-avb/prenomina.git
cd prenomina

# 1. Levantar MariaDB 11 en contenedor (o configurar DB_HOST/DB_PORT en usta-api/.env)
pnpm run db:up

# 2. Instalar dependencias, compilar los 3 paquetes, migrar y poblar la base de datos
pnpm install
pnpm run setup

# 3. Iniciar servidor unificado (sirve tanto la Web como /api en http://localhost:4301)
pnpm start
```

### Suite de Pruebas E2E de Producción (0 Mocks)

```bash
pnpm test
```
