<?php

namespace manager;

use core\Database;
use PDO;
use models\Album;

// Constantes de permission (miroir de la BDD)
const PERM_READ    = 1;
const PERM_MODIFY  = 3;
const PERM_COMMENT = 5;
const PERM_OWNER   = 10;

class AlbumManager
{
    private PDO $dbConnection;

    public function __construct()
    {
        $this->dbConnection = Database::getConnection();
    }

    // ── Lecture ───────────────────────────────────────

    /**
     * Retourne tous les albums accessibles pour un utilisateur :
     *   - Albums publics
     *   - Albums où l'utilisateur a une permission explicite
     * Inclut la dernière photo et la permission de l'utilisateur.
     */
    public function getAlbumById(int $id): ?\models\Album
    {
        // Suppression absolue de tout filtre de visibilité
        // Structure matérielle exigée
        $query = $this->dbConnection->prepare("
    SELECT id, name, visibility, description
    FROM album 
    WHERE id = :id
");
        $query->execute(['id' => $id]);
        $data = $query->fetch(\PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        $album = new \models\Album($data['id'], $data['name'], $data['visibility']);

        if (isset($data['description']) && method_exists($album, 'setDescription')) {
            $album->setDescription($data['description']);
        }

        return $album;
    }

    public function getAllAlbum(): array
    {
        // Extraction inconditionnelle couplée à la récupération de la photo la plus récente
        $query = $this->dbConnection->prepare("
            SELECT a.*, 
                   (SELECT p.alt 
                    FROM photo p 
                    INNER JOIN album_photo ap ON p.id = ap.photo_id 
                    WHERE ap.album_id = a.id 
                    ORDER BY p.id DESC 
                    LIMIT 1) AS last_photo 
            FROM album a
        ");
        $query->execute();
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);

        $albums = [];
        foreach ($results as $data) {
            $album = new \models\Album($data['id'], $data['name'], $data['visibility']);

            if (isset($data['description']) && method_exists($album, 'setDescription')) {
                $album->setDescription($data['description']);
            }

            // Hydratation dynamique de la propriété d'aperçu selon l'encapsulation du modèle
            if (!empty($data['last_photo'])) {
                if (method_exists($album, 'setLastPhoto')) {
                    $album->setLastPhoto($data['last_photo']);
                } else {
                    $album->last_photo = $data['last_photo'];
                }
            }

            $albums[] = $album;
        }

        return $albums;
    }

    public function getUserIdByEmail(string $email): ?int
    {
    $stmt = $this->dbConnection->prepare("SELECT id FROM user WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);

    return $result ? (int)$result['id'] : null;
    }
    public function getAlbumUsers(int $albumId): array
    {
        $stmt = $this->dbConnection->prepare("
            SELECT u.id, u.name, u.email, ua.permission
            FROM user_album ua
            INNER JOIN user u ON u.id = ua.user_id
            WHERE ua.album_id = ?
            ORDER BY ua.permission DESC, u.name
        ");
        $stmt->execute([$albumId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Écriture ──────────────────────────────────────

    public function create(\models\Album $album, int $userId): int
    {
        try {
            $this->dbConnection->beginTransaction();

            // ATTENTION : Si la base physique utilise "visibiliy", remplacez "visibility" ci-dessous.
            $stmt = $this->dbConnection->prepare(
                'INSERT INTO album (name, visibility) VALUES (:name, :visibility)'
            );
            $stmt->execute([
                'name'       => $album->getName(),
                'visibility' => $album->getVisibility(), // Ajuster la clé selon le nom réel en base
            ]);

            $albumId = (int)$this->dbConnection->lastInsertId();

            // Correction de la table : user_album
            $linkStmt = $this->dbConnection->prepare(
                'INSERT INTO user_album (album_id, user_id, permission) VALUES (:album_id, :user_id, 10)'
            );
            $linkStmt->execute([
                'album_id' => $albumId,
                'user_id'  => $userId,
            ]);

            $this->dbConnection->commit();

            return $albumId;

        } catch (\Throwable $systemError) {
            $this->dbConnection->rollBack();
            throw $systemError;
        }
    }

    public function getUserPermission(int $albumId, int $userId): int
    {
        // Correction de la table : user_album
        $query = $this->dbConnection->prepare("SELECT permission FROM user_album WHERE album_id = :album_id AND user_id = :user_id");
        $query->execute([
            'album_id' => $albumId,
            'user_id' => $userId
        ]);

        $result = $query->fetch(\PDO::FETCH_ASSOC);

        return $result ? (int)$result['permission'] : 0;
    }

    public function updateUserAccess(int $albumId, int $userId, int $permission): void
    {
        // Correction de la table : user_album
        $query = $this->dbConnection->prepare("UPDATE user_album SET permission = :permission WHERE album_id = :album_id AND user_id = :user_id");
        $query->execute([
            'permission' => $permission,
            'album_id' => $albumId,
            'user_id' => $userId
        ]);
    }

    public function removeUserAccess(int $albumId, int $userId): void
    {
        // Correction de la table : user_album
        $query = $this->dbConnection->prepare("DELETE FROM user_album WHERE album_id = :album_id AND user_id = :user_id");
        $query->execute([
            'album_id' => $albumId,
            'user_id' => $userId
        ]);
    }

    /**
     * Ajoute ou met à jour la permission d'un utilisateur sur un album.
     */
    public function setUserPermission(int $albumId, int $userId, int $permission): void
    {
        $stmt = $this->dbConnection->prepare(
            'INSERT INTO user_album (album_id, user_id, permission)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE permission = VALUES(permission)'
        );
        $stmt->execute([$albumId, $userId, $permission]);
    }

    public function delete(int $id): void
    {
        $stmt = $this->dbConnection->prepare('DELETE FROM album WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function updateDescription(int $albumId, string $description): void
    {
        $query = $this->dbConnection->prepare("UPDATE album SET description = :description WHERE id = :id");
        $query->execute([
            'description' => $description,
            'id' => $albumId
        ]);
    }
    public function removeUserFromAlbum(int $albumId, int $userId): void
    {
        $stmt = $this->dbConnection->prepare(
            'DELETE FROM user_album WHERE album_id = ? AND user_id = ?'
        );
        $stmt->execute([$albumId, $userId]);
    }

    public function updateVisibility(int $albumId, string $visibility): void
    {
        // Utilisation stricte de la propriété matérielle dbConnection
        $query = $this->dbConnection->prepare("UPDATE album SET visibility = :visibility WHERE id = :id");
        $query->execute([
            'visibility' => $visibility,
            'id' => $albumId
        ]);
    }

    public function getUsersByAlbumId(int $albumId): array
    {
        // Jointure certifiée sur la nomenclature du diagramme
        $query = $this->dbConnection->prepare("
            SELECT u.id, u.name, ua.permission 
            FROM user u
            INNER JOIN user_album ua ON u.id = ua.user_id
            WHERE ua.album_id = :album_id
        ");

        $query->execute(['album_id' => $albumId]);

        $users = $query->fetchAll(\PDO::FETCH_ASSOC);

        return $users ?: [];
    }
}