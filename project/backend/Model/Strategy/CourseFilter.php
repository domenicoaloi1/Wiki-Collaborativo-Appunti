<?php
// backend/Model/Strategy/CourseFilter.php

class CourseFilter implements FilterStrategy {
    private int $courseId;
    public function __construct(int $courseId) { $this->courseId = $courseId; }

    public function buildCriteria(QueryObject $query): void {
        $query->addCriteria(new Criteria('corso_id', '=', $this->courseId));
    }
}