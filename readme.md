# Wiki UNIPR

Progetto per la condivisione di appunti universitari.

## Avvio del progetto

Per avviare l'applicazione si deve disporre di Docker(Desktop o Engine) seguire questi passaggi:

1. Aprire il terminale(Bash, PowerShell o WSL) nella cartella principale del progetto.
2. Fornire i permessi di esecuzione agli script:
   chmod +x *.sh
3. Eseguire lo script di avvio:
   ./run_project.sh

## Indirizzi di accesso

Una volta completato l'avvio, i servizi sono raggiungibili ai seguenti indirizzi:

* Frontend(pagina principale): http://localhost:8080
* Backend API: http://localhost:8000

## Utenti di test

Utilizzare le seguenti credenziali per testare le diverse funzionalità del sistema:

| Ruolo | Email | Password |
| --- | --- | --- |
| Amministratore | admin@unipr.it | Vector! |
| Studente | studente_test1@studenti.unipr.it | Prova1 |
| Studente | studente_test2@studenti.unipr.it | Prova2 |
| Studente | studente_test3@studenti.unipr.it | Prova3 |

## Gestione container

* Per fermare i servizi: ./stop_project.sh
* Per resettare completamente l'ambiente e il database: ./reset_all.sh
