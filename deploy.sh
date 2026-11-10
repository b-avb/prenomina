#!/usr/bin/env bash
# ==============================================================================
# USTA Tunja · Plataforma de Gestión Docente y Prenómina
# Script de Aprovisionamiento y Despliegue Automatizado
# Soporta: RHEL / CentOS / Rocky / AlmaLinux (dnf/yum) y Ubuntu / Debian (apt)
# Soporta: MySQL 8.x y MariaDB 10/11
# ==============================================================================
# Uso rápido:
#   1) Directamente dentro del servidor / escritorio remoto Linux:
#      ./deploy.sh --local
#
#   2) Desde tu equipo por SSH:
#      ./deploy.sh --host 54.xxx.xxx.xxx --user root
# ==============================================================================

set -euo pipefail

DEPLOY_LOCAL="false"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-}"
DOMAIN_NAME="${DOMAIN_NAME:-_}"
APP_PORT="${APP_PORT:-4301}"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-usta_prenomina_tunja}"
DB_USER="${DB_USER:-usta_app}"
# Contraseña compatible con políticas validate_password (MEDIUM/STRONG) de MySQL 8
DB_PASSWORD="${DB_PASSWORD:-Usta2026*Prenomina99}"
MYSQL_ADMIN_USER="${MYSQL_ADMIN_USER:-root}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local)
      DEPLOY_LOCAL="true"
      shift
      ;;
    --host)
      DEPLOY_HOST="$2"
      shift 2
      ;;
    --user)
      DEPLOY_USER="$2"
      shift 2
      ;;
    --key)
      DEPLOY_SSH_KEY="$2"
      shift 2
      ;;
    --port)
      DEPLOY_PORT="$2"
      shift 2
      ;;
    --domain)
      DOMAIN_NAME="$2"
      shift 2
      ;;
    --help|-h)
      sed -n '2,15p' "${BASH_SOURCE[0]}"
      exit 0
      ;;
    *)
      echo "Opción desconocida: $1 (usa --help para ver las opciones)"
      exit 1
      ;;
  esac
done

if [[ "$DEPLOY_LOCAL" != "true" && -z "$DEPLOY_HOST" ]]; then
  echo "ERROR: Usa './deploy.sh --local' si estás dentro del servidor, o './deploy.sh --host <IP>' si despliegas por SSH."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE_PATH="/tmp/usta-deploy.tar.gz"

run_as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  else
    sudo "$@"
  fi
}

ensure_node_and_pnpm() {
  local need_node="false"
  if ! command -v node >/dev/null 2>&1; then
    need_node="true"
  else
    local node_major
    node_major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    if [[ "$node_major" -lt 20 ]]; then
      need_node="true"
    fi
  fi

  if [[ "$need_node" == "true" ]]; then
    echo "==> Instalando Node.js 22 LTS..."
    if command -v apt-get >/dev/null 2>&1; then
      run_as_root apt-get update -y
      run_as_root apt-get install -y ca-certificates curl gnupg openssl tar
      curl -fsSL https://deb.nodesource.com/setup_22.x | run_as_root bash -
      run_as_root apt-get install -y nodejs
    elif command -v dnf >/dev/null 2>&1; then
      run_as_root dnf install -y curl ca-certificates openssl tar
      curl -fsSL https://rpm.nodesource.com/setup_22.x | run_as_root bash -
      run_as_root dnf install -y nodejs
    elif command -v yum >/dev/null 2>&1; then
      run_as_root yum install -y curl ca-certificates openssl tar
      curl -fsSL https://rpm.nodesource.com/setup_22.x | run_as_root bash -
      run_as_root yum install -y nodejs
    else
      echo "ERROR: No se encontró un gestor de paquetes compatible (apt-get, dnf o yum)."
      exit 1
    fi
  fi

  if ! command -v pnpm >/dev/null 2>&1; then
    echo "==> Activando pnpm..."
    if command -v corepack >/dev/null 2>&1; then
      run_as_root corepack enable || run_as_root npm install -g pnpm
    else
      run_as_root npm install -g pnpm
    fi
  fi
}

