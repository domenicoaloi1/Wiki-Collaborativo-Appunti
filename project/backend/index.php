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

// Dipendenze (OCCHIO ALL'ORDINE)
require_once 'Router.php';

require_once 'Model/DatabaseFactory.php';

require_once 'Model/FilterStrategy.php';

require_once 'Model/AbstractGateway.php';

require_once 'Model/NoFilter.php';
require_once 'Model/CourseFilter.php';

require_once 'Model/CoursesGateway.php';
require_once 'Model/NotesGateway.php';

// DB
$dbConfig = [
    'host' => 'db',
    'db'   => 'wiki_db',
    'user' => 'wiki_user',
    'pass' => 'wiki_password'
];
$factory = new DatabaseFactory($dbConfig);
$pdo = $factory->createConnection();

// Inizializzazione
$coursesGateway = new CoursesGateway($pdo);
$notesGateway = new NotesGateway($pdo);
$router = new Router();

// Routing

$router->add('GET', '/corsi', function() use ($coursesGateway) {
    echo json_encode($coursesGateway->findAll());
});

$router->add('GET', '/appunti', function() use ($notesGateway) {
    $courseId = (int)($_GET['corso_id'] ?? 0);
    
    if ($courseId > 0) {
        $strategy = new CourseFilter($courseId);
        echo json_encode($notesGateway->getNotes($strategy));
    } else {
        http_response_code(400);
        echo json_encode(["error" => "ID corso non valido"]);
    }
});

$router->dispatch();