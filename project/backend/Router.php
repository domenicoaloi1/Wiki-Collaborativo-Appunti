<?php
// backend/Router.php

class Router {
    private $routes = [];

    public function add($method, $path, $callback) {
        $this->routes[] = [
            'method'   => $method,
            'path'     => rtrim($path, '/'),
            'callback' => $callback
        ];
    }

    public function dispatch() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = rtrim($uri, '/');
        $method = $_SERVER['REQUEST_METHOD'];

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $route['path'] === $uri) {
                return call_user_func($route['callback']);
            }
        }

        http_response_code(404);
        echo json_encode(["error" => "Rotta non trovata: " . $uri]);
    }
}