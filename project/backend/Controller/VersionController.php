<?php
// backend/Controller/VersionController.php

class VersionController {
    private $pdo;
    private $versionsGateway;
    private $notesGateway;
    private $argomentiGateway;
    private $userGateway;

    public function __construct($deps) {
        $this->pdo              = $deps['pdo'];
        $this->versionsGateway  = $deps['version'];
        $this->notesGateway     = $deps['note'];
        $this->argomentiGateway = $deps['argument'];
        $this->userGateway      = $deps['user'];
    }

    // Corrisponde a: GET /appunto/storia?id=...
    public function index() {
        $appuntoId = (int)($_GET['id'] ?? 0);
        if ($appuntoId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "ID appunto non valido"]);
            return;
        }
        
        try {
            $versions = $this->versionsGateway->getVersionsList(new AppuntoFilter($appuntoId));

            foreach ($versions as &$v) {
                try {
                    $user = $this->userGateway->getUser(new IdFilter((int)$v['utente_id']));
                    $v['autore'] = $user ? $user['email'] : 'Utente rimosso';
                } catch (Exception $e) {
                    $v['autore'] = 'Errore recupero';
                }
                unset($v['utente_id']);
            }

            echo json_encode($versions);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a: GET /appunto/versione/visualizza?versione_id=...
    public function show() {
        $versioneId = (int)($_GET['versione_id'] ?? 0);

        if ($versioneId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "ID versione non valido"]);
            return;
        }

        try {
            $memento = $this->versionsGateway->getMemento(new IdFilter($versioneId));
            $stato = $memento->getState();
            echo json_encode(["status" => "success", "testo" => $stato['testo']]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a: POST /appunto/versione/salva
    public function save() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $this->pdo->beginTransaction();

            $appuntoId = (int)$data['id'];
            
            $notes = $this->notesGateway->getNotes(new IdFilter($appuntoId));
            if (empty($notes)) throw new Exception("Appunto non trovato");
            
            $currentNote = $notes[0];
            
            $corsoId = $this->argomentiGateway->getCorsoIdByArgomento(
                new IdFilter((int)$currentNote['argomento_id'])
            );

            $oldMemento = new NoteMemento(
                $appuntoId, 
                $currentNote['contenuto'], 
                (int)$currentNote['utente_id']
            );

            $this->versionsGateway->saveVersion($oldMemento, $corsoId);

            $this->notesGateway->updateNoteContent($appuntoId, $data['testo']);
            
            $this->notesGateway->updateLastUserTouchedNote($appuntoId, $data['utente_id']);
            
            $this->pdo->commit();
            echo json_encode([
                "status" => "success", 
                "message" => "Cronologia aggiornata e modifiche salvate"
            ]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }            
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Corrisponde a: POST /appunto/versione/ripristina
    public function restore() {
        $data = json_decode(file_get_contents('php://input'), true);
        $versioneId = (int)$data['versione_id'];
        $utenteChiRipristina = (int)$data['utente_id'];

        try {
            $this->pdo->beginTransaction();
            $mementoDaRipristinare = $this->versionsGateway->getMemento(new IdFilter($versioneId));
            $testoStorico = $mementoDaRipristinare->getState()['testo'];
            $appuntoId = $mementoDaRipristinare->getState()['id'];

            $noteAttuale = $this->notesGateway->getNotes(new IdFilter($appuntoId))[0];
            $corsoId = $this->argomentiGateway->getCorsoIdByArgomento(
                new IdFilter((int)$noteAttuale['argomento_id'])
            );

            $mementoStatoCorrente = new NoteMemento(
                $appuntoId, 
                $noteAttuale['contenuto'], 
                (int)$noteAttuale['utente_id']
            );
            $this->versionsGateway->saveVersion($mementoStatoCorrente, $corsoId);

            $this->notesGateway->updateNoteContent($appuntoId, $testoStorico);

            $this->notesGateway->updateLastUserTouchedNote($appuntoId, $utenteChiRipristina);
            $this->pdo->commit();

            echo json_encode([
                "status" => "success", 
                "message" => "Versione ripristinata correttamente", 
                "testo" => $testoStorico
            ]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }            
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}