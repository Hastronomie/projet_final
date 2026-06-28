<?php

namespace core;

use PDO;

abstract class AbstractController
{
    protected PDO $db;

    public function __construct()
    {
        $host = "localhost";
        $port = "3306";
        $dbname = "photo-album";
        $connectionString = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";

        $user = "root";
        $password = "";

        $this->db = new PDO(
            $connectionString,
            $user,
            $password
        );
    }

    protected function jsonResponse(mixed $payload, int $statusCode = 200) : void
    {
        if (ob_get_length()) {
            ob_clean();
        }

        header('Content-Type: application/json; charset=utf-8');
        http_response_code($statusCode);

        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit();
    }

    protected function getRequestPayload() : array
    {
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        return is_array($data) ? $data : [];
    }

    protected function sendError(string $errorMessage, int $statusCode = 400) : void
    {
        $this->jsonResponse(['error' => $errorMessage], $statusCode);
    }

    protected function getCurrentUserId(): ?int
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (empty($authHeader) && function_exists('apache_request_headers')) {
            $headers    = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? '';
        }

        if (!str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token   = trim(substr($authHeader, 7));
        $payload = json_decode(base64_decode($token), true);

        return isset($payload['user_id']) ? (int)$payload['user_id'] : null;
    }

    protected function requireAuth(): int
    {
        $userId = $this->getCurrentUserId();
        if (!$userId) {
            $this->sendError('Unauthenticated.', 401);
        }
        return $userId;
    }
}