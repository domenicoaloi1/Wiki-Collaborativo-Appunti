#!/bin/bash

echo "Arresto Wiki UNIPR..."

if [ -d "project" ]; then
    cd project
    docker-compose down
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

echo "Tutti i servizi sono stati fermati."