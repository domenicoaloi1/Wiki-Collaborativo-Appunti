<?php
// backend/Model/Strategy/FilterStrategy.php

interface FilterStrategy {
    public function buildCriteria(QueryObject $query): void;
}