ensure_node_and_pnpm

echo "==> 1. Instalando dependencias del monorepo (node_modules)..."
cd "$ROOT_DIR"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile || pnpm install
else
  npx --yes pnpm@10 install
fi

echo "==> 2. Compilando monorepo TypeScript estricto (@usta/domain, usta-api y usta-web)..."
cd "$ROOT_DIR"
npm --prefix packages/domain run build
npm --prefix usta-api run build
npm --prefix usta-web run build

echo "==> 3. Empaquetando artefactos de producción..."
cd "$ROOT_DIR"
tar -czf "$BUNDLE_PATH" \
  package.json \
  pnpm-workspace.yaml \
  pnpm-lock.yaml \
  packages/domain/package.json \
  packages/domain/dist \
  usta-api/package.json \
  usta-api/.env.example \
  usta-api/dist \
  usta-web/dist

# ==============================================================================
# Ejecución directa cuando estamos dentro del servidor (--local)
# (Sin heredocs anidados para preservar caracteres especiales en contraseñas)
# ==============================================================================
if [[ "$DEPLOY_LOCAL" == "true" ]]; then
  echo "==> 4. Configurando MySQL / MariaDB y base de datos ${DB_NAME}..."

  if [[ "${DB_HOST}" = "127.0.0.1" || "${DB_HOST}" = "localhost" ]]; then
    if ! command -v mysql >/dev/null 2>&1 && ! command -v mariadb >/dev/null 2>&1; then
      echo "[Server] Instalando servidor de base de datos..."
      if command -v apt-get >/dev/null 2>&1; then
        export DEBIAN_FRONTEND=noninteractive
        run_as_root apt-get update -y
        run_as_root apt-get install -y mariadb-server
      elif command -v dnf >/dev/null 2>&1; then
        run_as_root dnf install -y mysql-server || run_as_root dnf install -y mariadb-server
      elif command -v yum >/dev/null 2>&1; then
        run_as_root yum install -y mysql-server || run_as_root yum install -y mariadb-server
      fi
    fi
    run_as_root systemctl start mysqld 2>/dev/null || run_as_root systemctl start mariadb 2>/dev/null || true

    SQL_SETUP="
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
"

    if mysql -u "$MYSQL_ADMIN_USER" -e "SELECT 1" >/dev/null 2>&1; then
      mysql -u "$MYSQL_ADMIN_USER" -e "$SQL_SETUP"
    else
      if [[ -n "$MYSQL_ROOT_PASSWORD" ]] && MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u "$MYSQL_ADMIN_USER" -e "SELECT 1" >/dev/null 2>&1; then
        MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u "$MYSQL_ADMIN_USER" -e "$SQL_SETUP"
      else
        echo ""
        echo "Se requiere autenticar en MySQL con el usuario '${MYSQL_ADMIN_USER}' para crear la BD '${DB_NAME}'."
        echo "(Se abrirá el prompt nativo de mysql: escribe la contraseña de MySQL y presiona Enter)"
        mysql -u "$MYSQL_ADMIN_USER" -p -e "$SQL_SETUP"
      fi
    fi
  fi

  echo "==> 5. Instalando aplicación en /opt/usta-plataforma..."
  run_as_root mkdir -p /opt/usta-plataforma/usta-api/data
  run_as_root tar -xzf "$BUNDLE_PATH" -C /opt/usta-plataforma
  rm -f "$BUNDLE_PATH"

  cd /opt/usta-plataforma
  if command -v pnpm >/dev/null 2>&1; then
    run_as_root pnpm install --prod --frozen-lockfile || run_as_root pnpm install --prod
  else
    run_as_root npx --yes pnpm@10 install --prod
  fi

  # Crear o actualizar credenciales de BD en .env preservando AUTH_TOKEN_SECRET si ya existe
  if [[ ! -f /opt/usta-plataforma/usta-api/.env ]]; then
    echo "[Server] Generando /opt/usta-plataforma/usta-api/.env con secreto JWT criptográfico..."
    run_as_root cp /opt/usta-plataforma/usta-api/.env.example /opt/usta-plataforma/usta-api/.env
    JWT_SECRET="$(openssl rand -hex 32)"
    run_as_root sed -i "s|^AUTH_TOKEN_SECRET=.*|AUTH_TOKEN_SECRET=${JWT_SECRET}|" /opt/usta-plataforma/usta-api/.env
  fi
  run_as_root sed -i "s|^PORT=.*|PORT=${APP_PORT}|" /opt/usta-plataforma/usta-api/.env
  run_as_root sed -i "s|^DB_HOST=.*|DB_HOST=${DB_HOST}|" /opt/usta-plataforma/usta-api/.env
  run_as_root sed -i "s|^DB_PORT=.*|DB_PORT=${DB_PORT}|" /opt/usta-plataforma/usta-api/.env
  run_as_root sed -i "s|^DB_NAME=.*|DB_NAME=${DB_NAME}|" /opt/usta-plataforma/usta-api/.env
  run_as_root sed -i "s|^DB_USER=.*|DB_USER=${DB_USER}|" /opt/usta-plataforma/usta-api/.env
  run_as_root sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" /opt/usta-plataforma/usta-api/.env
  run_as_root chmod 600 /opt/usta-plataforma/usta-api/.env

  NODE_BIN="$(command -v node)"
  echo "==> 6. Ejecutando migraciones Kysely y seed inicial en MySQL..."
  cd /opt/usta-plataforma/usta-api
  run_as_root "$NODE_BIN" dist/database/migrate.cli.js
  run_as_root "$NODE_BIN" dist/database/seed.cli.js

  echo "==> 7. Configurando servicio systemd (usta-api.service en puerto ${APP_PORT})..."
  run_as_root tee /etc/systemd/system/usta-api.service >/dev/null <<SERVICE
