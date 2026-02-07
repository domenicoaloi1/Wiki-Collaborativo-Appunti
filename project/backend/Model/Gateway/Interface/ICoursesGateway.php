<?php
// backend/Model/Gateway/Interface/ICoursesGateway.php
interface ICoursesGateway {
    public function getCourses(FilterStrategy $strategy): array;
    public function findAll(): array;
    public function createCourse(string $nome);
    public function updateCourse(int $id, string $nome): void;
    public function deleteCourse(int $id): void;
}