-- services/database/configs/02_dump.sql

-- Dati di test

-- Utenti

INSERT IGNORE INTO utenti (id, email, password, ruolo) VALUES 
(1, 'admin@unipr.it', '$2y$10$y6Z1hcIPLjJjfvib388TseOFtsxrtdgV/93381bHD5SCRsWPNKy8q', 'amministratore'), -- admin
(2, 'studente_test1@studenti.unipr.it', '$2y$10$ccNvtXORkpj2e.AmqmbM3O81av7PR/tGs/cQLIv4gepLnk6qjY442', 'studente'), -- StudenteProva1
(3, 'studente_test2@studenti.unipr.it', '$2y$10$.ayLWDWGwijcd/hpr7iev.IFMvCsOYboCGhlmbBP11M.1ywpkmQf.', 'studente'), -- StudenteProva2
(4, 'studente_test3@studenti.unipr.it', '$2y$10$CGXByLfQ6TBVQSinOBBfkuaAmuCgoyMqrUSyPIvD6QALBHZmaN6Wi', 'studente'); -- StudenteProva3

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
INSERT IGNORE INTO appunti (id, titolo, argomento_id, utente_id, file_path) VALUES 
(1, 'Introduzione al Corso', 1, 1, 'storage/notes/1/introduzione_al_corso.md'),
(2, 'Normalizzazione DB', 2, 2, 'storage/notes/1/normalizzazione_db.md'),
(3, 'Limiti', 3, 1, 'storage/notes/2/limiti.md'),
(4, 'Meccanica Classica', 4, 1, 'storage/notes/3/meccanica_classica.md'),
(5, 'Meccanica Statistica', 4, 1, 'storage/notes/3/meccanica_statistica.md'),
(6, 'Introduzione alla Termodinamica', 5, 1, 'storage/notes/3/introduzione_alla_termodinamica.md');