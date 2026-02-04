<?php
// backend/Model/Gateway/Interface/ICoursesGateway.php
interface ICoursesGateway {
    public function getCourses(FilterStrategy $strategy): array;
    public function findAll(): array;
    public function createCourse(string $nome, string $descrizione);
    public function updateCourse(int $id, string $nome, string $descrizione): void;
    public function deleteCourse(int $id): void;
}