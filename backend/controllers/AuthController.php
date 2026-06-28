<?php

namespace controllers;

use manager\UserManager;
use models\User;

class AuthController
{
    /**
     * @throws \JsonException
     */
    public function login(): void
    {
        $rawInput = file_get_contents('php://input');
        $credentials = json_decode($rawInput, true, 512, JSON_THROW_ON_ERROR);

        if (empty($credentials['email']) || empty($credentials['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "All fields are required."], JSON_THROW_ON_ERROR);
            exit();
        }

        $email = $credentials['email'];
        $clearPassword = $credentials['password'];

        $userManager = new UserManager();
        $user = $userManager->findByEmail($email);

        if ($user !== null && password_verify($clearPassword, $user->getPassword())) {
            $token = base64_encode(json_encode(['user_id' => $user->getId(), 'email' => $user->getEmail()], JSON_THROW_ON_ERROR));

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
            $rawInput = file_get_contents('php://input');
            $credentials = json_decode($rawInput, true, 512, JSON_THROW_ON_ERROR);

            if ($credentials === null) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid or empty JSON payload."], JSON_THROW_ON_ERROR);
                exit();
            }

            $missingFields = [];
            $requiredKeys = ['email', 'password', 'confirmPassword', 'username', 'pronoun'];

            foreach ($requiredKeys as $key) {
                if (empty($credentials[$key])) {
                    $missingFields[] = $key;
                }
            }

            if (!empty($missingFields)) {
                http_response_code(400);
                echo json_encode([
                    "error" => "All fields are required.",
                    "missing_keys" => $missingFields
                ], JSON_THROW_ON_ERROR);
                exit();
            }

            $email = $credentials['email'];
            $clearPassword = $credentials['password'];
            $confirmPassword = $credentials['confirmPassword'];
            $name = $credentials['username'];
            $pronoun = $credentials['pronoun'];

            if ($clearPassword !== $confirmPassword) {
                http_response_code(400);
                echo json_encode(["error" => "Passwords do not match."], JSON_THROW_ON_ERROR);
                exit();
            }

            $userManager = new \manager\UserManager();
            $existingUser = $userManager->findByEmail($email);

            if ($existingUser !== null) {
                http_response_code(409);
                echo json_encode(["error" => "Account already exists with this email."], JSON_THROW_ON_ERROR);
                exit();
            }

            $hashedPassword = password_hash($clearPassword, PASSWORD_DEFAULT);

            $user = new User(null, $name, $pronoun, $email, $hashedPassword);

            if ($user->getPassword() === null || $user->getPassword() === '') {
                http_response_code(500);
                echo json_encode([
                    "error" => "CRASH INTERCEPTED: Memory loss inside User entity.",
                    "hashed_password_state" => $hashedPassword,
                    "user_object_dump" => [
                        "id" => $user->getId(),
                        "name" => $user->getName(),
                        "pronoun" => $user->getPronoun(),
                        "email" => $user->getEmail(),
                        "password" => $user->getPassword()
                    ]
                ], JSON_THROW_ON_ERROR);
                exit();
            }

            $userManager->create($user);

            $token = base64_encode(json_encode(['email' => $email], JSON_THROW_ON_ERROR));

            http_response_code(201);
            echo json_encode(["token" => $token], JSON_THROW_ON_ERROR);
            exit();
        } catch (\Throwable $systemError) {
            http_response_code(500);
            echo json_encode([
                "error" => "PHP FATAL CRASH: " . $systemError->getMessage(),
                "file" => $systemError->getFile(),
                "line" => $systemError->getLine()
            ], JSON_THROW_ON_ERROR);
            exit();
        }
    }
}