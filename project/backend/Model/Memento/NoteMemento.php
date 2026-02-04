<?php
// backend/Model/Memento/NoteMemento.php

class NoteMemento {
    private $id;
    private $testo;
    private $utenteId;

    public function __construct(int $id, string $testo, int $utenteId) {
        $this->id = $id;
        $this->testo = $testo;
        $this->utenteId = $utenteId;
    }

    // Interfaccia "stretta": fornisce lo stato solo quando richiesto dall'Originator o dal Gateway
    public function getState(): array {
        return [
            'id' => $this->id,
            'testo' => $this->testo,
            'utente_id' => $this->utenteId
        ];
    }
}