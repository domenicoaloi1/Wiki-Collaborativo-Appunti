<?php
// backend/index.php

// REST + CORS
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// LOAD FILES
require_once 'Router.php';
spl_autoload_register(function ($class_name) {
    $dirs = ['Model/Core/', 'Model/Gateway/', 'Model/Gateway/ProxyProtection/', 'Model/Gateway/Interface/', 'Model/Strategy/', 'Model/Memento/', 'Controller/',''];
    foreach ($dirs as $dir) {
        $file = __DIR__ . '/' . $dir . $class_name . '.php';
        // error_log("Cerco la classe $class_name in: $file");
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// DB
$dbConfig = [
    'host' => 'db',
    'db'   => 'wiki_db',
    'user' => 'wiki_user',
    'pass' => 'wiki_password'
];
$factory = new DatabaseFactory($dbConfig);
$pdo = (new DatabaseFactory($dbConfig))->createConnection();

// Inizializzazione
$realCoursesGateway = new CoursesGateway($pdo);
$realArgomentiGateway = new ArgomentiGateway($pdo);
$realNotesGateway = new NotesGateway($pdo);
$realVersionsGateway = new VersionsGateway($pdo);
$userGateway = new UserGateway($pdo);
// $router = new Router();
$sessionUser = $_SESSION['user'] ?? null;
$notesGateway = new NotesGatewayProxy($realNotesGateway, $sessionUser);
$versionsGateway = new VersionsGatewayProxy($realVersionsGateway, $sessionUser);
$coursesGateway = new CoursesGatewayProxy($realCoursesGateway, $sessionUser);
$argomentiGateway = new ArgomentiGatewayProxy($realArgomentiGateway, $sessionUser);
$gateways = [
    'course' => $coursesGateway,
    'argument' => $argomentiGateway,
    'note' => $notesGateway,
    'version' => $versionsGateway
];
$cascadeService = new CascadeService($pdo, $gateways);

// Routing

$dependencies = [
    'pdo'      => $pdo,
    'course'   => $coursesGateway,
    'argument' => $argomentiGateway,
    'note'     => $notesGateway,
    'version'  => $versionsGateway,
    'user'     => $userGateway,
    'cascade'  => $cascadeService
];

$routes = require 'routes.php';
$router = new Router($routes, $dependencies);
$router->dispatch();
