<?php
// backend/index.php

// REST + CORS (origine del frontend configurabile via .env)
$allowedOrigin = getenv('CORS_ALLOWED_ORIGIN') ?: 'http://localhost:8080';
header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// LOAD FILES
require_once 'Router.php';
require_once 'autoload.php';

// DB: credenziali dalle variabili d'ambiente (project/.env, vedi .env.example)
$dbConfig = [
    'host' => getenv('DB_HOST') ?: 'db',
    'db'   => getenv('MYSQL_DATABASE') ?: 'wiki_db',
    'user' => getenv('MYSQL_USER') ?: '',
    'pass' => getenv('MYSQL_PASSWORD') ?: ''
];
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
