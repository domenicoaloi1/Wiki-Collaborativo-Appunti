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
    $dirs = ['Model/Core/', 'Model/Gateway/', 'Model/Strategy/', 'Model/Memento/', ''];
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
$router = new Router();
$sessionUser = $_SESSION['user'] ?? null;
$notesGateway = new NotesGatewayProxy($realNotesGateway, $sessionUser);
$versionsGateway = new VersionsGatewayProxy($realVersionsGateway, $sessionUser);
$coursesGateway = new CoursesGatewayProxy($realCoursesGateway, $sessionUser);
$argomentiGateway = new ArgomentiGatewayProxy($realArgomentiGateway, $sessionUser);
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

// RF2
$router->add('POST', '/login', function() use ($userGateway) {
    // Leggiamo i dati JSON dal corpo della richiesta
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $user = $userGateway->getUser(new EmailFilter($email));

    if ($user && hash('sha256', $password) === $user['password']) {
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

// RF2
$router->add('POST', '/logout', function() {
    session_start();
    session_destroy();
    echo json_encode(["status" => "success"]);
});

// RF1
$router->add('POST', '/register', function() use ($userGateway) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Dati incompleti"]);
        return;
    }

    // Hashing della password
    $hashedPassword = hash('sha256', $data['password']);

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

// RF6
$router->add('POST', '/appunto/crea', function() use ($notesGateway, $argomentiGateway) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['titolo']) || empty($data['argomento_id']) || empty($data['utente_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Dati mancanti"]);
        return;
    }

    try {
        $corsoId = $argomentiGateway->getCorsoIdByArgomento(new IdFilter($data['argomento_id']));

        $contenutoIniziale = $data['contenuto'] ?? "# " . $data['titolo'];

        $newId = $notesGateway->createNote(
            $data['argomento_id'], 
            $data['utente_id'], 
            $data['titolo'], 
            $contenutoIniziale,
            $corsoId
        );

        echo json_encode(["status" => "success", "id" => $newId]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
});

// RF7 & RF8: Salva una nuova versione
$router->add('POST', '/appunto/versione/salva', function() use ($versionsGateway, $notesGateway, $argomentiGateway) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Recupero l'appunto attuale (prima della modifica)
        $appuntoId = (int)$data['id'];
        $notes = $notesGateway->getNotes(new IdFilter($appuntoId));
        if (empty($notes)) throw new Exception("Appunto non trovato");
        
        $currentNote = $notes[0];
        $corsoId = $argomentiGateway->getCorsoIdByArgomento(new IdFilter((int)$currentNote['argomento_id']));

        // Uso dati vecchi e creo il memento (il contenuto che sta per diventare "passato")
        $oldMemento = new NoteMemento(
            $appuntoId, 
            $currentNote['contenuto'], 
            (int)$currentNote['utente_id']
        );

        // Salvo il vecchio memento nella cronologia
        $versionsGateway->saveVersion($oldMemento, $corsoId);

        // Sovrascrivo con l'appunto nuovo
        $notesGateway->updateNoteContent($appuntoId, $data['testo']);

        echo json_encode(["status" => "success", "message" => "Cronologia aggiornata e modifiche salvate"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
});

//RF7 & RF8: Recupera cronologia versioni
$router->add('GET', '/appunto/storia', function() use ($versionsGateway, $userGateway) {
    $id = $_GET['id'] ?? null;
    if (!$id) return;
    
    $versions = $versionsGateway->getVersionsList(new AppuntoFilter((int)$id));

    foreach ($versions as &$v) {
        try {
            $user = $userGateway->getUser(new IdFilter((int)$v['utente_id']));
            $v['autore'] = $user ? $user['email'] : 'Utente rimosso';
        } catch (Exception $e) {
            $v['autore'] = 'Errore recupero';
        }
        // Rimuoviamo l'utente_id dal JSON finale se non serve al frontend
        unset($v['utente_id']);
    }

    echo json_encode($versions);
});

//RF8
$router->add('GET', '/appunto/versione/visualizza', function() use ($versionsGateway) {
    $versioneId = $_GET['versione_id'] ?? null;

    try {
        $memento = $versionsGateway->getMemento(new IdFilter((int)$versioneId));
        $stato = $memento->getState();
        echo json_encode(["status" => "success", "testo" => $stato['testo']]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
});

//RF7: Ripristina una versione specifica
$router->add('POST', '/appunto/versione/ripristina', function() use ($versionsGateway, $notesGateway, $argomentiGateway) {
    $data = json_decode(file_get_contents('php://input'), true);
    $versioneId = (int)$data['versione_id'];
    $utenteId = (int)$data['utente_id'];

    try {
        $mementoDaRipristinare = $versionsGateway->getMemento(new IdFilter($versioneId));
        $testoStorico = $mementoDaRipristinare->getState()['testo'];
        $appuntoId = $mementoDaRipristinare->getState()['id'];

        $noteAttuale = $notesGateway->getNotes(new IdFilter($appuntoId))[0];
        $corsoId = $argomentiGateway->getCorsoIdByArgomento(new IdFilter((int)$noteAttuale['argomento_id']));

        $mementoStatoCorrente = new NoteMemento(
            $appuntoId, 
            $noteAttuale['contenuto'], 
            $utenteId
        );
        $versionsGateway->saveVersion($mementoStatoCorrente, $corsoId);

        $notesGateway->updateNoteContent($appuntoId, $testoStorico);

        echo json_encode([
            "status" => "success", 
            "message" => "Versione ripristinata", 
            "testo" => $testoStorico
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
});

$router->dispatch();