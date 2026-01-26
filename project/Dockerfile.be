# Dockerfile.be
FROM php:8.2-apache

# Installazione estensioni PDO per MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Abilitazione modulo Rewrite per il routing
RUN a2enmod rewrite

# Forza l'AllowOverride All nel file di configurazione principale
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf


RUN echo "<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>" > /etc/apache2/conf-available/override.conf \
    && a2enconf override

WORKDIR /var/www/html