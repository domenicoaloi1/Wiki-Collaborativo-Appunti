<?php
// backend/Model/Gateway/Interface/IArgomentiGateway.php
interface IArgomentiGateway {
    public function getArgomenti(FilterStrategy $strategy): array;
    public function deleteArguments(FilterStrategy $strategy);
    public function getCorsoIdByArgomento(FilterStrategy $strategy): int;
    public function createArgomento(int $corsoId, string $nome);
    public function updateArgomento(int $id, string $nome): void;
}