<?php
// backend/Model/Gateway/ProxyProtection/ArgomentiGatewayProxy.php
class ArgomentiGatewayProxy implements IArgomentiGateway {
    private $realGateway;
    private $user;

    public function __construct(ArgomentiGateway $real, $user) {
        $this->realGateway = $real;
        $this->user = $user;
    }

    public function getArgomenti(FilterStrategy $strategy): array {
        return $this->realGateway->getArgomenti($strategy);
    }

    public function getCorsoIdByArgomento(FilterStrategy $strategy): int {
        return $this->realGateway->getCorsoIdByArgomento($strategy);
    }

    public function createArgomento(int $corsoId, string $nome) {
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            return $this->realGateway->createArgomento($corsoId, $nome);
        }
        $this->unauthorized();
    }

    public function updateArgomento(int $id, string $nome): void {
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            $this->realGateway->updateArgomento($id, $nome);
            return;
        }
        $this->unauthorized();
    }

    public function deleteArgomento(int $id): void {
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            $this->realGateway->deleteArgomento($id);
            return;
        }
        $this->unauthorized();
    }

    private function unauthorized(): void {
        throw new Exception("Accesso negato: operazione riservata agli amministratori.");
    }
}