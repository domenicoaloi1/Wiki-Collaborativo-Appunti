#!/bin/bash

echo "RESET TOTALE AMBIENTE (MySQL e Storage appunti)..."

if [ -d "project" ]; then
	# 1. Fermo i container e rimuovo i volumi
    cd project
    docker compose down -v --remove-orphans
    
    # 2. Pulizia fisica dello storage dei file
    echo "Pulizia storage appunti..."
    # Tengo README.md: file tracciato che mantiene la cartella nel repo
    find backend/storage/notes -mindepth 1 -maxdepth 1 ! -name README.md -exec rm -rf {} +
    
    # 3. Ripristino file di prova
    cd ..
    if [ -d "appunti_prova" ]; then
        echo "Ripristino file da appunti_prova..."
        cp -r appunti_prova/* project/backend/storage/notes/
    fi
    
    # 4. Ricostruzione e avvio
    cd project
    docker compose build --no-cache
    # --wait: torna solo quando db e' healthy (healthcheck nel compose) e il backend e' partito
    docker compose up -d --wait
	
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

echo "Ambiente ricostruito con successo."