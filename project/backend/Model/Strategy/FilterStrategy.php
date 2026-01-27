<?php
// backend/Model/Strategy/FilterStrategy.php

interface FilterStrategy {
    /**
     * Modifica la query SQL e aggiunge i parametri per il binding.
     * @param string $sql La query base.
     * @param array $params L'array dei parametri passato per riferimento.
     * @return string La query SQL modificata.
     */
    public function applyFilter(string $sql, array &$params): string;
}