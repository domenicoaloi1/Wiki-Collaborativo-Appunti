<?php
// backend/Model/Strategy/IdFilter.php

class IdFilter implements FilterStrategy {
    private int $id;

    public function __construct(int $id) {
        $this->id = $id;
    }

    public function applyFilter(string $sql, array &$params): string {
        $params['id'] = $this->id;
        return $sql . " WHERE a.id = :id";
    }
}