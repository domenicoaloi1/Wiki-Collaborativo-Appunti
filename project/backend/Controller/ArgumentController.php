<?php
// backend/Controller/ArgumentController.php

class ArgumentController {
    private $pdo;
    private $argomentiGateway;
    private $cascadeService;

    public function __construct($deps) {
        $this->pdo              = $deps['pdo'];
        $this->argomentiGateway = $deps['argument'];
        $this->cascadeService = $deps['cascade'];
    }

    // Corrisponde a GET /argomenti
    public function index() {
        $courseId = (int)($_GET['corso_id'] ?? 0);
        
        if ($courseId > 0) {
            $strategy = new CourseFilter($courseId);
            echo json_encode($this->argomentiGateway->getArgomenti($strategy));
        } else {
            http_response_code(400);
            echo json_encode(["error" => "ID corso mancante"]);
        }
    }

    // Corrisponde a POST /argomento/crea
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $id = $this->argomentiGateway->createArgomento((int)$data['corso_id'], $data['nome']);
            echo json_encode(["status" => "success", "id" => $id]);
        } catch (Exception $e) {
            http_response_code(403);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a PUT /argomento/modifica
    public function update() {
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $this->argomentiGateway->updateArgomento((int)$data['id'], $data['nome']);
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            http_response_code(403);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a DELETE /argomento/elimina
    public function delete() {
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $this->pdo->beginTransaction();
            $this->cascadeService->deleteArgumentWithContent((int)$data['id']);
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