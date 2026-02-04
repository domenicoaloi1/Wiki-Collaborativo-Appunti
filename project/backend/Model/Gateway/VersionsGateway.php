<?php
// backend/Model/Gateway/VersionsGateway.php

class VersionsGateway extends AbstractGateway {

    /**
     * RF8: Recupera la lista delle versioni usando una Strategy (es. AppuntoFilter)
     */
    public function getVersionsList(FilterStrategy $strategy): array {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);

        $params = [];
        // QUERY PURA: Solo sulla tabella 'versioni'
        $baseSql = "SELECT id, data_modifica, utente_id FROM versioni";
        
        $where = $this->buildWhereClause($qo, $params);
        
        $stmt = $this->pdo->prepare($baseSql . $where . " ORDER BY data_modifica DESC");
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * RF8: Recupera un Memento specifico usando una Strategy (es. IdFilter)
     */
    public function getMemento(FilterStrategy $strategy): NoteMemento {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);

        $params = [];
        $baseSql = "SELECT appunto_id, utente_id, testo_percorso FROM versioni";
        $where = $this->buildWhereClause($qo, $params);

        $stmt = $this->pdo->prepare($baseSql . $where);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) throw new Exception("Versione non trovata.");

        $fullPath = __DIR__ . '/../../' . $row['testo_percorso'];
        if (!file_exists($fullPath)) throw new Exception("File fisico della versione mancante.");

        $testo = file_get_contents($fullPath);
        return new NoteMemento((int)$row['appunto_id'], $testo, (int)$row['utente_id']);
    }

    /**
     * RF7: Salvataggio versione
     */
    public function saveVersion(NoteMemento $memento, int $corsoId): void {
        $state = $memento->getState();
        $appuntoId = (int)$state['id'];
        $utenteId = (int)$state['utente_id'];
        $testoDaArchiviare = $state['testo'];

        // Calcolo numero versione
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM versioni WHERE appunto_id = ?");
        $stmt->execute([$appuntoId]);
        $nextVersion = (int)$stmt->fetchColumn() + 1;
        $fileName = "v" . $nextVersion . ".md";

        // Directory
        $relativeDir = "storage/notes/$corsoId/versions/$appuntoId";
        $fullPathDir = __DIR__ . "/../../" . $relativeDir;
        if (!is_dir($fullPathDir)) mkdir($fullPathDir, 0777, true);

        // Salvataggi
        $path = $relativeDir . "/" . $fileName;
        file_put_contents(__DIR__ . "/../../" . $path, $testoDaArchiviare);
        $sql = "INSERT INTO versioni (appunto_id, utente_id, testo_percorso) VALUES (?, ?, ?)";
        $this->pdo->prepare($sql)->execute([$appuntoId, $utenteId, $path]);
    }
}