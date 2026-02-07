<?php
// backend/Model/Strategy/AppuntoIdInFilter.php

class AppuntoIdInFilter implements FilterStrategy {
    private $ids;

    public function __construct(array $ids) {
        $this->ids = array_map('intval', $ids);
    }
    
    public function buildCriteria(QueryObject $query): void {
        if (!empty($this->ids)) {
            $query->addCriteria(new Criteria('appunto_id', 'IN', $this->ids));
        }
    }
}