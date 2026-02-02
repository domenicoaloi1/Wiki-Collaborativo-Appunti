#!/bin/bash

echo "RESET TOTALE AMBIENTE (MySQL)..."

if [ -d "project" ]; then
    # 1. Pulizia file fisici storage
    rm -rf project/backend/storage/notes/*
    
    cd project
    
    # 2. Spegnimento totale e rimozione volumi definiti
    docker-compose down -v --remove-orphans
    
    # 3. Rimozione manuale del volume nominato (percorso sicuro)
    # Prendiamo il nome della cartella attuale per identificare il volume
    PROJECT_NAME=$(basename "$PWD")
    VOLUME_NAME="${PROJECT_NAME}_db_data"
    
    echo "Rimozione forzata del volume: $VOLUME_NAME"
    docker volume rm "$VOLUME_NAME" 2>/dev/null
    
    # 4. Pulizia cache build
    docker-compose build --no-cache
    
    # 5. Riavvio
    docker-compose up -d
	
	echo "Attesa inizializzazione MySQL (15 secondi)..."
	sleep 15
	
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

echo "Ambiente ricostruito con successo."