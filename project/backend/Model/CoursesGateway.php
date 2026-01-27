<?php
// backend/Model/CoursesGateway.php
require_once 'AbstractGateway.php';
require_once 'NoFilter.php';

class CoursesGateway extends AbstractGateway {
    public function findAll(): array {
        // Query base per RF3
        $baseSql = "SELECT id, nome FROM corsi ORDER BY nome ASC";
        
        // Usiamo NoFilter perché vogliamo tutti i corsi
        return $this->handleRequest(new NoFilter(), $baseSql);
    }
}