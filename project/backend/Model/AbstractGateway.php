<?php
// backend/Model/AbstractGateway.php

abstract class AbstractGateway {
    protected PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Metodo centrale per gestire le richieste di lettura basate su Strategy.
     * @param FilterStrategy $strategy La strategia di filtraggio (RF4, RF9, RF10)
     * @param string $baseSql La query SQL di base (senza WHERE)
     * @return array Risultati della query
     */
    protected function handleRequest(FilterStrategy $strategy, string $baseSql): array {
        $params = [];
        
        // La strategia modifica la query e popola l'array $params per riferimento
        $sql = $strategy->applyFilter($baseSql, $params);
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}