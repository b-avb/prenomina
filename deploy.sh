#!/usr/bin/env bash
# Production provisioning and deployment script for the USTA Tunja payroll platform.
# Supports Debian/Ubuntu (`apt-get`) and RHEL/Rocky/AlmaLinux (`dnf`/`yum`) hosts
# running MySQL 8.x or MariaDB 10/11 behind Apache httpd.
#
# Usage:
#   Local execution on target host:  ./deploy.sh --local
#   Remote execution over SSH:       ./deploy.sh --host <ip-or-hostname> --user <ssh-user>

set -euo pipefail

DEPLOY_LOCAL="false"
DEPLOY_FROM_BUNDLE="false"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-}"
DOMAIN_NAME="${DOMAIN_NAME:-campusvirtual.santototunja.edu.co}"
APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-4301}"
PUBLIC_ORIGIN="${PUBLIC_ORIGIN:-https://${DOMAIN_NAME}}"

DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-}"
DB_NAME="${DB_NAME:-}"
DB_USER="${DB_USER:-}"
DB_PASSWORD="${DB_PASSWORD:-}"
MYSQL_ADMIN_USER="${MYSQL_ADMIN_USER:-root}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local)
      DEPLOY_LOCAL="true"
      shift
      ;;
    --from-bundle)
      DEPLOY_FROM_BUNDLE="true"
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
      PUBLIC_ORIGIN="https://${DOMAIN_NAME}"
      shift 2
      ;;
    --help|-h)
      sed -n '2,8p' "${BASH_SOURCE[0]}"
      exit 0
      ;;
    *)
      echo "Opción desconocida: $1 (usa --help para ver las opciones)"
      exit 1
      ;;
  esac
done

if [[ "$DEPLOY_LOCAL" != "true" && "$DEPLOY_FROM_BUNDLE" != "true" && -z "$DEPLOY_HOST" ]]; then
  echo "ERROR: Usa './deploy.sh --local' dentro del servidor, o './deploy.sh --host <IP>' por SSH."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE_PATH="/tmp/usta-deploy.tar.gz"
ENV_FILE="/opt/usta-plataforma/usta-api/.env"
UPLOADS_PATH="/opt/usta-plataforma/usta-api/uploads"

run_as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  else
    sudo "$@"
  fi
}

read_existing_env() {
  local key="$1"
  if [[ -f "$ENV_FILE" ]]; then
    run_as_root grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -n1 | cut -d= -f2- || true
  fi
}

