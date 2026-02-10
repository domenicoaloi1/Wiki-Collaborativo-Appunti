<?php
// backend/Controller/NoteController.php

class NoteController {
    private $pdo;
    private $notesGateway;
    private $argomentiGateway;
    private $cascadeService;

    public function __construct($deps) {
        $this->pdo          = $deps['pdo'];
        $this->notesGateway = $deps['note'];
        $this->argomentiGateway = $deps['argument'];
        $this->cascadeService = $deps['cascade'];
    }

    // Corrisponde a: GET /appunti?argomento_id=...
    public function index() {
        $argomentoId = (int)($_GET['argomento_id'] ?? 0);
        
        if ($argomentoId > 0) {
            $strategy = new ArgomentoFilter($argomentoId);
            echo json_encode($this->notesGateway->getNotes($strategy));
        } else {
            http_response_code(400);
            echo json_encode(["error" => "ID argomento mancante o non valido"]);
        }
    }

    // Corrisponde a: GET /appunto?q=...
    public function show() {
        $noteId = (int)($_GET['id'] ?? 0);
        
        if ($noteId > 0) {
            $result = $this->notesGateway->getNotes(new IdFilter($noteId));
            
            if (!empty($result)) {
                echo json_encode($result[0]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Appunto non trovato"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "ID non valido o mancante"]);
        }
    }

    // Corrisponde a: GET /cerca?q=...
    public function search() {
        $query = $_GET['q'] ?? '';
        
        if (strlen($query) >= 2) {
            echo json_encode($this->notesGateway->getNotes(new SearchFilter($query)));
        } else {
            echo json_encode([]); // Lista vuota se la query è troppo corta per i test
        }
    }

    // Corrisponde a: POST /appunto/crea
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['titolo']) || empty($data['argomento_id']) || empty($data['utente_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Dati mancanti per la creazione dell'appunto"]);
            return;
        }

        try {
            // Recuperiamo il corsoId dall'argomento per mantenere la coerenza nel DB
            $corsoId = $this->argomentiGateway->getCorsoIdByArgomento(new IdFilter((int)$data['argomento_id']));

            // Se non viene inviato contenuto, creiamo un'intestazione Markdown predefinita
            $contenutoIniziale = $data['contenuto'] ?? "# " . $data['titolo'];

            $newId = $this->notesGateway->createNote(
                (int)$data['argomento_id'], 
                (int)$data['utente_id'], 
                $data['titolo'], 
                $contenutoIniziale,
                $corsoId
            );

            echo json_encode(["status" => "success", "id" => $newId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a: PUT /appunto/modifica
    public function update() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['id']) || empty($data['nome'])) {
            http_response_code(400);
            echo json_encode(["error" => "Dati insufficienti per la modifica"]);
            return;
        }

        try {
            $this->notesGateway->updateNoteTitle((int)$data['id'], $data['nome']);
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            http_response_code(403); // Solitamente Forbidden se il Proxy blocca
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a: DELETE /appunto/elimina
    public function delete() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID appunto mancante"]);
            return;
        }

        try {
            $this->pdo->beginTransaction();
            // Utilizziamo il CascadeService per pulire anche le versioni collegate
            $this->cascadeService->deleteNoteWithVersions((int)$data['id']);
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