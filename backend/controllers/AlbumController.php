<?php

namespace controllers;

use manager\AlbumManager;
use core\AbstractController;

class AlbumController extends AbstractController
{

    public function getUsers(int $albumId): void
    {
        try {
            $currentUserId = $this->requireAuth();
            $albumManager = new \manager\AlbumManager();

            // Verrou d'intégrité : Seul le propriétaire administre les accès
            $currentPermission = $albumManager->getUserPermission($albumId, $currentUserId);
            if ($currentPermission < 10) {
                $this->sendError("Access denied. Owner permission required.", 403);
            }

            // Exécution matérielle (Requiert la méthode getUsersByAlbumId dans AlbumManager)
            $users = $albumManager->getUsersByAlbumId($albumId);

            $this->jsonResponse($users);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }
    public function getAll()
    {
        try {
            $userId = $this->requireAuth();

            $albumManager = new AlbumManager();
            $albums = $albumManager->getAllAlbum();

            $serializedAlbums = [];
            foreach ($albums as $album) {
                $permission = $albumManager->getUserPermission($album->getId(), $userId);

                if ($album->getVisibility() === 'private' && $permission === 0) {
                    continue;
                }

                // Lecture tolérante de la propriété ou de l'accesseur
                $lastPhoto = method_exists($album, 'getLastPhoto')
                    ? $album->getLastPhoto()
                    : ($album->last_photo ?? null);

                $serializedAlbums[] = [
                    'id'              => $album->getId(),
                    'name'            => $album->getName(),
                    'visibility'      => $album->getVisibility(),
                    'last_photo'      => $lastPhoto,
                    'user_permission' => $permission
                ];
            }

            $this->jsonResponse(array_values($serializedAlbums));

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }

    public function show(int $id): void
    {
        try {
            // Extraction de l'identité de l'appelant
            $userId = $this->requireAuth();

            $albumManager = new \manager\AlbumManager();
            $album = $albumManager->getAlbumById($id);

            if ($album === null) {
                $this->sendError("Album not found.", 404);
            }

            // Interrogation matérielle du niveau de permission
            $permission = $albumManager->getUserPermission($id, $userId);

            // Verrouillage d'accès si privé et non autorisé
            if ($album->getVisibility() === 'private' && $permission === 0) {
                $this->sendError("Access denied.", 403);
            }

            $this->jsonResponse([
                "id"              => $album->getId(),
                "name"            => $album->getName(),
                "visibility"      => $album->getVisibility(),
                "description"     => method_exists($album, 'getDescription') ? $album->getDescription() : null,
                "user_permission" => $permission // INJECTION REQUISE PAR LE FRONTEND
            ]);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }
    public function create(): void
    {
        try {
            // Verrouillage de la route et extraction de l'identifiant
            $userId = $this->requireAuth();

            $payload = $this->getRequestPayload();
            $name = $payload['name'] ?? null;
            $visibility = $payload['visibility'] ?? 'private';

            if (empty($name) || empty($visibility)) {
                $this->sendError("Name and visibility are required.", 400);
            }

            $albumManager = new \manager\AlbumManager();
            $album = new \models\Album(null, $name, $visibility);

            // Transfert de l'entité et de l'identifiant pour la transaction double
            $albumId = $albumManager->create($album, $userId);

            $this->jsonResponse([
                "message" => "Album successfully created.",
                "album_id" => $albumId
            ], 201);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }
    public function delete(int $id): void
    {
        try {
            $albumManager = new \manager\AlbumManager();
            $albumManager->delete($id);

            http_response_code(200);
            echo json_encode(["message" => "Album successfully deleted."], JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $systemError) {
            http_response_code(500);
            echo json_encode([
                "error" => "PHP FATAL CRASH: " . $systemError->getMessage()
            ], JSON_THROW_ON_ERROR);
            exit();
        }
    }

    public function updateDescription(int $id): void
    {
        try {
            // Lecture native, sans dépendre du AbstractController
            $description = $_POST['description'] ?? null;

            if ($description === null) {
                // Si $_POST échoue, tentative de capture brute de secours
                $rawInput = file_get_contents('php://input');
                parse_str($rawInput, $parsedInput);
                $description = $parsedInput['description'] ?? '';
            }

            $albumManager = new \manager\AlbumManager();
            $albumManager->updateDescription($id, trim($description));

            // Renvoi direct
            http_response_code(200);
            echo json_encode(["status" => "success"]);
            exit();

        } catch (\Throwable $systemError) {
            http_response_code(500);
            echo json_encode(["error" => "PHP FATAL CRASH: " . $systemError->getMessage()]);
            exit();
        }
    }

    public function updateAccess(int $albumId, int $targetUserId): void
    {
        try {
            $currentUserId = $this->requireAuth();
            $albumManager = new \manager\AlbumManager();

            // Vérification d'intégrité : Blocage de l'escalade de privilèges
            $currentPermission = $albumManager->getUserPermission($albumId, $currentUserId);
            if ($currentPermission < 10) {
                $this->sendError("Privilege escalation rejected. Owner access required.", 403);
            }

            $payload = $this->getRequestPayload();
            if (!isset($payload['permission'])) {
                $this->sendError("Payload rejected. Missing permission node.", 400);
            }

            $newPermission = (int)$payload['permission'];
            $albumManager->updateUserAccess($albumId, $targetUserId, $newPermission);

            $this->jsonResponse(["status" => "success"]);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }

    public function removeAccess(int $albumId, int $targetUserId): void
    {
        try {
            $currentUserId = $this->requireAuth();
            $albumManager = new \manager\AlbumManager();

            // Vérification d'intégrité : Blocage de l'escalade de privilèges
            $currentPermission = $albumManager->getUserPermission($albumId, $currentUserId);
            if ($currentPermission < 10) {
                $this->sendError("Privilege escalation rejected. Owner access required.", 403);
            }

            $albumManager->removeUserAccess($albumId, $targetUserId);

            $this->jsonResponse(["status" => "success"]);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }

    public function updateVisibility(int $albumId): void
    {
        try {
            $currentUserId = $this->requireAuth();
            $albumManager = new \manager\AlbumManager();

            $currentPermission = $albumManager->getUserPermission($albumId, $currentUserId);
            if ($currentPermission < 10) {
                $this->sendError("Privilege escalation rejected. Owner access required.", 403);
            }

            $visibility = $_POST['visibility'] ?? null;
            if (!in_array($visibility, ['public', 'private'], true)) {
                $this->sendError("Invalid visibility state.", 400);
            }

            // Exécution SQL (Requiert la méthode updateVisibility dans AlbumManager.php)
            $albumManager->updateVisibility($albumId, $visibility);

            $this->jsonResponse(["status" => "success", "visibility" => $visibility]);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }

    public function invite(int $id): void
    {
        try {
            $userId = $this->requireAuth();
            $albumManager = new \manager\AlbumManager();

            if ($albumManager->getUserPermission($id, $userId) < 10) {
                $this->sendError("Permission Propriétaire requise.", 403);
            }

            // OBLIGATION MATÉRIELLE : Lecture brute et extraction de l'email
            $rawInput = file_get_contents('php://input');
            $payload = json_decode($rawInput, true);

            $targetEmail = $payload['email'] ?? null;
            $permission = isset($payload['permission']) ? (int)$payload['permission'] : null;

            if (!$targetEmail || !$permission) {
                $this->sendError("Rejet : Email ou permission manquante.", 400);
            }

            // Résolution matérielle
            $targetUserId = $albumManager->getUserIdByEmail($targetEmail);

            if (!$targetUserId) {
                $this->sendError("Aucun utilisateur associé à cette adresse email.", 404);
            }

            $albumManager->setUserPermission($id, $targetUserId, $permission);

            $this->jsonResponse(["status" => "success"]);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }
}