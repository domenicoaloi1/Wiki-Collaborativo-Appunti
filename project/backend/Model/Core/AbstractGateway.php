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

    /**
     * Elimina i file fisici e rimuove le directory padre se rimangono vuote.
     * Si ferma quando raggiunge la radice della storage o trova una cartella non vuota.
     */
    protected function deleteFilesAndCleanupDirs(array $relativePaths): void {
        $baseDir = realpath(__DIR__ . '/../../');
        $storageRoot = $baseDir . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'notes';

        foreach ($relativePaths as $path) {
            if (empty($path)) continue;

            $fullPath = $baseDir . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);

            if (file_exists($fullPath)) {
                unlink($fullPath); // Rimuove il file fisico

                // Risalita per pulizia cartelle vuote (@rmdir fallisce se la directory non è vuota)
                $currentDir = dirname($fullPath);
                while ($currentDir !== false && strpos($currentDir, $storageRoot) === 0 && $currentDir !== $storageRoot) {
                    if (!@rmdir($currentDir)) {
                        break; // La cartella contiene altri file/cartelle, ci fermiamo
                    }
                    $currentDir = dirname($currentDir);
                }
            }
        }
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