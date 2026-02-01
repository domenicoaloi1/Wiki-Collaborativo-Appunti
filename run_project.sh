#!/bin/bash

echo "Avvio Wiki UNIPR..."

# Verifica esistenza cartella project e creazione directory storage
if [ -d "project" ]; then
    mkdir -p project/storage/notes
else
    echo "Errore: cartella 'project' non trovata."
    exit 1
fi

# Copia ricorsiva degli appunti organizzati per ID corso
if [ -d "appunti_prova" ]; then
    echo "Importazione appunti di prova (struttura per ID corso)..."
    cp -r appunti_prova/* project/storage/notes/
else
    echo "Avviso: cartella 'appunti_prova' non trovata."
fi

cd project

# Richiesta di reset database
echo "Vuoi resettare il database (cancellando i dati esistenti)? [s/N]"
read response

if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo "Pulizia volumi e reset database in corso..."
    docker-compose down -v
else
    echo "Avvio standard..."
fi

docker-compose up -d --build

echo "Attesa inizializzazione Database (10 secondi)..."
sleep 10

echo ""
echo "Servizi pronti:"
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:8000"