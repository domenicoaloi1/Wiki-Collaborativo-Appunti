-- services/database/configs/01_init.sql

-- Struttura del Database

CREATE TABLE IF NOT EXISTS corsi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS argomenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    corso_id INT NOT NULL,
    FOREIGN KEY (corso_id) REFERENCES corsi(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appunti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(255) NOT NULL,
    argomento_id INT NOT NULL,
    utente_id INT,
    file_path VARCHAR(255) NOT NULL,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (argomento_id) REFERENCES argomenti(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS versioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appunto_id INT NOT NULL,
    utente_id INT,
    testo_percorso VARCHAR(255) NOT NULL,
    data_modifica TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appunto_id) REFERENCES appunti(id) ON DELETE CASCADE
) ENGINE=InnoDB;