-- services/database/configs/init.sql

-- 1. Tabella Corsi (RF3)
CREATE TABLE IF NOT EXISTS corsi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 2. Tabella Appunti (RF4/RF5)
CREATE TABLE IF NOT EXISTS appunti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(255) NOT NULL,
    corso_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL, -- Percorso al file fisico .md originale
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (corso_id) REFERENCES corsi(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabella Versioni (RF7/RF8)
CREATE TABLE IF NOT EXISTS versioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appunto_id INT NOT NULL,
    testo_percorso VARCHAR(255) NOT NULL, -- Percorso al file .md della specifica versione
    data_modifica TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appunto_id) REFERENCES appunti(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --- DATI DI TEST ---

-- Inserimento Corsi
INSERT IGNORE INTO corsi (id, nome) VALUES 
(1, 'Informatica'), 
(2, 'Matematica'), 
(3, 'Fisica');

-- Inserimento Appunti di esempio (collegati ai corsi)
-- INSERT IGNORE INTO appunti (titolo, corso_id, file_path) VALUES 
-- ('titolo_appunto', 1, 'path/to/notes/mvp_pattern.md'(storage/notes/mvp_pattern.md???)),

