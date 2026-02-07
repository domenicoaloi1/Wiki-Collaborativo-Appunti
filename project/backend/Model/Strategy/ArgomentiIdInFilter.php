<?php
// backend/Model/Strategy/ArgomentiIdInFilter.php

class ArgomentiIdInFilter implements FilterStrategy {
    private $ids;

    public function __construct(array $ids) {
        $this->ids = array_map('intval', $ids);
    }

    public function buildCriteria(QueryObject $query): void {
        if (!empty($this->ids)) {
            $query->addCriteria(new Criteria('argomento_id', 'IN', $this->ids));
        }
    }
}