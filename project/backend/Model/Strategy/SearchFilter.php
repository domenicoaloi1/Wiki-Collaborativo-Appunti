<?php
// backend/Model/Strategy/SearchFilter.php

class SearchFilter implements FilterStrategy {
    private string $searchTerm;

    public function __construct(string $searchTerm) {
        $this->searchTerm = trim($searchTerm);
    }

    public function buildCriteria(QueryObject $query): void {
        // La strategia ordina al QueryObject di filtrare per 'titolo' 
        // usando l'operatore 'LIKE' e i caratteri jolly %
        $query->addCriteria(new Criteria('titolo', 'LIKE', '%' . $this->searchTerm . '%'));
    }
}