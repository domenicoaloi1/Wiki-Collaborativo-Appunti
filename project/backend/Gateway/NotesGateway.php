<?php
// backend/Gateway/NotesGateway.php

class NotesGateway {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // RF4
    public function findByCourse(int $courseId): array {
        $sql = "SELECT id, titolo, data_creazione 
                FROM appunti 
                WHERE corso_id = :corso_id 
                ORDER BY data_creazione DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['corso_id' => $courseId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}