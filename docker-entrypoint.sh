#!/bin/bash
set -e

# -----------------------------------------------------------------------------
# Apache MPM Configuration (Prevents AH00534: More than one MPM loaded)
# -----------------------------------------------------------------------------
echo "⚙️ Ensuring single Apache MPM (prefork) is active..."
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* 2>/dev/null || true
if [ ! -f /etc/apache2/mods-enabled/mpm_prefork.load ]; then
    a2enmod mpm_prefork 2>/dev/null || true
fi

# -----------------------------------------------------------------------------
# Railway Dynamic Port Configuration
# -----------------------------------------------------------------------------
# Railway dynamically allocates $PORT to the container.
# Apache must listen on this port rather than static 80.
PORT="${PORT:-80}"
echo "🔧 Configuring Apache to listen on port ${PORT}..."

if [ -f /etc/apache2/ports.conf ]; then
    sed -i "s/Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
fi

if [ -d /etc/apache2/sites-available ]; then
    sed -i "s/<VirtualHost \*:.*>/<VirtualHost \*:${PORT}>/" /etc/apache2/sites-available/*.conf
fi

# -----------------------------------------------------------------------------
# Storage & Framework Directory Setup
# -----------------------------------------------------------------------------
echo "📁 Setting up storage and cache directories..."
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# -----------------------------------------------------------------------------
# Storage Symlink
# -----------------------------------------------------------------------------
echo "🔗 Ensuring storage symlink is active..."
php artisan storage:link --force || true

# -----------------------------------------------------------------------------
# Database Migrations (Optional on Startup)
# -----------------------------------------------------------------------------
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🗄️ Running database migrations..."
    php artisan migrate --force || echo "⚠️ Migrations failed or database is not yet reachable. Continuing startup..."
fi

# -----------------------------------------------------------------------------
# Production Optimization (Only if APP_KEY is provided)
# -----------------------------------------------------------------------------
if [ -n "$APP_KEY" ]; then
    echo "⚡ Caching Laravel configuration and routes..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "🔍 Validating Apache configuration..."
apache2ctl -t || true

echo "🚀 Elevate Interiors container initialization complete. Starting web server on port ${PORT}..."
exec "$@"
