#!/usr/bin/env bash
# ==============================================================================
# USTA Tunja · Plataforma de Gestión Docente y Prenómina
# Script de Aprovisionamiento y Despliegue Automatizado (AWS EC2 / Linux VM)
# ==============================================================================
# Uso rápido:
#   1) Directamente dentro del servidor / escritorio remoto Linux (después de git clone):
#      ./deploy.sh --local [--domain prenomina.santototunja.edu.co]
#
#   2) Desde tu equipo por SSH con llave (.pem de AWS EC2):
#      ./deploy.sh --host 54.xxx.xxx.xxx --user ubuntu --key ~/.ssh/usta-aws.pem
#
#   3) Desde tu equipo por SSH con usuario/contraseña:
#      ./deploy.sh --host 54.xxx.xxx.xxx --user ubuntu --domain prenomina.santototunja.edu.co
# ==============================================================================

set -euo pipefail

DEPLOY_LOCAL="false"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-}"
DOMAIN_NAME="${DOMAIN_NAME:-_}"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-usta_prenomina_tunja}"
DB_USER="${DB_USER:-usta_app}"
DB_PASSWORD="${DB_PASSWORD:-usta_app_local}"

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

echo "==> 1. Compilando monorepo TypeScript estricto (@usta/domain, usta-api y usta-web)..."
cd "$ROOT_DIR"
npm --prefix packages/domain run build
npm --prefix usta-api run build
npm --prefix usta-web run build

echo "==> 2. Empaquetando artefactos de producción..."
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

run_remote_or_local() {
  if [[ "$DEPLOY_LOCAL" == "true" ]]; then
    echo "==> 3. Ejecutando aprovisionamiento local en este servidor..."
    sudo bash -e -s
  else
    SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
    SSH_OPTS=(-p "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
    SCP_OPTS=(-P "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
    if [[ -n "$DEPLOY_SSH_KEY" ]]; then
      SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
      SCP_OPTS+=(-i "$DEPLOY_SSH_KEY")
    fi
    echo "==> 3. Subiendo paquete a ${SSH_TARGET}..."
    scp "${SCP_OPTS[@]}" "$BUNDLE_PATH" "${SSH_TARGET}:/tmp/usta-deploy.tar.gz"
    echo "==> 4. Aprovisionando servidor AWS/Linux y actualizando servicios..."
    ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo bash -e -s"
  fi
}

run_remote_or_local <<EOF
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

# 4.1 Instalar dependencias base (Node.js 22 LTS, Nginx, MariaDB si es local) en primer despliegue
if ! command -v node >/dev/null 2>&1; then
  echo "[Server] Instalando Node.js 22 LTS..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg openssl
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "[Server] Instalando Nginx..."
  apt-get update -y
  apt-get install -y nginx
fi

if [ "${DB_HOST}" = "127.0.0.1" ] || [ "${DB_HOST}" = "localhost" ]; then
  if ! command -v mariadb >/dev/null 2>&1; then
    echo "[Server] Instalando MariaDB Server..."
    apt-get update -y
    apt-get install -y mariadb-server
    systemctl enable --now mariadb
  fi

  mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
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
corepack enable
corepack pnpm install --prod --frozen-lockfile

# 4.3 Crear archivo .env en el primer despliegue (preserva el existente en despliegues futuros)
if [ ! -f /opt/usta-plataforma/usta-api/.env ]; then
  echo "[Server] Generando /opt/usta-plataforma/usta-api/.env con secreto JWT criptográfico..."
  cp /opt/usta-plataforma/usta-api/.env.example /opt/usta-plataforma/usta-api/.env
  JWT_SECRET=\$(openssl rand -hex 32)
  sed -i "s|^AUTH_TOKEN_SECRET=.*|AUTH_TOKEN_SECRET=\${JWT_SECRET}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_HOST=.*|DB_HOST=${DB_HOST}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_PORT=.*|DB_PORT=${DB_PORT}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_NAME=.*|DB_NAME=${DB_NAME}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_USER=.*|DB_USER=${DB_USER}|" /opt/usta-plataforma/usta-api/.env
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" /opt/usta-plataforma/usta-api/.env
  chmod 600 /opt/usta-plataforma/usta-api/.env
fi

# 4.4 Configurar servicio systemd para usta-api
cat > /etc/systemd/system/usta-api.service <<SERVICE
[Unit]
Description=USTA Tunja Prenomina REST API
After=network.target mariadb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/usta-plataforma/usta-api
Environment=NODE_ENV=production
Environment=PORT=4301
EnvironmentFile=-/opt/usta-plataforma/usta-api/.env
ExecStart=/usr/bin/node /opt/usta-plataforma/usta-api/dist/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE

# 4.5 Ejecutar migraciones Kysely y seed inicial idempotente
cd /opt/usta-plataforma/usta-api
/usr/bin/node dist/database/migrate.cli.js
/usr/bin/node dist/database/seed.cli.js

# 4.6 Configurar Nginx (Frontend SPA + Reverse Proxy /api)
cat > /etc/nginx/sites-available/usta-plataforma <<NGINX
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    client_max_body_size 15M;
    root /opt/usta-plataforma/usta-web/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location /api/ {
        proxy_pass http://127.0.0.1:4301/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }

    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/usta-plataforma /etc/nginx/sites-enabled/usta-plataforma
rm -f /etc/nginx/sites-enabled/default

chown -R www-data:www-data /opt/usta-plataforma
chmod 600 /opt/usta-plataforma/usta-api/.env

systemctl daemon-reload
systemctl enable usta-api
systemctl restart usta-api
nginx -t
systemctl reload nginx

# 4.7 Verificación automática de salud
sleep 2
curl -fsS http://127.0.0.1:4301/api/health >/dev/null
echo "[Server] Health check /api/health OK"
EOF

rm -f "$BUNDLE_PATH"
echo "==> ¡Despliegue completado exitosamente en http://${DEPLOY_HOST:-localhost} !"
