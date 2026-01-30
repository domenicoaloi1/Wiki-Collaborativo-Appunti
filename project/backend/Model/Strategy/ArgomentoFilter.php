<?php
// backend/Model/Strategy/ArgomentoFilter.php

class ArgomentoFilter implements FilterStrategy {
    private int $argomentoId;

    public function __construct(int $argomentoId) {
        $this->argomentoId = $argomentoId;
    }

    public function buildCriteria(QueryObject $query): void {
        // Appunti filtrati per 'argomento_id'
        $query->addCriteria(new Criteria('argomento_id', '=', $this->argomentoId));
    }
}