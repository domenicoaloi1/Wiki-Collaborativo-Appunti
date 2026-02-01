#!/bin/bash

echo "RESET TOTALE DELL'AMBIENTE IN CORSO..."

if [ -d "project" ]; then
    echo "Rimozione file di storage e sottocartelle corsi..."
    rm -rf project/storage/notes/*
    
    cd project
    docker-compose down -v --remove-orphans
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

echo "Ricostruzione ambiente..."
docker-compose up -d --build

echo "Reset completato."