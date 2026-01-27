<?php
// backend/Model/CourseFilter.php
require_once 'FilterStrategy.php';

class CourseFilter implements FilterStrategy {
    private int $courseId;

    public function __construct(int $courseId) {
        $this->courseId = $courseId;
    }

    public function applyFilter(string $sql, array &$params): string {
        $params['corso_id'] = $this->courseId;
        return $sql . " WHERE a.corso_id = :corso_id";
    }
}