[Unit]
Description=USTA Tunja Prenomina Plataforma Web + API
After=network.target mysqld.service mariadb.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/usta-plataforma/usta-api
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
EnvironmentFile=-/opt/usta-plataforma/usta-api/.env
ExecStart=${NODE_BIN} /opt/usta-plataforma/usta-api/dist/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE

  run_as_root systemctl daemon-reload
  run_as_root systemctl enable usta-api
  run_as_root systemctl restart usta-api

  if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
    run_as_root firewall-cmd --permanent --add-port="${APP_PORT}/tcp" >/dev/null 2>&1 || true
    run_as_root firewall-cmd --reload >/dev/null 2>&1 || true
  elif command -v ufw >/dev/null 2>&1; then
    run_as_root ufw allow "${APP_PORT}/tcp" >/dev/null 2>&1 || true
  fi

  sleep 2
  curl -fsS "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null
  echo "[Server] Health check http://127.0.0.1:${APP_PORT}/api/health OK"

  SERVER_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost')"
  echo "=============================================================================="
  echo " ¡Despliegue completado exitosamente!"
  echo " -> Acceso local en el servidor : http://localhost:${APP_PORT}"
  echo " -> Acceso en red institucional : http://${SERVER_IP}:${APP_PORT}"
  echo "=============================================================================="
  exit 0
fi

# ==============================================================================
# Modo remoto por SSH (--host <IP>)
# ==============================================================================
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
SSH_OPTS=(-p "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
SCP_OPTS=(-P "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "$DEPLOY_SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
  SCP_OPTS+=(-i "$DEPLOY_SSH_KEY")
fi

echo "==> 4. Subiendo paquete y script a ${SSH_TARGET}..."
scp "${SCP_OPTS[@]}" "$BUNDLE_PATH" "${SSH_TARGET}:/tmp/usta-deploy.tar.gz"
scp "${SCP_OPTS[@]}" "${BASH_SOURCE[0]}" "${SSH_TARGET}:/tmp/usta-deploy.sh"
rm -f "$BUNDLE_PATH"

echo "==> 5. Ejecutando aprovisionamiento en ${SSH_TARGET}..."
ssh -t "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo bash /tmp/usta-deploy.sh --local && sudo rm -f /tmp/usta-deploy.sh"
