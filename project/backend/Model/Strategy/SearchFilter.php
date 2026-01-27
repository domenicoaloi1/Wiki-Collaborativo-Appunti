<?php
// backend/Model/Strategy/SearchFilter.php

class SearchFilter implements FilterStrategy {
    private string $searchTerm;

    public function __construct(string $searchTerm) {
        $this->searchTerm = trim($searchTerm);
    }

    public function applyFilter(string $sql, array &$params): string {
        $params['query'] = '%' . $this->searchTerm . '%';
        return $sql . " WHERE a.titolo LIKE :query ORDER BY a.data_creazione DESC";
    }
}