<?php

namespace controllers;

use core\AbstractController;

class UserController extends AbstractController
{
    public function me(): void
    {
        header('Content-Type: application/json');
        try {
            $currentUserId = $this->requireAuth();
            $userManager   = new \manager\UserManager();
            $user          = $userManager->findById($currentUserId);

            if (!$user) {
                http_response_code(404);
                echo json_encode(['error' => 'Utilisateur introuvable.']);
                exit();
            }

            http_response_code(200);
            echo json_encode([
                'id'       => $user->getId(),
                'name'     => $user->getName(),
                'pronoun'  => $user->getPronoun(),
                'email'    => $user->getEmail(),
                'username' => $user->getUsername(),
                'photo'    => $user->getPhoto(),
            ], JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'PHP FATAL CRASH: ' . $e->getMessage()]);
            exit();
        }
    }

    public function search(): void
    {
        header('Content-Type: application/json');
        try {
            $currentUserId = $this->requireAuth();
            $raw           = trim($_GET['q'] ?? '');

            if (mb_strlen($raw) < 2 || mb_strlen($raw) > 100) {
                http_response_code(422);
                echo json_encode(['error' => 'La recherche doit contenir entre 2 et 100 caractères.']);
                exit();
            }

            $sanitized   = str_replace(['%', '_', '\\'], '', $raw);
            $userManager = new \manager\UserManager();
            $users       = $userManager->searchByName($sanitized, $currentUserId);

            http_response_code(200);
            echo json_encode(array_values($users), JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'PHP FATAL CRASH: ' . $e->getMessage()]);
            exit();
        }
    }

    public function addFriend(): void
    {
        header('Content-Type: application/json');
        try {
            $currentUserId = $this->requireAuth();
            $body          = json_decode(file_get_contents('php://input'), true);
            $friendId      = isset($body['friend_id']) ? (int)$body['friend_id'] : 0;

            if (!$friendId || $friendId === $currentUserId) {
                http_response_code(400);
                echo json_encode(['error' => 'ID ami invalide.']);
                exit();
            }

            $userManager = new \manager\UserManager();
            $userManager->addFriend($currentUserId, $friendId);

            http_response_code(200);
            echo json_encode(['message' => 'Ami ajouté.'], JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'PHP FATAL CRASH: ' . $e->getMessage()]);
            exit();
        }
    }
}