# Dockerfile.be
# 8.3: la 8.2 esce dal supporto di sicurezza il 31/12/2026.
# Tag senza patch fissa: si aggiorna solo se la build riscarica la base (build --pull).
FROM php:8.3-apache

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