<?php
// services/backend/Gateway/ProxyProtection/NotesGatewayProxy.php

class NotesGatewayProxy implements INotesGateway {
    private $realGateway;
    private $user;

    public function __construct(NotesGateway $real, $user) {
        $this->realGateway = $real;
        $this->user = $user;
    }

    public function createNote($argId, $uId, $titolo, $cont, $corsoId) {
        if ($this->user && ($this->user['ruolo'] === 'studente')) {
            return $this->realGateway->createNote($argId, $uId, $titolo, $cont, $corsoId);
        }
        $this->unauthorized();
    }

    public function deleteNotes(FilterStrategy $strategy) {
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            return $this->realGateway->deleteNotes($strategy);
        }
        $this->unauthorized();
    }

    public function getNotes(FilterStrategy $strategy) {
        return $this->realGateway->getNotes($strategy);
    }
    
    public function updateNoteContent(int $id, string $newContent) {
        if ($this->user && ($this->user['ruolo'] === 'studente')) {
            return $this->realGateway->updateNoteContent($id, $newContent);
        }
        $this->unauthorized();
    }    

    public function updateLastUserTouchedNote(int $id, int $newUserId) {
        if ($this->user && ($this->user['ruolo'] === 'studente')) {
            return $this->realGateway->updateLastUserTouchedNote($id, $newUserId);
        }
        $this->unauthorized();
    }
    
    public function updateNoteTitle(int $id, string $nome){
        if ($this->user && ($this->user['ruolo'] === 'amministratore')) {
            return $this->realGateway->updateNoteTitle($id, $nome);
        }
        $this->unauthorized();
    }


    private function unauthorized(): void {
        throw new Exception("Accesso negato: l'utente non dispone delle autorizzazioni necessarie per questa operazione.");
    }
}