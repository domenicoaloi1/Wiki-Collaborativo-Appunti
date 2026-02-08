<?php
// backend/Controller/AuthController.php

class AuthController {
    private $userGateway;

    public function __construct($deps) {
        $this->userGateway = $deps['user'];
    }

    // Corrisponde a POST /login
    public function login() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->userGateway->getUser(new EmailFilter($email));

        if ($user && hash('sha256', $password) === $user['password']) {
            unset($user['password']);
            $_SESSION['user'] = $user;
            
            echo json_encode([
                "status" => "success",
                "user" => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Credenziali non valide"]);
        }
    }

    // Corrisponde a POST /logout
    public function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION = array();
        session_destroy();
        
        echo json_encode(["status" => "success", "message" => "Sessione chiusa"]);
    }

    // Corrisponde a POST /register
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "Dati incompleti"]);
            return;
        }

        $hashedPassword = hash('sha256', $data['password']);

        try {
            $userId = $this->userGateway->register([
                'email'    => $data['email'],
                'password' => $hashedPassword,
                'ruolo'    => 'studente' // Default
            ]);

            echo json_encode(["status" => "success", "id" => $userId]);
        } catch (PDOException $e) {
            http_response_code(409);
            echo json_encode(["error" => "Email già registrata"]);
        }
    }
}