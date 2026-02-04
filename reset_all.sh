#!/bin/bash

echo "RESET TOTALE AMBIENTE (MySQL e Storage appunti)..."

if [ -d "project" ]; then
	# 1. Fermo i container e rimuovo i volumi
    cd project
    docker-compose down -v --remove-orphans
    
    # 2. Pulizia fisica dello storage dei file
    echo "Pulizia storage appunti..."
    rm -rf backend/storage/notes/*
    
    # 3. Ripristino file di prova
    cd ..
    if [ -d "appunti_prova" ]; then
        echo "Ripristino file da appunti_prova..."
        cp -r appunti_prova/* project/backend/storage/notes/
    fi
    
    # 4. Ricostruzione e avvio
    cd project
    docker-compose build --no-cache
    docker-compose up -d
	
	echo "Attesa inizializzazione MySQL (15 secondi)..."
	sleep 15
	
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

echo "Ambiente ricostruito con successo."