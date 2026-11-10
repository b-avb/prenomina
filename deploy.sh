#!/usr/bin/env bash
# ==============================================================================
# USTA Tunja · Plataforma de Gestión Docente y Prenómina
# Script de Aprovisionamiento y Despliegue Automatizado
# Soporta: RHEL / CentOS / Rocky / AlmaLinux (dnf/yum) y Ubuntu / Debian (apt)
# ==============================================================================
# Uso rápido:
#   1) Directamente dentro del servidor / escritorio remoto Linux (después de git clone):
#      ./deploy.sh --local
#
#   2) Desde tu equipo por SSH con llave (.pem de AWS EC2):
#      ./deploy.sh --host 54.xxx.xxx.xxx --user ubuntu --key ~/.ssh/usta-aws.pem
#
#   3) Desde tu equipo por SSH con usuario/contraseña:
#      ./deploy.sh --host 54.xxx.xxx.xxx --user root --domain prenomina.santototunja.edu.co
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
DB_PASSWORD="${DB_PASSWORD:-usta_app_local}"
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
      sed -n '2,18p' "${BASH_SOURCE[0]}"
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
    echo "==> Activando gestores de paquetes del monorepo (pnpm)..."
    if command -v corepack >/dev/null 2>&1; then
      run_as_root corepack enable || npm install -g pnpm
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

