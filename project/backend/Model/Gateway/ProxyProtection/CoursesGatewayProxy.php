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

    public function createCourse(string $nome, string $descrizione){
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            return $this->realGateway->createCourse($nome, $descrizione);
        }
        $this->unauthorized();
    }

    public function updateCourse(int $id, string $nome, string $descrizione): void {
        if ($this->user && $this->user['ruolo'] === 'amministratore') {
            $this->realGateway->updateCourse($id, $nome, $descrizione);
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
        throw new Exception("Accesso negato: operazione riservata agli amministratori.");
    }
}