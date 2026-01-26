<?php
// backend/index.php

// REST + CORS

header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// DB

$host = 'db'; $db = 'wiki_db'; $user = 'wiki_user'; $pass = 'wiki_password';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// 1. Carichiamo il Gateway
require_once 'Gateway/CoursesGateway.php';
$coursesGateway = new CoursesGateway($pdo);

// 2. Routing Minimalista
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = rtrim($requestUri, '/');

switch ($route) {
    case '/corsi':
        // RF3: Restituisce la lista dei corsi
        $data = $coursesGateway->findAll();
        echo json_encode($data);
        break;

    default:
        // Rotta di fallback
        echo json_encode(["status" => "online", "message" => "Wiki API Ready"]);
        break;
}