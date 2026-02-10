<?php
// backend/Controller/CourseController.php

class CourseController {
    private $pdo;
    private $coursesGateway;
    private $cascadeService;

    public function __construct($deps) {
        $this->pdo            = $deps['pdo'];
        $this->coursesGateway = $deps['course'];
        $this->cascadeService = $deps['cascade'];
    }

    // Corrisponde a GET /corsi
    public function index() {
        echo json_encode($this->coursesGateway->findAll());
    }

    // Corrisponde a POST /corso/crea
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $id = $this->coursesGateway->createCourse($data['nome']);
            echo json_encode(["status" => "success", "id" => $id]);
        } catch (Exception $e) {
            http_response_code(403);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a PUT /corso/modifica
    public function update() {
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $this->coursesGateway->updateCourse((int)$data['id'], $data['nome']);
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            http_response_code(403);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a DELETE /corso/elimina
    public function delete() {
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $this->pdo->beginTransaction();
            $this->cascadeService->deleteFullCourse((int)$data['id']);
            $this->pdo->commit();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(403);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}