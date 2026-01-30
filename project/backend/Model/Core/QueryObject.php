<?php
// backend/Model/Core/QueryObject.php

// Raccoglie i criteri prodotti dalle strategie
class QueryObject {
    private array $criteria = [];

    public function addCriteria(Criteria $c): void {
        $this->criteria[] = $c;
    }

    /** @return Criteria[] */
    public function getCriteria(): array {
        return $this->criteria;
    }
}