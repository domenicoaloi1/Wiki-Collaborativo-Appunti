-- services/database/configs/02_dump.sql

-- Dati di test

-- Utenti

INSERT INTO utenti (id, email, password, ruolo) VALUES 
(1, 'admin@unipr.it', SHA2('admin', 256), 'amministratore'),
(2, 'studente_test1@studenti.unipr.it', SHA2('StudenteProva1', 256), 'studente'),
(3, 'studente_test2@studenti.unipr.it', SHA2('StudenteProva2', 256), 'studente'),
(4, 'studente_test3@studenti.unipr.it', SHA2('StudenteProva3', 256), 'studente')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Corsi
INSERT IGNORE INTO corsi (id, nome) VALUES 
(1, 'Informatica'), 
(2, 'Matematica'), 
(3, 'Fisica');

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
(5, 'Termodinamica', 3);

-- Appunti legati agli argomenti
-- Struttura file_path: [ID_CORSO]/[ID_APPUNTO].md
INSERT IGNORE INTO appunti (id, titolo, argomento_id, utente_id, file_path) VALUES 
(1, 'Introduzione al Corso', 1, 2, 'storage/notes/1/1.md'),
(2, 'Normalizzazione DB', 2, 3, 'storage/notes/1/2.md'),
(3, 'Limiti', 3, 4, 'storage/notes/2/3.md'),
(4, 'Meccanica Classica', 4, 2, 'storage/notes/3/4.md'),
(5, 'Meccanica Statistica', 4, 3, 'storage/notes/3/5.md'), -- Questo non avrà versioni (per test)
(6, 'Introduzione alla Termodinamica', 5, 4, 'storage/notes/3/6.md');

-- versioni legate agli appunti
-- Path: [id_corso]/versions/[id_appunto]/v[N].md
INSERT IGNORE INTO versioni (id, appunto_id, utente_id, testo_percorso, data_modifica) VALUES 
-- Versioni per 'Introduzione al Corso' (Appunto 1 - Corso 1)
(1, 1, 3, 'storage/notes/1/versions/1/v1.md', '2026-02-01 10:00:00'),
(2, 1, 4, 'storage/notes/1/versions/1/v2.md', '2026-02-01 12:00:00'),

-- Versione per 'Normalizzazione DB' (Appunto 2 - Corso 1)
(3, 2, 4, 'storage/notes/1/versions/2/v1.md', '2026-02-02 09:30:00'),

-- Versione per 'Limiti' (Appunto 3 - Corso 2)
(4, 3, 2, 'storage/notes/2/versions/3/v1.md', '2026-02-02 15:45:00'),

-- Versione per 'Meccanica Classica' (Appunto 4 - Corso 3)
(5, 4, 3, 'storage/notes/3/versions/4/v1.md', '2026-02-02 18:00:00'),

-- Versione per 'Introduzione alla Termodinamica' (Appunto 6 - Corso 3)
(6, 6, 2, 'storage/notes/3/versions/6/v1.md', '2026-02-02 20:00:00');