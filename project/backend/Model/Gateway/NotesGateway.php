<?php
// backend/Model/Gateway/NotesGateway.php

class NotesGateway extends AbstractGateway {

    public function getNotes(FilterStrategy $strategy): array {
        // RF4
        $baseSql = "SELECT a.id, a.titolo, a.data_creazione, a.file_path FROM appunti a";
        $notes = $this->handleRequest($strategy, $baseSql);

        // RF5
        if ($strategy instanceof IdFilter && !empty($notes)) {
            $note = &$notes[0];
            
            if (!empty($note['file_path'])) {
                $fullPath = __DIR__ . '/../../' . $note['file_path'];

                if (file_exists($fullPath)) {
                    $note['contenuto'] = file_get_contents($fullPath);
                } else {
                    $note['contenuto'] = "Errore: Il file non esiste nel percorso specificato.";
                }
            } else {
                $note['contenuto'] = "Nessun percorso file associato a questo appunto.";
            }
        }

        return $notes;
    }


}