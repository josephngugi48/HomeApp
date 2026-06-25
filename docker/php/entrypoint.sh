#!/bin/sh
set -e

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
until php -r "mysqli_connect('db','laravel','secret','laravel');" >/dev/null 2>&1; do
  sleep 2
done
echo "✅ MySQL is up!"

# Run migrations + seed
php artisan migrate --seed --force

# Start PHP-FPM
exec php-fpm
