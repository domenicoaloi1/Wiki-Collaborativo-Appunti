<?php
// backend/Model/Strategy/IdInFilter.php

class IdInFilter implements FilterStrategy {
    private $ids;

    public function __construct(array $ids) {
        $this->ids = array_map('intval', $ids);
    }
    
    public function buildCriteria(QueryObject $query): void {
        if (!empty($this->ids)) {
            $query->addCriteria(new Criteria('id', 'IN', $this->ids));
        }
    }
}