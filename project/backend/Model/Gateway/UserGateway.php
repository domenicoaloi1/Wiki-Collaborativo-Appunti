<?php
// backend/Model/Gateway/UserGateway.php

class UserGateway extends AbstractGateway {
    
    public function getUser(FilterStrategy $strategy): ?array {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);

        $params = [];
        $baseSql = "SELECT * FROM utenti";
        $where = $this->buildWhereClause($qo, $params);
        
        $stmt = $this->pdo->prepare($baseSql . $where);
        $stmt->execute($params);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null; // Ritorna null se l'utente non esiste
    }
    
    public function register(array $data): int {
        $sql = "INSERT INTO utenti (email, password, ruolo) VALUES (:email, :password, :ruolo)";
        $stmt = $this->pdo->prepare($sql);
        
        $stmt->execute([
            ':email'    => $data['email'],
            ':password' => $data['password'], // Hash già generato
            ':ruolo'    => $data['ruolo'] ?? 'studente'
        ]);

        return (int)$this->pdo->lastInsertId();
    }
}