if [[ "$DEPLOY_LOCAL" != "true" ]]; then
  SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
  SSH_OPTS=(-p "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
  SCP_OPTS=(-P "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
  if [[ -n "$DEPLOY_SSH_KEY" ]]; then
    SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
    SCP_OPTS+=(-i "$DEPLOY_SSH_KEY")
  fi
  echo "==> 4. Subiendo paquete a ${SSH_TARGET}..."
  scp "${SCP_OPTS[@]}" "$BUNDLE_PATH" "${SSH_TARGET}:/tmp/usta-deploy.tar.gz"
fi

provision_server() {
  if [[ "$DEPLOY_LOCAL" == "true" ]]; then
    echo "==> 4. Configurando servicios locales en el servidor..."
    if [[ "$(id -u)" -eq 0 ]]; then
      bash -e -s
    else
      sudo bash -e -s
    fi
  else
    echo "==> 5. Aprovisionando servidor remoto y actualizando servicios..."
    ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo bash -e -s"
  fi
}

# Si es despliegue local y MySQL/MariaDB requiere clave root, la solicitamos antes del bloque no interactivo
if [[ "$DEPLOY_LOCAL" == "true" ]] && [[ "${DB_HOST}" = "127.0.0.1" || "${DB_HOST}" = "localhost" ]]; then
  if command -v mysql >/dev/null 2>&1; then
    if ! mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
      if [[ -z "$MYSQL_ROOT_PASSWORD" ]]; then
        echo ""
        echo "NOTA: Se detectó MySQL/MariaDB instalado con contraseña de root."
        read -rsp "Ingresa la contraseña de root de MySQL/MariaDB (para crear la BD ${DB_NAME}): " MYSQL_ROOT_PASSWORD
        echo ""
      fi
    fi
  fi
fi

provision_server <<EOF
set -euo pipefail

# 4.1 Instalar Node.js 22 y MariaDB si no existen en el servidor destino
if ! command -v node >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg openssl tar
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y curl ca-certificates openssl tar
    curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
    dnf install -y nodejs
  elif command -v yum >/dev/null 2>&1; then
    yum install -y curl ca-certificates openssl tar
    curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
    yum install -y nodejs
  fi
fi

if [ "${DB_HOST}" = "127.0.0.1" ] || [ "${DB_HOST}" = "localhost" ]; then
  if ! command -v mysql >/dev/null 2>&1 && ! command -v mariadb >/dev/null 2>&1; then
    echo "[Server] Instalando MariaDB Server..."
    if command -v apt-get >/dev/null 2>&1; then
      export DEBIAN_FRONTEND=noninteractive
      apt-get update -y
      apt-get install -y mariadb-server
    elif command -v dnf >/dev/null 2>&1; then
      dnf install -y mariadb-server
    elif command -v yum >/dev/null 2>&1; then
      yum install -y mariadb-server
    fi
    systemctl enable --now mariadb || systemctl enable --now mysqld || true
  else
    systemctl start mariadb 2>/dev/null || systemctl start mysqld 2>/dev/null || true
  fi

  MYSQL_CMD=(mysql -u root)
  if [ -n "${MYSQL_ROOT_PASSWORD}" ]; then
    MYSQL_CMD=(mysql -u root "-p${MYSQL_ROOT_PASSWORD}")
  fi

  "\${MYSQL_CMD[@]}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
fi

# 4.2 Desempaquetar aplicación e instalar dependencias de producción
mkdir -p /opt/usta-plataforma/usta-api/data
tar -xzf /tmp/usta-deploy.tar.gz -C /opt/usta-plataforma
rm -f /tmp/usta-deploy.tar.gz

cd /opt/usta-plataforma
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --prod --frozen-lockfile || pnpm install --prod
elif command -v corepack >/dev/null 2>&1; then
  corepack enable || true
  corepack pnpm install --prod --frozen-lockfile || npx --yes pnpm@10 install --prod
else
  npx --yes pnpm@10 install --prod
fi

# 4.3 Crear archivo .env en el primer despliegue (preserva el existente en despliegues futuros)
if [ ! -f /opt/usta-plataforma/usta-api/.env ]; then
  echo "[Server] Generando /opt/usta-plataforma/usta-api/.env con secreto JWT criptográfico..."
  cp /opt/usta-plataforma/usta-api/.env.example /opt/usta-plataforma/usta-api/.env
  JWT_SECRET=\$(openssl rand -hex 32)
  sed -i "s|^AUTH_TOKEN_SECRET=.*|AUTH_TOKEN_SECRET=\${JWT_SECRET}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^PORT=.*|PORT=${APP_PORT}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_HOST=.*|DB_HOST=${DB_HOST}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_PORT=.*|DB_PORT=${DB_PORT}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_NAME=.*|DB_NAME=${DB_NAME}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_USER=.*|DB_USER=${DB_USER}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" /opt/usta-plataforma/usta-api/.env
  chmod 600 /opt/usta-plataforma/usta-api/.env
fi

# 4.4 Configurar servicio systemd para usta-api (sirve tanto la SPA Web como /api en el puerto ${APP_PORT})
NODE_BIN=\$(command -v node)
cat > /etc/systemd/system/usta-api.service <<SERVICE
[Unit]
Description=USTA Tunja Prenomina Plataforma Web + API
After=network.target mariadb.service mysqld.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/usta-plataforma/usta-api
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
EnvironmentFile=-/opt/usta-plataforma/usta-api/.env
ExecStart=\${NODE_BIN} /opt/usta-plataforma/usta-api/dist/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE

# 4.5 Ejecutar migraciones Kysely y seed inicial idempotente
cd /opt/usta-plataforma/usta-api
"\${NODE_BIN}" dist/database/migrate.cli.js
"\${NODE_BIN}" dist/database/seed.cli.js

chmod 600 /opt/usta-plataforma/usta-api/.env

systemctl daemon-reload
systemctl enable usta-api
systemctl restart usta-api

# 4.6 Abrir puerto ${APP_PORT} en firewall si firewalld o ufw están activos
if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-port=${APP_PORT}/tcp >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
elif command -v ufw >/dev/null 2>&1; then
  ufw allow ${APP_PORT}/tcp >/dev/null 2>&1 || true
fi

# 4.7 Verificación automática de salud
sleep 2
curl -fsS http://127.0.0.1:${APP_PORT}/api/health >/dev/null
echo "[Server] Health check http://127.0.0.1:${APP_PORT}/api/health OK"
EOF

rm -f "$BUNDLE_PATH"
SERVER_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost')"
echo "=============================================================================="
echo " ¡Despliegue completado exitosamente!"
echo " -> Acceso local en el servidor : http://localhost:${APP_PORT}"
echo " -> Acceso en red institucional : http://${DEPLOY_HOST:-$SERVER_IP}:${APP_PORT}"
echo "=============================================================================="
