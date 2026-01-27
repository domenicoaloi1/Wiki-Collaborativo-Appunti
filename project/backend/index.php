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

// RF3
require_once 'Gateway/CoursesGateway.php';
$coursesGateway = new CoursesGateway($pdo);
// RF4
require_once 'Gateway/NotesGateway.php';
$notesGateway = new NotesGateway($pdo);

// Routing DA SPOSTARE IN FILE A PARTE
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = rtrim($requestUri, '/');

switch ($route) {
    // RF3
    case '/corsi':
        $data = $coursesGateway->findAll();
        echo json_encode($data);
        break;
    //RF4
    case '/appunti':
        $courseId = $_GET['corso_id'] ?? null;
        if ($courseId) {
            echo json_encode($notesGateway->findByCourse((int)$courseId));
        }
        break;

    default:
        // Rotta di fallback
        echo json_encode(["status" => "online", "message" => "Wiki API Ready"]);
        break;
}