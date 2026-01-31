<?php
// backend/index.php
session_start();
// REST + CORS
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// LOAD FILES
require_once 'Router.php';
spl_autoload_register(function ($class_name) {
    $dirs = ['Model/Core/', 'Model/Gateway/', 'Model/Strategy/', ''];
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
$coursesGateway = new CoursesGateway($pdo);
$argomentiGateway = new ArgomentiGateway($pdo);
$notesGateway = new NotesGateway($pdo);
$userGateway = new UserGateway($pdo);
$router = new Router();

// Routing

// RF3
$router->add('GET', '/corsi', function() use ($coursesGateway) {
    echo json_encode($coursesGateway->findAll());
});

$router->add('GET', '/argomenti', function() use ($argomentiGateway) {
    $courseId = (int)($_GET['corso_id'] ?? 0);
    
    if ($courseId > 0) {
        $strategy = new CourseFilter($courseId);
        echo json_encode($argomentiGateway->getArgomenti($strategy));
    } else {
        http_response_code(400);
        echo json_encode(["error" => "ID corso mancante"]);
    }
});

// RF4
$router->add('GET', '/appunti', function() use ($notesGateway) {
    $argomentoId = (int)($_GET['argomento_id'] ?? 0);
    
    if ($argomentoId > 0) {
        $strategy = new ArgomentoFilter($argomentoId);
        echo json_encode($notesGateway->getNotes($strategy));
    } else {
        http_response_code(400);
        echo json_encode(["error" => "ID argomento mancante"]);
    }
});

// RF5: Dettaglio Appunto
$router->add('GET', '/appunto', function() use ($notesGateway) {
    $noteId = (int)($_GET['id'] ?? 0);
    
    if ($noteId > 0) {
        $result = $notesGateway->getNotes(new IdFilter($noteId));
        
        if (!empty($result)) {
            echo json_encode($result[0]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Appunto non trovato"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "ID non valido o mancante"]);
    }
});

// RF9: Ricerca Appunti
$router->add('GET', '/cerca', function() use ($notesGateway) {
    $query = $_GET['q'] ?? '';
    
    if (strlen($query) >= 2) {
        echo json_encode($notesGateway->getNotes(new SearchFilter($query)));
    } else {
        echo json_encode([]); // Lista vuota se la query è troppo corta
    }
});

$router->add('POST', '/login', function() use ($userGateway) {
    // Leggiamo i dati JSON dal corpo della richiesta
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $user = $userGateway->getUser(new EmailFilter($email));

    if ($user && password_verify($password, $user['password'])) {
        // Login successo! Ritorna i dati dell'utente (senza la password)
        unset($user['password']);
        echo json_encode([
            "status" => "success",
            "user" => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Credenziali non valide"]);
    }
});

$router->add('POST', '/logout', function() {
    session_start();
    session_destroy();
    echo json_encode(["status" => "success"]);
});

$router->add('POST', '/register', function() use ($userGateway) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Dati incompleti"]);
        return;
    }

    // Hashing della password
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

    try {
        $userId = $userGateway->register([
            'email'    => $data['email'],
            'password' => $hashedPassword,
            'ruolo'    => 'studente' // Default per i nuovi iscritti
        ]);

        echo json_encode(["status" => "success", "id" => $userId]);
    } catch (PDOException $e) {
        http_response_code(409); // Conflict (es. email già esistente)
        echo json_encode(["error" => "Email già registrata"]);
    }
});

$router->dispatch();