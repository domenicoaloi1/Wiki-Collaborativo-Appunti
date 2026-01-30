<?php
// backend/Model/Core/AbstractGateway.php

abstract class AbstractGateway {
    protected PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // Metodo generico per convertire Criteria in clausole WHERE e parametri PDO
    protected function buildWhereClause(QueryObject $query, array &$params): string {
        $clauses = [];
        foreach ($query->getCriteria() as $index => $criterion) {
            $placeholder = "p" . $index;
            $clauses[] = "{$criterion->getField()} {$criterion->getOperator()} :$placeholder";
            $params[$placeholder] = $criterion->getValue();
        }
        return !empty($clauses) ? " WHERE " . implode(" AND ", $clauses) : "";
    }
}