<?php
// backend/Gateway/CoursesGateway.php
class CoursesGateway {
    private PDO $pdo;

    // Dependency Injection: la connessione viene passata dall'esterno
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // RF3 
    public function findAll(): array {
        $sql = "SELECT id, nome 
                FROM corsi 
                ORDER BY nome ASC";
        
        $stmt = $this->pdo->query($sql);
        
        // Ritorna un array associativo (es: [['id' => 1, 'nome' => 'Informatica'], ...])
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}