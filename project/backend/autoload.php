<?php
// backend/autoload.php
// Autoloader minimale: cerca la classe nelle cartelle del backend, senza namespace.
// Usato sia da index.php che dal bootstrap dei test.

spl_autoload_register(function ($class_name) {
    $dirs = ['Model/Core/', 'Model/Gateway/', 'Model/Gateway/ProxyProtection/', 'Model/Gateway/Interface/', 'Model/Strategy/', 'Model/Memento/', 'Controller/', ''];
    foreach ($dirs as $dir) {
        $file = __DIR__ . '/' . $dir . $class_name . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});
