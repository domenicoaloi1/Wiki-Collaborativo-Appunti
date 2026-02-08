<?php
// backend/Router.php

class Router {
    private $routes;
    private $dependencies;

    public function __construct($routes, $dependencies) {
        $this->routes = $routes;
        $this->dependencies = $dependencies;
    }

    public function dispatch() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = rtrim($uri, '/');
        $method = $_SERVER['REQUEST_METHOD'];

        if (!isset($this->routes[$method][$uri])) {
            http_response_code(404);
            echo json_encode(["error" => "Rotta non trovata: " . $uri]);
            return;
        }

        $route = $this->routes[$method][$uri];
        list($controllerName, $action) = explode('@', $route);

        if (class_exists($controllerName)) {
            $controller = new $controllerName($this->dependencies);
            
            if (method_exists($controller, $action)) {
                return $controller->$action();
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Metodo $action non trovato in $controllerName"]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Classe $controllerName non trovata"]);
        }
    }
}