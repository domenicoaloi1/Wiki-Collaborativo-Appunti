<?php
// services/backend/Gateway/Interface/INotesGateway.php
interface INotesGateway {
    public function createNote(int $argId, int $uId, string $titolo, string $cont, int $corsoId);
    public function deleteNote($id);
    public function getNotes(FilterStrategy $strategy);
    public function updateNoteContent(int $id, string $newContent);
}