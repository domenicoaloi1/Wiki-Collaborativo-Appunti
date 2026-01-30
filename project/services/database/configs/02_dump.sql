-- services/database/configs/02_dump.sql

-- Dati di test

-- Corsi
INSERT IGNORE INTO corsi (id, nome) VALUES (1, 'Informatica'), (2, 'Matematica'), (3, 'Fisica');

-- Argomenti per Informatica
INSERT IGNORE INTO argomenti (id, nome, corso_id) VALUES 
(1, 'Programmazione 1', 1), 
(2, 'Basi di Dati', 1);

-- Argomenti per Matematica
INSERT IGNORE INTO argomenti (id, nome, corso_id) VALUES 
(3, 'Analisi Matematica', 2);

-- Argomenti per Fisica
INSERT IGNORE INTO argomenti (id, nome, corso_id) VALUES 
(4, 'Meccanica', 3),
(5, 'Termodinamica', 3)
;

-- Appunti legati agli argomenti
INSERT IGNORE INTO appunti (id, titolo, argomento_id, utente_id, file_path) VALUES 
(1, 'Introduzione al Corso', 1, 1, 'storage/notes/1/introduzione_al_corso.md'),
(2, 'Normalizzazione DB', 2, 2, 'storage/notes/2/normalizzazione_db.md'),
(3, 'Limiti e Continuità', 3, 1, 'storage/notes/3/limiti_e_continuita.md'),
(4, 'Meccanica Classica', 4, 1, 'storage/notes/3/meccanica_classica.md'),
(5, 'Meccanica Statistica', 4, 1, 'storage/notes/3/meccanica_statistica.md'),
(6, 'Introduzione alla Termodinamica', 5, 1, 'storage/notes/3/introduzione_alla_termodinamica.md');