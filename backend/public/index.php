<?php

if (!isset($_SERVER['HTTP_AUTHORIZATION']) && function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    if (isset($headers['Authorization'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
    }
}

if (php_sapi_name() === 'cli-server') {
    $staticFile = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($staticFile)) {
        return false;
    }
}

@ini_set('upload_max_filesize', '20M');
@ini_set('post_max_size', '25M');
@ini_set('max_execution_time', '60');
@ini_set('memory_limit', '128M');
// ── Gestion d'erreurs JSON ────────────────────────────
ini_set('display_errors', 0);
error_reporting(E_ALL);

set_error_handler(function (int $errno, string $errstr) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $errstr]);
    exit();
});

set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
    exit();
});

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => $error['message'], 'file' => $error['file'], 'line' => $error['line']]);
    }
});
// ── Fin gestion d'erreurs ─────────────────────────────

// ── CORS ──────────────────────────────────────────────
$allowedOrigins = explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3000');
$requestOrigin  = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($requestOrigin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
    header("Vary: Origin");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Connection: close");
    header("Content-Length: 0");
    http_response_code(204);
    exit();
}
// ── Fin CORS ──────────────────────────────────────────

require_once __DIR__ . '/../core/Autoloader.php';
\core\Autoloader::register();

// ✅ Ces deux lignes manquaient
$router = new \core\Router();
$router->handleRequest();