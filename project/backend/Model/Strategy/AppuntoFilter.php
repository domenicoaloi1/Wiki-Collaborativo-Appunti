<?php
// backend/Model/Strategy/AppuntoFilter.php

class AppuntoFilter implements FilterStrategy {
    private int $appuntoId;

    public function __construct(int $appuntoId) {
        $this->appuntoId = $appuntoId;
    }

    public function buildCriteria(QueryObject $query): void {
        // Specifichiamo la colonna della tabella 'versioni'
        $query->addCriteria(new Criteria('appunto_id', '=', $this->appuntoId));
    }
}