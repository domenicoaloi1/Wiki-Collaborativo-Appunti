<?php
// backend/Model/Gateway/ArgomentiGateway.php

class ArgomentiGateway extends AbstractGateway implements IArgomentiGateway{
    
    public function getArgomenti(FilterStrategy $strategy): array {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);

        $params = [];
        $baseSql = "SELECT * FROM argomenti";
        $where = $this->buildWhereClause($qo, $params);
        
        $stmt = $this->pdo->prepare($baseSql . $where);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCorsoIdByArgomento(FilterStrategy $strategy): int {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);

        $params = [];
        $baseSql = "SELECT corso_id FROM argomenti";
        
        // Generiamo la clausola WHERE usando la strategia (es. IdFilter)
        $where = $this->buildWhereClause($qo, $params);
        
        $stmt = $this->pdo->prepare($baseSql . $where);
        $stmt->execute($params);
        $res = $stmt->fetchColumn();
        
        if (!$res) {
            throw new Exception("Impossibile trovare il corso per l'argomento specificato.");
        }
        
        return (int)$res;
    }

    public function createArgomento(int $corsoId, string $nome): int {
        $this->pdo->beginTransaction();
        try {
            $sql = "INSERT INTO argomenti (corso_id, nome) VALUES (?, ?)";
            $this->pdo->prepare($sql)->execute([$corsoId, $nome]);
            $newId = (int)$this->pdo->lastInsertId();
            $this->pdo->commit();
            return $newId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw new Exception("ArgomentiGateway.createArgomento: " . $e->getMessage());
        }
    }
    
    public function deleteArguments(FilterStrategy $strategy) {
        try {
            $qo = new QueryObject();
            $strategy->buildCriteria($qo);

            $params = [];
            $baseSql = "DELETE FROM argomenti "; 
            $where = $this->buildWhereClause($qo, $params);

            if (empty($where)) {
                throw new Exception("Attenzione: clausola WHERE vuota. Rischio cancellazione totale!");
            }

            //$this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare($baseSql . $where);
            $stmt->execute($params);

            //$this->pdo->commit();
            return true;

        } catch (Exception $e) {
            // if ($this->pdo->inTransaction()) {
            //     $this->pdo->rollBack();
            // }
            throw new Exception("ArgomentiGateway.deleteArguments: " . $e->getMessage());
        }
    }

    public function updateArgomento(int $id, string $nome): void{
        $this->pdo->prepare("UPDATE argomenti SET nome = ? WHERE id = ?")
        ->execute([$nome, $id]);
        $this->pdo->commit();
    }

    public function deleteArgomento(int $id): void{
        throw new Exception("Not Implemented Yet");
    }
}