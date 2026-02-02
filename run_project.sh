#!/bin/bash

echo "Avvio Wiki UNIPR..."

# Percorso di storage per il backend
STORAGE_PATH="project/backend/storage/notes"

# 1. Preparazione cartelle
if [ -d "project" ]; then
    mkdir -p "$STORAGE_PATH"
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

# 2. Sincronizzazione appunti di prova
if [ -d "appunti_prova" ]; then
    echo "Importazione appunti di prova in $STORAGE_PATH..."
    cp -r appunti_prova/* "$STORAGE_PATH/"
else
    echo "Avviso: cartella 'appunti_prova' non trovata."
fi

cd project

# 3. Reset del Database (Specifico per Named Volumes)
echo "Vuoi resettare il database (cancellando i dati esistenti)? [S/N]"
read response

if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo "Resettaggio forzato del volume Docker..."
    # down -v rimuove i volumi definiti nel compose
    docker-compose down -v --remove-orphans
    # Forza la rimozione del volume nel caso docker-compose non ci riesca
    docker volume rm project_db_data 2>/dev/null
    echo "Volume rimosso."
else
    echo "Avvio standard..."
fi

# 4. Avvio
docker-compose up -d --build

echo "Attesa inizializzazione MySQL (15 secondi)..."
sleep 15

echo ""
echo "Servizi pronti:"
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:8000"