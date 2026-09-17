#!/bin/bash

# Elevate Interiors - Production Deployment & Optimization Script
# Target: elevateinteriors.space (Railway / Docker)

echo "🚀 Starting Post-Deployment Tasks..."

# 1. Backend Dependencies
echo "📦 Optimizing PHP dependencies..."
composer install --optimize-autoloader --no-dev

# 2. Database Tasks
echo "🗄️ Running migrations..."
php artisan migrate --force

echo "🌱 Seeding initial data..."
php artisan db:seed --force

# 2. Optimization
echo "⚡ Optimizing caches..."
# Note: APP_URL and ASSET_URL should be set in your platform environment settings 
# (Laravel Cloud / Hostinger) to avoid redirection issues.


# --- NUCLEAR CACHE CLEAR ---
echo "🧨 Nuclear Cache Clear..."
rm -f bootstrap/cache/config.php
rm -f bootstrap/cache/routes.php
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/packages.php

# 3. Clear and cache config
# Clear caches first to ensure fresh state
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Storage
echo "🔗 Ensuring storage link exists..."
php artisan storage:link --force

echo "✅ Post-Deployment Tasks Successful!"
