<?php
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$debug = [
    "session_status" => session_status(),
    "session_id" => session_id(),
    "cookie_present" => isset($_COOKIE['PHPSESSID']),
    "user_in_session" => isset($_SESSION['user']),
    "full_session_data" => $_SESSION,
    "server_time" => date('Y-m-d H:i:s')
];

if (isset($_SESSION['user'])){
    if ($_SESSION['user']['ruolo'] === 'amministratore') $debug["message"] = "Sei loggato come Admin!";
    if ($_SESSION['user']['ruolo'] === 'studente') $debug["message"] = "Sei loggato come Studente";
}else{
    $debug["message"] = "Non sei loggato";
}

echo json_encode($debug, JSON_PRETTY_PRINT);