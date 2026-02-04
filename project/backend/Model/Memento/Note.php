<?php
// backend/Model/Memento/Note.php

class Note {
    private $id;       // Identificativo univoco dell'appunto
    private $testo;    // Contenuto Markdown
    private $utenteId; // Autore dell'ultima modifica

    // Inizializzazione completa dell'Originator
    public function setContent(int $id, string $testo, int $utenteId) {
        $this->id = $id;
        $this->testo = $testo;
        $this->utenteId = $utenteId;
    }

    public function getId(): int {
        return $this->id;
    }

    // Crea un'istantanea (Checkpoint)
    public function saveToMemento(): NoteMemento {
        // Passiamo l'id al memento per garantire l'integrità del ripristino
        return new NoteMemento($this->id, $this->testo, $this->utenteId);
    }

    // Ripristina lo stato da un memento
    public function restoreFromMemento(NoteMemento $memento) {
        $state = $memento->getState();
        
        // L'id non dovrebbe cambiare durante un ripristino, 
        // ma lo riassegniamo per coerenza dell'oggetto
        $this->id = $state['id'];
        $this->testo = $state['testo'];
        $this->utenteId = $state['utente_id'];
    }
}