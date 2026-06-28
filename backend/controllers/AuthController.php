<?php

namespace controllers;

use manager\UserManager;
use models\User;

class AuthController
{
    public function login(): void
    {
        $rawInput    = file_get_contents('php://input');
        $credentials = json_decode($rawInput, true, 512, JSON_THROW_ON_ERROR);

        if (empty($credentials['email']) || empty($credentials['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "All fields are required."], JSON_THROW_ON_ERROR);
            exit();
        }

        $userManager = new UserManager();
        $user        = $userManager->findByEmail($credentials['email']);

        if ($user !== null && password_verify($credentials['password'], $user->getPassword())) {
            $token = base64_encode(json_encode([
                'user_id' => $user->getId(),
                'email'   => $user->getEmail()
            ], JSON_THROW_ON_ERROR));

            http_response_code(200);
            echo json_encode(["token" => $token], JSON_THROW_ON_ERROR);
            exit();
        }

        http_response_code(401);
        echo json_encode(["error" => "Invalid email or password."], JSON_THROW_ON_ERROR);
        exit();
    }

    public function register(): void
    {
        try {
            $rawInput    = file_get_contents('php://input');
            $credentials = json_decode($rawInput, true, 512, JSON_THROW_ON_ERROR);

            if ($credentials === null) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid or empty JSON payload."], JSON_THROW_ON_ERROR);
                exit();
            }

            $missingFields = [];
            foreach (['email', 'password', 'confirmPassword', 'username', 'pronoun'] as $key) {
                if (empty($credentials[$key])) $missingFields[] = $key;
            }

            if (!empty($missingFields)) {
                http_response_code(400);
                echo json_encode(["error" => "All fields are required.", "missing_keys" => $missingFields], JSON_THROW_ON_ERROR);
                exit();
            }

            if ($credentials['password'] !== $credentials['confirmPassword']) {
                http_response_code(400);
                echo json_encode(["error" => "Passwords do not match."], JSON_THROW_ON_ERROR);
                exit();
            }

            $userManager  = new UserManager();
            $existingUser = $userManager->findByEmail($credentials['email']);

            if ($existingUser !== null) {
                http_response_code(409);
                echo json_encode(["error" => "Account already exists with this email."], JSON_THROW_ON_ERROR);
                exit();
            }

            $user = new User(
                null,
                $credentials['username'],
                $credentials['pronoun'],
                $credentials['email'],
                password_hash($credentials['password'], PASSWORD_DEFAULT)
            );

            $userManager->create($user);

            $createdUser = $userManager->findByEmail($credentials['email']);

            $token = base64_encode(json_encode([
                'user_id' => $createdUser->getId(),
                'email'   => $credentials['email']
            ], JSON_THROW_ON_ERROR));

            http_response_code(201);
            echo json_encode(["token" => $token], JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode([
                "error" => "PHP FATAL CRASH: " . $e->getMessage(),
                "file"  => $e->getFile(),
                "line"  => $e->getLine()
            ], JSON_THROW_ON_ERROR);
            exit();
        }
    }
}