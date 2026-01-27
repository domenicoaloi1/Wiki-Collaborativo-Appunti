<?php
// backend/Model/Gateway/CoursesGateway.php

class CoursesGateway extends AbstractGateway {
    public function findAll(): array {
        $baseSql = "SELECT id, nome FROM corsi ORDER BY nome ASC";
        
        return $this->handleRequest(new NoFilter(), $baseSql);
    }
}