<?php
// backend/Model/Strategy/EmailFilter.php

class EmailFilter implements FilterStrategy {
    private string $email;

    public function __construct(string $email) {
        $this->email = $email;
    }

    public function buildCriteria(QueryObject $query): void {
        $query->addCriteria(new Criteria('email', '=', $this->email));
    }
}