<?php
// backend/Model/Gateway/ProtectionProxy/VersionsGatewayProxy.php

class VersionsGatewayProxy implements IVersionsGateway {
    private $realGateway;
    private $user;

    public function __construct(VersionsGateway $real, $user) {
        $this->realGateway = $real;
        $this->user = $user;
    }

    public function getVersionsList(FilterStrategy $strategy): array {
        return $this->realGateway->getVersionsList($strategy);
    }

    public function getMemento(FilterStrategy $strategy): NoteMemento {
        return $this->realGateway->getMemento($strategy);
    }

    public function saveVersion(NoteMemento $memento, int $corsoId): void {
        if ($this->user && ($this->user['ruolo'] === 'studente' || $this->user['ruolo'] === 'amministratore')) {
            $this->realGateway->saveVersion($memento, $corsoId);
            return;
        }
        $this->unauthorized();
    }

    private function unauthorized(): void {
        throw new Exception("Accesso negato: non hai i permessi per archiviare nuove versioni.");
    }
}