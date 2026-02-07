<?php
// backend/Model/Gateway/CoursesGateway.php

/**
 * CoursesGateway implementa il pattern Table Data Gateway per la tabella 'corsi'.
 * Estende AbstractGateway per riutilizzare la logica di composizione delle query.
 */
class CoursesGateway extends AbstractGateway implements ICoursesGateway{
    /**
     * Recupera i corsi basandosi su una strategia di filtraggio.
     * Rispetta l'incapsulamento dell'SQL richiesto dal pattern.
     * 
     * @param FilterStrategy $strategy La strategia (es. NoFilter o filtri specifici)
     * @return array Un Record Set di array associativi
     */
    public function getCourses(FilterStrategy $strategy): array {
        $queryObject = new QueryObject();
        $strategy->buildCriteria($queryObject);
        
        $params = [];
        $baseSql = "SELECT * FROM corsi";
        $whereClause = $this->buildWhereClause($queryObject, $params);

        $stmt = $this->pdo->prepare($baseSql . $whereClause);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    /**
     * Recupera tutti i record della tabella 'corsi' (RF3).
     * Utilizza internamente NoFilter per soddisfare il contratto Strategy.
     */
    public function findAll(): array {
        return $this->getCourses(new NoFilter());
    }
    
    public function createCourse(string $nome): int{
        $this->pdo->beginTransaction();
        $sql = "";
        $params = [$nome];
        try {
            // Inserimento (file_path DEFAULT NULL)
            $sql = "INSERT INTO corsi (nome) VALUES (?)";
            $this->pdo->prepare($sql)->execute([$nome]);
            $newId = (int)$this->pdo->lastInsertId();
            $this->pdo->commit();
            return $newId;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            $this->handleGatewayError(__METHOD__, $e, $sql, $params);
        }
    }

    public function updateCourse(int $id, string $nome): void{
        $this->pdo->beginTransaction();
        $sql = "";
        $params = [$nome, $id];
        try {
            $sql = "UPDATE corsi SET nome = ? WHERE id = ?";
            $this->pdo->prepare($sql)->execute([$nome, $id]);
            $this->pdo->commit();
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            $this->handleGatewayError(__METHOD__, $e, $sql, $params);
        }
    }

    public function deleteCourse(int $id): void{
        $sql = "";
        $params = [$id];
        try {
            $sql = "DELETE FROM corsi WHERE id = ?";
            $this->pdo->prepare($sql)->execute([$id]);
        } catch (\Exception $e) {
            $this->handleGatewayError(__METHOD__, $e, $sql, $params);
        }
    }
}