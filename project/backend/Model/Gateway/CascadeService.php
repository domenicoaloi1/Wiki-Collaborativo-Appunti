<?php
// backend/Model/Gateway/CascadeService.php
class CascadeService {
    private $pdo;
    private $gateways;

    public function __construct($pdo, $gateways) {
        $this->pdo = $pdo;
        $this->gateways = $gateways;
    }

    private function handleError($step, $exception, $context = []) {
        $logMsg = sprintf(
            "[CascadeService] Errore durante lo step: '%s' | Messaggio: %s",
            $step,
            $exception->getMessage()
        );
        
        if (!empty($context)) {
            $logMsg .= " | Context: " . json_encode($context);
        }

        error_log($logMsg);

        if ($this->pdo->inTransaction()) {
            $this->pdo->rollBack();
        }

        throw new Exception("Errore Procedura a Cascata: " . $logMsg);
        
        // throw new Exception("Impossibile completare l'operazione richiesta. Errore interno."); 
    }

    // --- CANCELLAZIONE APPUNTO E VERSIONI ---
    public function deleteNoteWithVersions(int $noteId) {
        try {
            $this->pdo->beginTransaction();
            $this->gateways['version']->deleteVersions(new AppuntoFilter($noteId));
            $this->gateways['note']->deleteNotes(new IdFilter($noteId));
            $this->pdo->commit();
        }catch(Exception $e) {
            $this->handleError("Eliminazione Nota", $e, ["noteId" => $noteId]);
        }
    }

    // --- CANCELLAZIONE ARGOMENTO, APPUNTI E VERSIONI ---
    public function deleteArgumentWithContent(int $topicId) {
        try {
            $this->pdo->beginTransaction();
            
            $appunti = $this->gateways['note']->getNotes(new ArgomentoFilter($topicId));
            $ids = array_map(fn($n) => (int)$n['id'], $appunti);

            if (!empty($ids)) {
                $this->gateways['version']->deleteVersions(new AppuntoIdInFilter($ids));
                $this->gateways['note']->deleteNotes(new IdInFilter($ids));
            }
            $this->gateways['topic']->deleteArguments(new IdFilter($topicId));
            $this->pdo->commit();
        } catch (Exception $e) {
            $this->handleError("Eliminazione Argomento", $e, ["topicId" => $topicId]);
        }
    }

    // --- CANCELLAZIONE CORSO, ARGOMENTI, APPUNTI E VERSIONI ---
    public function deleteFullCourse(int $courseId) {
        try {
            $this->pdo->beginTransaction();

            $argomenti = $this->gateways['topic']->getArgomenti(new CourseFilter($courseId));
            $argIds = array_map(fn($a) => (int)$a['id'], $argomenti);

            if (!empty($argIds)) {
                $appunti = $this->gateways['note']->getNotes(new ArgomentiIdInFilter($argIds));
                $noteIds = array_map(fn($n) => (int)$n['id'], $appunti);

                if (!empty($noteIds)) {
                    $this->gateways['version']->deleteVersions(new AppuntoIdInFilter($noteIds));
                    $this->gateways['note']->deleteNotes(new IdInFilter($noteIds));
                }
                $this->gateways['topic']->deleteArguments(new IdInFilter($argIds));
            }
            
            $this->gateways['course']->deleteCourse($courseId);

            $this->pdo->commit();
        } catch (Exception $e) {
            $this->handleError("Eliminazione Corso", $e, ["courseId" => $courseId]);
        }
    }
}