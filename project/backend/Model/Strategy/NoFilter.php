<?php
// backend/Model/Strategy/NoFilter.php

class NoFilter implements FilterStrategy {
    public function buildCriteria(QueryObject $query): void {
    }
}