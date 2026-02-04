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

    public function createArgomento(string $nome, string $descrizione): int{
        throw new Exception("Not Implemented Yet");
    }

    public function updateArgomento(int $id, string $nome, string $descrizione): void{
        throw new Exception("Not Implemented Yet");
    }

    public function deleteArgomento(int $id): void{
        throw new Exception("Not Implemented Yet");
    }
}