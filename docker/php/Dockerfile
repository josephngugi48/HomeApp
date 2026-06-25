FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev libjpeg-dev libfreetype6-dev nodejs npm

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy the Laravel app
COPY . /var/www/html

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node packages and build frontend
RUN npm install && npm run build

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache


CMD ["php-fpm"]
