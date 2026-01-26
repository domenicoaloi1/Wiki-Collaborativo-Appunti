<?php
// backend/index.php

// Permetti al frontend sulla 8080 di chiamare questo server sulla 8000
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rotta di test
$response = [
    "status" => "success",
    "message" => "Backend Wiki Online!",
    "timestamp" => date('Y-m-d H:i:s'),
    "database_connection" => "pending"
];

echo json_encode($response);