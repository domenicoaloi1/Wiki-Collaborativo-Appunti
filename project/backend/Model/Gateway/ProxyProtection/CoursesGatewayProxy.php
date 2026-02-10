<?php
// backend/Model/Gateway/ProxyProtection/CoursesGatewayProxy.php
class CoursesGatewayProxy implements ICoursesGateway {
    private $realGateway;
    private $user;

    public function __construct(CoursesGateway $real, $user) {
        $this->realGateway = $real;
        $this->user = $user;
    }

    public function getCourses(FilterStrategy $strategy): array {
        return $this->realGateway->getCourses($strategy);
    }

    public function findAll(): array{
        return $this->realGateway->findAll();
    }

    public function createCourse(string $nome){
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            return $this->realGateway->createCourse($nome);
        }
        $this->unauthorized();
    }

    public function updateCourse(int $id, string $nome): void {
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            $this->realGateway->updateCourse($id, $nome);
            return;
        }
        $this->unauthorized();
    }

    public function deleteCourse(int $id): void {
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            $this->realGateway->deleteCourse($id);
            return;
        }
        $this->unauthorized();
    }

    private function unauthorized(): void {
        throw new Exception("Accesso negato: l'utente non dispone delle autorizzazioni necessarie per questa operazione.");
    }
}