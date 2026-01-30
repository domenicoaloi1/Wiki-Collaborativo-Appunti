<?php
// backend/Model/Core/DatabaseFactory.php

class DatabaseFactory {
    private array $config;

    public function __construct(array $config) {
        $this->config = $config;
    }

    public function createConnection(): PDO {
        $dsn = "mysql:host={$this->config['host']};dbname={$this->config['db']};charset=utf8mb4";
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];

        try {
            return new PDO($dsn, $this->config['user'], $this->config['pass'], $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Connessione al database fallita"]);
            exit;
        }
    }
}