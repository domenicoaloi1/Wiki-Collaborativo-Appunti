<?php
// backend/Model/Gateway/CascadeService.php
class CascadeService {
    private $pdo;
    private $gateways;

    public function __construct($pdo, $gateways) {
        $this->pdo = $pdo;
        $this->gateways = $gateways;
    }

    // --- CANCELLAZIONE APPUNTO E VERSIONI ---
    public function deleteNoteWithVersions(int $noteId) {
        $this->gateways['version']->deleteVersions(new AppuntoIdInFilter([$noteId]));
        $this->gateways['note']->deleteNotes(new IdInFilter([$noteId]));
    }

    // --- CANCELLAZIONE ARGOMENTO, APPUNTi E VERSIONI ---
    public function deleteArgumentWithContent(int $topicId) {
        $appunti = $this->gateways['note']->getNotes(new ArgomentiIdInFilter([$topicId]));
        $ids = array_map(fn($n) => (int)$n['id'], $appunti);

        if (!empty($ids)) {
            $this->gateways['version']->deleteVersions(new AppuntoIdInFilter($ids));
            $this->gateways['note']->deleteNotes(new IdInFilter($ids));
        }
        $this->gateways['topic']->deleteArguments(new IdInFilter([$topicId]));
    }

    // --- CANCELLAZIONE CORSO, ARGOMENTi, APPUNTi E VERSIONI ---
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
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $e;
        }
    }
}