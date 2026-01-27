<?php
// backend/Model/NotesGateway.php
require_once 'AbstractGateway.php';

class NotesGateway extends AbstractGateway {
    // Metodo generico che accetta una strategia (RF4 o future RF9/10)
    public function getNotes(FilterStrategy $strategy): array {
        $baseSql = "SELECT a.id, a.titolo, a.data_creazione FROM appunti a";
        return $this->handleRequest($strategy, $baseSql);
    }
}