upsert_env_var() {
  local key="$1"
  local val="$2"
  local file="$3"
  if run_as_root grep -qE "^${key}=" "$file" 2>/dev/null; then
    local escaped_val
    escaped_val="$(printf '%s' "$val" | sed -e 's/[\/&|]/\\&/g')"
    run_as_root sed -i "s|^${key}=.*|${key}=${escaped_val}|" "$file"
  else
    printf '%s=%s\n' "$key" "$val" | run_as_root tee -a "$file" >/dev/null
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

# Build and package production artifacts unless invoked on the remote host via `--from-bundle`.
if [[ "$DEPLOY_FROM_BUNDLE" != "true" ]]; then
  echo "==> 1. Instalando dependencias del monorepo (node_modules)..."
  cd "$ROOT_DIR"
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile || pnpm install
  else
    npx --yes pnpm@10 install
  fi

  echo "==> 2. Compilando monorepo TypeScript estricto (@usta/domain, usta-api build:prod y usta-web)..."
  cd "$ROOT_DIR"
  npm --prefix packages/domain run build
  npm --prefix usta-api run build:prod
  npm --prefix usta-web run build

  echo "==> 3. Empaquetando artefactos limpios de producción..."
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
fi

# Remote deployment mode (`--host`): upload prebuilt tarball and re-invoke with `--from-bundle`.
if [[ "$DEPLOY_LOCAL" != "true" && "$DEPLOY_FROM_BUNDLE" != "true" ]]; then
  SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
  SSH_OPTS=(-p "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
  SCP_OPTS=(-P "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
  if [[ -n "$DEPLOY_SSH_KEY" ]]; then
    SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
    SCP_OPTS+=(-i "$DEPLOY_SSH_KEY")
  fi

  echo "==> 4. Subiendo artefactos compilados y script a ${SSH_TARGET}..."
  scp "${SCP_OPTS[@]}" "$BUNDLE_PATH" "${SSH_TARGET}:/tmp/usta-deploy.tar.gz"
  scp "${SCP_OPTS[@]}" "${BASH_SOURCE[0]}" "${SSH_TARGET}:/tmp/usta-deploy.sh"
  rm -f "$BUNDLE_PATH"

  echo "==> 5. Ejecutando instalación en servidor ${SSH_TARGET}..."
  ssh -t "${SSH_OPTS[@]}" "$SSH_TARGET" \
    "sudo DOMAIN_NAME='${DOMAIN_NAME}' APP_PORT='${APP_PORT}' bash /tmp/usta-deploy.sh --from-bundle && sudo rm -f /tmp/usta-deploy.sh"
  exit 0
fi

# Target-host installation (`--local` or `--from-bundle`).
if [[ ! -f "$BUNDLE_PATH" ]]; then
  echo "ERROR: No se encontró el paquete de despliegue en ${BUNDLE_PATH}."
  exit 1
fi

echo "==> 4. Configurando MySQL / MariaDB y preservando configuración previa..."

EXISTING_DB_HOST="$(read_existing_env DB_HOST)"
EXISTING_DB_PORT="$(read_existing_env DB_PORT)"
EXISTING_DB_NAME="$(read_existing_env DB_NAME)"
EXISTING_DB_USER="$(read_existing_env DB_USER)"
EXISTING_DB_PASS="$(read_existing_env DB_PASSWORD)"
EXISTING_CORS="$(read_existing_env CORS_ORIGIN)"

DB_HOST="${DB_HOST:-${EXISTING_DB_HOST:-127.0.0.1}}"
DB_PORT="${DB_PORT:-${EXISTING_DB_PORT:-3306}}"
DB_NAME="${DB_NAME:-${EXISTING_DB_NAME:-usta_prenomina_tunja}}"
DB_USER="${DB_USER:-${EXISTING_DB_USER:-usta_app}}"

if [[ -z "$DB_PASSWORD" && -n "$EXISTING_DB_PASS" && "$EXISTING_DB_PASS" != "usta_secret_password" && "$EXISTING_DB_PASS" != "usta_app_local" ]]; then
  DB_PASSWORD="$EXISTING_DB_PASS"
fi
if [[ -z "$DB_PASSWORD" ]]; then
  DB_PASSWORD="Usta*$(openssl rand -hex 12)9A"
fi

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

  if MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" -e "SELECT 1" >/dev/null 2>&1; then
    echo "[Server] Conexión MySQL existente verificada para '${DB_USER}'@'${DB_HOST}:${DB_PORT}' (${DB_NAME})."
  else
    SQL_SETUP="
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
"
    if mysql -u "$MYSQL_ADMIN_USER" -e "SELECT 1" >/dev/null 2>&1; then
      mysql -u "$MYSQL_ADMIN_USER" -e "$SQL_SETUP"
    elif [[ -n "$MYSQL_ROOT_PASSWORD" ]] && MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u "$MYSQL_ADMIN_USER" -e "SELECT 1" >/dev/null 2>&1; then
      MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u "$MYSQL_ADMIN_USER" -e "$SQL_SETUP"
    else
      echo ""
      echo "Se requiere autenticar en MySQL con '${MYSQL_ADMIN_USER}' para aprovisionar '${DB_NAME}'."
      mysql -u "$MYSQL_ADMIN_USER" -p -e "$SQL_SETUP"
    fi
  fi
fi

echo "==> 5. Instalando aplicación en /opt/usta-plataforma con usuario de sistema sin privilegios..."
if ! id -u ustaapp >/dev/null 2>&1; then
  run_as_root useradd --system --no-create-home --shell /usr/sbin/nologin ustaapp || \
    run_as_root useradd -r -s /sbin/nologin ustaapp
fi

run_as_root mkdir -p /opt/usta-plataforma
run_as_root rm -rf /opt/usta-plataforma/usta-api/dist /opt/usta-plataforma/usta-web/dist /opt/usta-plataforma/packages/domain/dist /opt/usta-plataforma/usta-api/data
run_as_root tar -xzf "$BUNDLE_PATH" -C /opt/usta-plataforma
rm -f "$BUNDLE_PATH"
run_as_root mkdir -p "$UPLOADS_PATH"

cd /opt/usta-plataforma
if command -v pnpm >/dev/null 2>&1; then
  run_as_root pnpm install --prod --frozen-lockfile || run_as_root pnpm install --prod
else
  run_as_root npx --yes pnpm@10 install --prod
fi

# Initialize or update `.env` while preserving existing `AUTH_TOKEN_SECRET`, `AUTH_MODE`, and `AZURE_*` settings.
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[Server] Generando ${ENV_FILE} con secreto JWT criptográfico..."
  run_as_root cp /opt/usta-plataforma/usta-api/.env.example "$ENV_FILE"
  JWT_SECRET="$(openssl rand -hex 32)"
  upsert_env_var "AUTH_TOKEN_SECRET" "$JWT_SECRET" "$ENV_FILE"
else
  CURRENT_SECRET="$(read_existing_env AUTH_TOKEN_SECRET)"
  if [[ -z "$CURRENT_SECRET" || ${#CURRENT_SECRET} -lt 32 || "$CURRENT_SECRET" == *"replace-with"* ]]; then
    JWT_SECRET="$(openssl rand -hex 32)"
    upsert_env_var "AUTH_TOKEN_SECRET" "$JWT_SECRET" "$ENV_FILE"
  fi
fi

EFFECTIVE_CORS="${CORS_ORIGIN:-}"
if [[ -z "$EFFECTIVE_CORS" ]]; then
  if [[ -n "$EXISTING_CORS" && "$EXISTING_CORS" != "*" ]]; then
    EFFECTIVE_CORS="$EXISTING_CORS"
  else
    EFFECTIVE_CORS="${PUBLIC_ORIGIN},http://localhost:${APP_PORT},http://127.0.0.1:${APP_PORT}"
  fi
fi

upsert_env_var "NODE_ENV" "production" "$ENV_FILE"
upsert_env_var "HOST" "$APP_HOST" "$ENV_FILE"
upsert_env_var "PORT" "$APP_PORT" "$ENV_FILE"
upsert_env_var "CORS_ORIGIN" "$EFFECTIVE_CORS" "$ENV_FILE"
upsert_env_var "TRUST_PROXY" "true" "$ENV_FILE"
upsert_env_var "UPLOADS_DIR" "$UPLOADS_PATH" "$ENV_FILE"
upsert_env_var "DB_HOST" "$DB_HOST" "$ENV_FILE"
upsert_env_var "DB_PORT" "$DB_PORT" "$ENV_FILE"
upsert_env_var "DB_NAME" "$DB_NAME" "$ENV_FILE"
upsert_env_var "DB_USER" "$DB_USER" "$ENV_FILE"
upsert_env_var "DB_PASSWORD" "$DB_PASSWORD" "$ENV_FILE"

run_as_root chown -R ustaapp:ustaapp /opt/usta-plataforma/usta-api "$UPLOADS_PATH"
run_as_root chmod 750 "$UPLOADS_PATH"
run_as_root chmod 600 "$ENV_FILE"

NODE_BIN="$(command -v node)"
echo "==> 6. Ejecutando migraciones Kysely y sincronización inicial segura en MySQL/MariaDB..."
cd /opt/usta-plataforma/usta-api
run_as_root -u ustaapp "$NODE_BIN" dist/database/migrate.cli.js || run_as_root "$NODE_BIN" dist/database/migrate.cli.js
run_as_root -u ustaapp "$NODE_BIN" dist/database/seed.cli.js || run_as_root "$NODE_BIN" dist/database/seed.cli.js

echo "==> 7. Configurando servicio systemd (usta-api.service en ${APP_HOST}:${APP_PORT})..."
run_as_root tee /etc/systemd/system/usta-api.service >/dev/null <<SERVICE
[Unit]
Description=USTA Tunja Prenomina Plataforma Web + API
After=network.target mysqld.service mariadb.service

[Service]
Type=simple
User=ustaapp
Group=ustaapp
WorkingDirectory=/opt/usta-plataforma/usta-api
Environment=NODE_ENV=production
EnvironmentFile=/opt/usta-plataforma/usta-api/.env
ExecStart=${NODE_BIN} /opt/usta-plataforma/usta-api/dist/server.js
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SERVICE

run_as_root systemctl daemon-reload
run_as_root systemctl enable usta-api
run_as_root systemctl restart usta-api

sleep 2
curl -fsS "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null
echo "[Server] Health check http://127.0.0.1:${APP_PORT}/api/health OK"

echo "==> 8. Configurando Reverse Proxy Apache (/prenomina y /app/prenomina) y permisos SELinux..."
if command -v setsebool >/dev/null 2>&1; then
  run_as_root setsebool -P httpd_can_network_connect 1 >/dev/null 2>&1 || true
fi

WEB_TARGET_DIR=""
if [[ -d "/var/app/www/html/prenomina" ]]; then
  WEB_TARGET_DIR="/var/app/www/html/prenomina"
elif [[ -d "/var/www/html/app/prenomina" ]]; then
  WEB_TARGET_DIR="/var/www/html/app/prenomina"
elif [[ -d "/var/www/html/prenomina" ]]; then
  WEB_TARGET_DIR="/var/www/html/prenomina"
elif [[ "$ROOT_DIR" == /var/* ]]; then
  WEB_TARGET_DIR="$ROOT_DIR"
fi

if [[ -n "$WEB_TARGET_DIR" ]]; then
  echo "[Server] Publicando frontend compilado en ${WEB_TARGET_DIR}..."
  if [[ "$WEB_TARGET_DIR" != "$ROOT_DIR" ]]; then
    run_as_root rm -rf "${WEB_TARGET_DIR}/assets" "${WEB_TARGET_DIR}/lordicons"
  else
    run_as_root rm -rf "${WEB_TARGET_DIR}/assets"
  fi
  run_as_root cp -r /opt/usta-plataforma/usta-web/dist/. "$WEB_TARGET_DIR"/

  run_as_root tee "${WEB_TARGET_DIR}/api-proxy.php" >/dev/null <<PHPPROXY
<?php
\$path = isset(\$_GET['path']) ? \$_GET['path'] : '';
\$qs = \$_SERVER['QUERY_STRING'] ?? '';
\$qs = preg_replace('/(^|&)path=[^&]*(&|$)/', '\$1', \$qs);
\$qs = trim(\$qs, '&');
\$target = 'http://127.0.0.1:${APP_PORT}/api/' . ltrim(\$path, '/') . (\$qs !== '' ? '?' . \$qs : '');

\$method = \$_SERVER['REQUEST_METHOD'] ?? 'GET';
\$body = file_get_contents('php://input');
\$headers = [];

if (!empty(\$_SERVER['CONTENT_TYPE'])) {
    \$headers[] = 'Content-Type: ' . \$_SERVER['CONTENT_TYPE'];
}
if (!empty(\$_SERVER['HTTP_ACCEPT'])) {
    \$headers[] = 'Accept: ' . \$_SERVER['HTTP_ACCEPT'];
}

\$authHeader = \$_SERVER['HTTP_AUTHORIZATION'] ?? \$_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (\$authHeader === '' && function_exists('getallheaders')) {
    foreach (getallheaders() as \$k => \$v) {
        if (strtolower(\$k) === 'authorization') {
            \$authHeader = \$v;
            break;
        }
    }
}
if (\$authHeader !== '') {
    \$headers[] = 'Authorization: ' . \$authHeader;
}

if (!empty(\$_SERVER['HTTP_X_ACADEMIC_PERIOD'])) {
    \$headers[] = 'X-Academic-Period: ' . \$_SERVER['HTTP_X_ACADEMIC_PERIOD'];
}
if (!empty(\$_SERVER['REMOTE_ADDR'])) {
    \$headers[] = 'X-Forwarded-For: ' . \$_SERVER['REMOTE_ADDR'];
}

\$upstreamContentDisposition = '';
\$ch = curl_init(\$target);
curl_setopt(\$ch, CURLOPT_CUSTOMREQUEST, \$method);
curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt(\$ch, CURLOPT_HTTPHEADER, \$headers);
curl_setopt(\$ch, CURLOPT_TIMEOUT, 30);
curl_setopt(\$ch, CURLOPT_HEADERFUNCTION, function (\$curl, \$headerLine) use (&\$upstreamContentDisposition) {
    if (stripos(\$headerLine, 'Content-Disposition:') === 0) {
        \$upstreamContentDisposition = trim(\$headerLine);
    }
    return strlen(\$headerLine);
});

if (\$method !== 'GET' && \$method !== 'HEAD' && \$body !== false && \$body !== '') {
    curl_setopt(\$ch, CURLOPT_POSTFIELDS, \$body);
}

\$response = curl_exec(\$ch);
if (\$response === false) {
    curl_close(\$ch);
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'code' => 'INTERNAL_ERROR',
        'error' => 'El servicio interno de prenómina no se encuentra disponible temporalmente.',
    ]);
    exit;
}

\$status = curl_getinfo(\$ch, CURLINFO_HTTP_CODE) ?: 502;
\$contentType = curl_getinfo(\$ch, CURLINFO_CONTENT_TYPE) ?: 'application/json; charset=utf-8';
curl_close(\$ch);

http_response_code(\$status);
header('Content-Type: ' . \$contentType);
header('X-Content-Type-Options: nosniff');
if (\$upstreamContentDisposition !== '') {
    header(\$upstreamContentDisposition);
}
echo \$response;
PHPPROXY

  run_as_root tee "${WEB_TARGET_DIR}/.htaccess" >/dev/null <<'HTACCESS'
DirectoryIndex index.html index.php
Options -Indexes

<IfModule mod_authz_core.c>
  CGIPassAuth On
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP:Authorization} .+
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

  # Deny direct HTTP access to dotfiles, deployment scripts, and monorepo source directories.
  RewriteRule (^|/)\.(?!well-known/) - [F,L]
  RewriteRule ^(deploy\.sh|package\.json|pnpm-.*|tsconfig.*|README\.md|usta-api|usta-web|packages|node_modules)(/|$) - [F,L]

  RewriteRule ^api/(.*)$ api-proxy.php?path=$1 [QSA,L]
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
HTACCESS

  run_as_root chmod 755 "$WEB_TARGET_DIR"
  run_as_root chmod -R a+rX "${WEB_TARGET_DIR}/index.html" "${WEB_TARGET_DIR}/assets" "${WEB_TARGET_DIR}/images" "${WEB_TARGET_DIR}/.htaccess" "${WEB_TARGET_DIR}/api-proxy.php" 2>/dev/null || true
  if command -v chcon >/dev/null 2>&1; then
    run_as_root chcon -R -t httpd_sys_content_t "$WEB_TARGET_DIR" >/dev/null 2>&1 || true
  fi
  if command -v restorecon >/dev/null 2>&1; then
    run_as_root restorecon -R "$WEB_TARGET_DIR" >/dev/null 2>&1 || true
  fi
fi

write_apache_proxy_conf() {
  local conf_path="$1"
  run_as_root tee "$conf_path" >/dev/null <<APACHECONF
<IfModule mod_proxy.c>
  ProxyRequests Off
  ProxyPreserveHost On
  ProxyPassInherit On

  <Location "/app/prenomina/api/">
    ProxyPass "http://127.0.0.1:${APP_PORT}/api/"
    ProxyPassReverse "http://127.0.0.1:${APP_PORT}/api/"
    Require all granted
  </Location>

  <Location "/app/prenomina/">
    ProxyPass "http://127.0.0.1:${APP_PORT}/"
    ProxyPassReverse "http://127.0.0.1:${APP_PORT}/"
    Require all granted
  </Location>

  <Location "/prenomina/api/">
    ProxyPass "http://127.0.0.1:${APP_PORT}/api/"
    ProxyPassReverse "http://127.0.0.1:${APP_PORT}/api/"
    Require all granted
  </Location>

  <Location "/prenomina/">
    ProxyPass "http://127.0.0.1:${APP_PORT}/"
    ProxyPassReverse "http://127.0.0.1:${APP_PORT}/"
    Require all granted
  </Location>
</IfModule>

<Directory "${WEB_TARGET_DIR:-/var/app/www/html/prenomina}">
  Options FollowSymLinks -Indexes
  AllowOverride All
  Require all granted
</Directory>
APACHECONF
}

if [[ -d "/etc/httpd/conf.d" ]]; then
  echo "[Server] Configurando Reverse Proxy en /etc/httpd/conf.d/usta-prenomina.conf..."
  write_apache_proxy_conf "/etc/httpd/conf.d/usta-prenomina.conf"
  run_as_root systemctl reload httpd 2>/dev/null || run_as_root systemctl restart httpd 2>/dev/null || true
elif [[ -d "/etc/apache2/conf-enabled" ]]; then
  run_as_root a2enmod proxy proxy_http rewrite headers >/dev/null 2>&1 || true
  write_apache_proxy_conf "/etc/apache2/conf-enabled/usta-prenomina.conf"
  run_as_root systemctl reload apache2 2>/dev/null || run_as_root systemctl restart apache2 2>/dev/null || true
fi

echo "=============================================================================="
echo " ¡Despliegue completado exitosamente!"
echo " -> Acceso público institucional : ${PUBLIC_ORIGIN}/app/prenomina/"
echo " -> Ruta alternativa subpath     : ${PUBLIC_ORIGIN}/prenomina/"
echo " -> Servicio interno loopback    : http://127.0.0.1:${APP_PORT}/api/health"
echo "=============================================================================="
