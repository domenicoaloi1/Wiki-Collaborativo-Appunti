#!/bin/bash
# Esegue i test PHPUnit del backend dentro un container php:8.2-cli.
# Non serve PHP installato in locale: basta Docker.
# Uso: ./run_tests.sh [opzioni di phpunit, es. --filter Proxy]

set -e
cd "$(dirname "$0")/project/backend"

PHPUNIT_VERSION="10"
CACHE_DIR="tests/.cache"
PHAR="$CACHE_DIR/phpunit.phar"

# 1. Scarico PHPUnit (una volta sola, poi resta in cache; la cartella è in .gitignore)
mkdir -p "$CACHE_DIR"
if [ ! -f "$PHAR" ]; then
    echo "Scarico PHPUnit $PHPUNIT_VERSION..."
    curl -sSL -o "$PHAR" "https://phar.phpunit.de/phpunit-$PHPUNIT_VERSION.phar"
fi

# 2. Percorso host per il bind mount (Git Bash su Windows converte i path: uso quello nativo)
HOST_DIR="$PWD"
if command -v cygpath >/dev/null 2>&1; then
    HOST_DIR="$(cygpath -w "$PWD")"
    export MSYS_NO_PATHCONV=1
fi

# 3. Esecuzione
docker run --rm -v "$HOST_DIR:/app" -w /app php:8.2-cli php "$PHAR" "$@"
