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
        if ($this->user && ($this->user['ruolo'] === 'studente')) {
            $this->realGateway->saveVersion($memento, $corsoId);
            return;
        }
        $this->unauthorized();
    }

    public function getVersions(FilterStrategy $strategy): array{
        return $this->realGateway->getVersions($strategy);
    }
    
    public function deleteVersions(FilterStrategy $strategy){
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            $this->realGateway->deleteVersions($strategy);
            return;
        }
        $this->unauthorized();
    }

    private function unauthorized(): void {
        throw new Exception("Accesso negato: l'utente non dispone delle autorizzazioni necessarie per questa operazione.");
    }
}