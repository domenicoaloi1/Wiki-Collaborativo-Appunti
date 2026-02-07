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
            $field = $criterion->getField();
            $operator = strtoupper($criterion->getOperator());
            $value = $criterion->getValue();
            $placeholder = "p" . $index;

            // GESTIONE SPECIALE PER L'OPERATORE "IN"
            if ($operator === 'IN' && is_array($value)) {
                $subPlaceholders = [];
                foreach ($value as $subIndex => $subValue) {
                    $pName = $placeholder . "_" . $subIndex;
                    $subPlaceholders[] = ":$pName";
                    $params[$pName] = $subValue;
                }
                $clauses[] = "$field IN (" . implode(', ', $subPlaceholders) . ")";
            } else {
                // Caso normale (=, <, >, LIKE)
                $clauses[] = "$field $operator :$placeholder";
                $params[$placeholder] = $value;
            }
        }
        return !empty($clauses) ? " WHERE " . implode(" AND ", $clauses) : "";
    }


    protected function handleGatewayError($method, $exception, $sql = null, $params = []) {
        $separator = str_repeat("=", 50);
        $logMessage = "\n$separator\n";
        $logMessage .= "SOURCE: $method\n";
        $logMessage .= "ERROR : " . $exception->getMessage() . "\n";
        
        if ($sql) {
            $logMessage .= "SQL   : $sql\n";
        }
        
        if (!empty($params)) {
            $logMessage .= "PARAMS: " . json_encode($params, JSON_PRETTY_PRINT) . "\n";
        }
        $logMessage .= "$separator\n";

        // Scrive nel log di sistema
        error_log($logMessage);

        // Rilancia per il frontend
        throw new \Exception("Gateway Error in $method: " . $exception->getMessage());
    }
}