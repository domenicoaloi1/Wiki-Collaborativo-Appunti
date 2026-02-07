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
        $sql = "";
        $params = [$corsoId,$nome];
        $this->pdo->beginTransaction();
        try {
            
            $sql = "INSERT INTO argomenti (corso_id, nome) VALUES (?, ?)";
            $this->pdo->prepare($sql)->execute([$corsoId, $nome]);
            $newId = (int)$this->pdo->lastInsertId();
            $this->pdo->commit();
            return $newId;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            $this->handleGatewayError(__METHOD__, $e, $sql, $params);
        }
    }
    
    public function deleteArguments(FilterStrategy $strategy) {
        $params = [];
        $fullSql = "";
        try {
            $qo = new QueryObject();
            $strategy->buildCriteria($qo);

            
            $baseSql = "DELETE FROM argomenti "; 
            $fullSql = $baseSql;
            $where = $this->buildWhereClause($qo, $params);

            if (empty($where)) {
                throw new Exception("Attenzione: clausola WHERE vuota. Rischio cancellazione totale!");
            }
            $fullSql = $baseSql . $where;
            $stmt = $this->pdo->prepare($baseSql . $where);
            $stmt->execute($params);

            return true;

        } catch (\Exception $e) {
            $this->handleGatewayError(__METHOD__, $e, $fullSql, $params);
        }
    }

    // public function updateArgomento(int $id, string $nome): void{
    //     $this->pdo->prepare("UPDATE argomenti SET nome = ? WHERE id = ?")
    //     ->execute([$nome, $id]);
    //     $this->pdo->commit();
    // }


    public function updateArgomento(int $id, string $nome): void{
        $this->pdo->beginTransaction();
        $sql = "";
        $params = [$nome, $id];
        try {
            $sql = "UPDATE argomenti SET nome = ? WHERE id = ?";
            $this->pdo->prepare($sql)->execute([$nome, $id]);
            $this->pdo->commit();
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            $this->handleGatewayError(__METHOD__, $e, $sql, $params);
        }
    }


    public function deleteArgomento(int $id): void{
        throw new Exception("Not Implemented Yet");
    }
}