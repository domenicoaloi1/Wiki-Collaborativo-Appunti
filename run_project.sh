#!/bin/bash

echo "Avvio Wiki UNIPR..."

# Percorso di storage per il backend
STORAGE_PATH="project/backend/storage/notes"
INIT_REQUIRED=false

# 1. Preparazione cartelle
if [ -d "project" ]; then
    mkdir -p "$STORAGE_PATH"
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

# 2. Gestione Database e Reset
echo "Vuoi resettare il database e lo storage? (Perderai i dati correnti) [S/N]"
read response

if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo "Resettaggio forzato del volume Docker..."
	cd project
	# down -v rimuove i volumi definiti nel compose
    docker-compose down -v --remove-orphans
	# Forza la rimozione del volume nel caso docker-compose non ci riesca
    docker volume rm project_db_data 2>/dev/null
	echo "Volume rimosso."
    cd ..
    # Se resetto il DB, devo resettare anche i file per coerenza col dump SQL
    rm -rf "$STORAGE_PATH"/*
    INIT_REQUIRED=true
else
    # Se non resetto, controllo se lo storage è vuoto (primo avvio in assoluto)
    if [ ! -d "$STORAGE_PATH" ] || [ -z "$(ls -A "$STORAGE_PATH")" ]; then
        echo "Storage vuoto rilevato: inizializzazione necessaria."
        INIT_REQUIRED=true
    else
        echo "Storage esistente rilevato: modalità persistenza attiva."
        INIT_REQUIRED=false
    fi
fi

# 3. Inizializzazione storage (solo se necessario)
if [ "$INIT_REQUIRED" = true ]; then
    if [ -d "appunti_prova" ]; then
        echo "Popolamento storage da appunti_prova..."
        mkdir -p "$STORAGE_PATH"
        cp -r appunti_prova/* "$STORAGE_PATH/"
    else
        echo "Avviso: appunti_prova non trovata, lo storage resterà vuoto."
    fi
fi

# 4. Avvio
cd project
docker-compose up -d --build

echo "Attesa inizializzazione MySQL (15 secondi)..."
sleep 15

echo ""
echo "Servizi pronti:"
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:8000"