<?php
// backend/Model/NoFilter.php
require_once 'FilterStrategy.php';

class NoFilter implements FilterStrategy {
    public function applyFilter(string $sql, array &$params): string {
        // Non aggiunge filtri, restituisce la query così com'è
        return $sql;
    }
}