<?php
// backend/Model/Gateway/NotesGateway.php

/**
 * NotesGateway implementa il pattern Table Data Gateway per la tabella 'appunti'.
 * Estende AbstractGateway per riutilizzare la logica di composizione delle query.
 */
class NotesGateway extends AbstractGateway implements INotesGateway{
    
    public function getNotes(FilterStrategy $strategy): array {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);
        $fullSql = "";
        $params = [];
        try{
            $baseSql = "SELECT * FROM appunti";
            $where = $this->buildWhereClause($qo, $params);
            $fullSql = $baseSql . $where;
            $stmt = $this->pdo->prepare($fullSql);
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

        } catch (\Exception $e) {
            // Ora, se scoppia la SELECT, vedrai finalmente il log "parlante"
            $this->handleGatewayError(__METHOD__, $e, $fullSql, $params);
        }
    }

    /**
     * RF6: Creazione di un nuovo appunto.
     * Gestisce l'inserimento nel DB e la creazione del file fisico.
     */
    public function createNote(int $argId, int $uId, string $titolo, string $cont, int $corsoId): int {
        $this->pdo->beginTransaction();
        $params = [$argId, $uId,  $titolo, $corsoId];
        $sql="";
        try {
            // Inserimento (file_path DEFAULT NULL)
            $sql = "INSERT INTO appunti (titolo, argomento_id, utente_id) VALUES (?, ?, ?)";
            $this->pdo->prepare($sql)->execute([$titolo, $argId, $uId]);
            $newId = (int)$this->pdo->lastInsertId();

            // Percorso dinamico basato sul corsoId passato
            $relativePath = "storage/notes/$corsoId/$newId.md";
            $fullPath = __DIR__ . "/../../" . $relativePath;
            
            if (!is_dir(dirname($fullPath))) mkdir(dirname($fullPath), 0775, true);
            file_put_contents($fullPath, $cont);

            // Aggiornamento percorso
            $this->pdo->prepare("UPDATE appunti SET file_path = ? WHERE id = ?")
                    ->execute([$relativePath, $newId]);

            $this->pdo->commit();
            return $newId;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            $this->handleGatewayError(__METHOD__, $e, $sql, $params);
        }
    }

    public function updateNoteContent(int $id, string $newContent): void {
        $stmt = $this->pdo->prepare("SELECT file_path FROM appunti WHERE id = ?");
        $stmt->execute([$id]);
        $path = $stmt->fetchColumn();

        if ($path) {
            file_put_contents(__DIR__ . '/../../' . $path, $newContent);
        }
    }

    public function updateLastUserTouchedNote(int $id, int $newUserId): void {
        $stmt = $this->pdo->prepare("UPDATE appunti SET utente_id = ?, data_creazione = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$newUserId, $id]);
    }

    // RF10
    public function deleteNotes(FilterStrategy $strategy) {
        $fullSql = "";
        $params = [];
        try {
            $qo = new QueryObject();
            $strategy->buildCriteria($qo);
            $where = $this->buildWhereClause($qo, $params);

            if (empty($where)) {
                throw new \Exception("Attenzione: clausola WHERE vuota. Operazione annullata.");
            }

            // Recupero i path prima di cancellare i record
            $stmtPaths = $this->pdo->prepare("SELECT file_path FROM appunti" . $where);
            $stmtPaths->execute($params);
            $paths = $stmtPaths->fetchAll(PDO::FETCH_COLUMN);

            // Cancellazione fisica dei record
            $fullSql = "DELETE FROM appunti" . $where;
            $stmt = $this->pdo->prepare($fullSql);
            $stmt->execute($params);

            // Pulizia centralizzata file e cartelle vuote
            $this->deleteFilesAndCleanupDirs($paths);

            return true;
        } catch (\Exception $e) {
            $this->handleGatewayError(__METHOD__, $e, $fullSql, $params);
        }
    }

    public function updateNoteTitle(int $id, string $nome): void{
        $this->pdo->beginTransaction();
        $sql = "";
        $params = [$nome, $id];
        try {
            $sql = "UPDATE appunti SET titolo = ? WHERE id = ?";
            $this->pdo->prepare($sql)->execute([$nome, $id]);
            $this->pdo->commit();
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            $this->handleGatewayError(__METHOD__, $e, $sql, $params);
        }
    }

}