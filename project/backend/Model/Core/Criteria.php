<?php
// backend/Model/Core/Criteria.php

// Rappresenta un singolo criterio di filtraggio (es. campo = valore)
class Criteria {
    private string $field;
    private string $operator;
    private $value;

    public function __construct(string $field, string $operator, $value) {
        $this->field = $field; // colonna
        $this->operator = $operator; // = > < etc
        $this->value = $value; // valore da cercare
    }

    public function getField(): string { return $this->field; }
    public function getOperator(): string { return $this->operator; }
    public function getValue() { return $this->value; }
}

