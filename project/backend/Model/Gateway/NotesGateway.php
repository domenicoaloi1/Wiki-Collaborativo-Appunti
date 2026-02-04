<?php
// backend/Model/Gateway/NotesGateway.php

/**
 * NotesGateway implementa il pattern Table Data Gateway per la tabella 'appunti'.
 * Estende AbstractGateway per riutilizzare la logica di composizione delle query.
 */
class NotesGateway extends AbstractGateway {
    
    public function getNotes(FilterStrategy $strategy): array {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);

        $params = [];
        $baseSql = "SELECT * FROM appunti";
        $where = $this->buildWhereClause($qo, $params);
        
        $stmt = $this->pdo->prepare($baseSql . $where);
        $stmt->execute($params);
        
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // RF5: Caricamento contenuto dal File System (se la strategia è un IdFilter)
        if ($strategy instanceof IdFilter && !empty($notes)) {
            $note = &$notes[0]; // Riferimento al primo (e unico) risultato
            
            if (!empty($note['file_path'])) {
                // NotesGateway è in Model/Gateway/, quindi salgo di due livelli (../../)
                $fullPath = __DIR__ . '/../../' . $note['file_path'];

                if (file_exists($fullPath)) {
                    $note['contenuto'] = file_get_contents($fullPath);
                } else {
                    $note['contenuto'] = "Errore: Il file non è stato trovato nel percorso " . $note['file_path'];
                }
            } else {
                $note['contenuto'] = "Nessun percorso file associato a questo appunto.";
            }
        }

        return $notes;
    }

    /**
     * RF6: Creazione di un nuovo appunto.
     * Gestisce l'inserimento nel DB e la creazione del file fisico.
     */
    public function createNote(int $argId, int $uId, string $titolo, string $cont, int $corsoId): int {
        $this->pdo->beginTransaction();
        try {
            // Inserimento (file_path DEFAULT NULL)
            $sql = "INSERT INTO appunti (titolo, argomento_id, utente_id) VALUES (?, ?, ?)";
            $this->pdo->prepare($sql)->execute([$titolo, $argId, $uId]);
            $newId = (int)$this->pdo->lastInsertId();

            // Percorso dinamico basato sul corsoId passato
            $relativePath = "storage/notes/$corsoId/$newId.md";
            $fullPath = __DIR__ . "/../../" . $relativePath;
            
            if (!is_dir(dirname($fullPath))) mkdir(dirname($fullPath), 0777, true);
            file_put_contents($fullPath, $cont);

            // Aggiornamento percorso
            $this->pdo->prepare("UPDATE appunti SET file_path = ? WHERE id = ?")
                    ->execute([$relativePath, $newId]);

            $this->pdo->commit();
            return $newId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

}