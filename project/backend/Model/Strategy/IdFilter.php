<?php
// backend/Model/Strategy/IdFilter.php

class IdFilter implements FilterStrategy {
    private int $id;

    public function __construct(int $id) {
        $this->id = $id;
    }

    public function buildCriteria(QueryObject $query): void {
        $query->addCriteria(new Criteria('id', '=', $this->id));
    }
}