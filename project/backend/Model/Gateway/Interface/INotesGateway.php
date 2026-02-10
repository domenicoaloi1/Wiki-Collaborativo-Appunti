<?php
// services/backend/Gateway/Interface/INotesGateway.php
interface INotesGateway {
    public function createNote(int $argId, int $uId, string $titolo, string $cont, int $corsoId);
    public function getNotes(FilterStrategy $strategy);
    public function updateNoteContent(int $id, string $newContent);
    public function updateNoteTitle(int $id, string $nome);
    public function deleteNotes(FilterStrategy $strategy);
    public function updateLastUserTouchedNote(int $id, int $newUserId);
}