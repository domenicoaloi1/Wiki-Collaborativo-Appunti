<?php
// backend/index.php

header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = 'db';
$db   = 'wiki_db';
$user = 'wiki_user';
$pass = 'wiki_password';

$dbStatus = "Non connesso";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbStatus = "Connesso con successo!";
} catch (PDOException $e) {
    $dbStatus = "Errore di connessione: " . $e->getMessage();
}

echo json_encode([
    "status" => "success",
    "backend_status" => "Online",
    "database_status" => $dbStatus,
    "timestamp" => date('H:i:s')
]);