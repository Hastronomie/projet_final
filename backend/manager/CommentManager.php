<?php

namespace manager;

use core\Database;

class CommentManager extends \core\AbstractController
{
    protected $dbConnection;

    public function __construct()
    {
        // Remplacement de l'instruction dépréciée par l'inspection de méthode
        if (method_exists(parent::class, '__construct')) {
            parent::__construct();
        }

        $this->dbConnection = Database::getConnection();
    }

    public function createComment(int $photoId, int $userId, string $content): int
    {
        try {
            $this->dbConnection->beginTransaction();

            $stmt = $this->dbConnection->prepare(
                'INSERT INTO comment (content) VALUES (:content)'
            );
            $stmt->execute([
                'content' => $content
            ]);

            $commentId = (int)$this->dbConnection->lastInsertId();

            $photoLinkStmt = $this->dbConnection->prepare(
                'INSERT INTO photo_comment (photo_id, comment_id) VALUES (:photo_id, :comment_id)'
            );
            $photoLinkStmt->execute([
                'photo_id'   => $photoId,
                'comment_id' => $commentId
            ]);

            $userLinkStmt = $this->dbConnection->prepare(
                'INSERT INTO comment_user (comment_id, user_id) VALUES (:comment_id, :user_id)'
            );
            $userLinkStmt->execute([
                'comment_id' => $commentId,
                'user_id'    => $userId
            ]);

            $this->dbConnection->commit();

            return $commentId;

        } catch (\Throwable $systemError) {
            $this->dbConnection->rollBack();
            throw $systemError;
        }
    }

    public function getCommentsByPhotoId(int $photoId): array
    {
        $query = $this->dbConnection->prepare("
            SELECT c.id, c.content, cu.user_id, u.name AS user_name
            FROM comment c
            INNER JOIN photo_comment pc ON c.id = pc.comment_id
            INNER JOIN comment_user cu ON c.id = cu.comment_id
            INNER JOIN user u ON cu.user_id = u.id
            WHERE pc.photo_id = :photo_id
            ORDER BY c.id ASC
        ");
        $query->execute(['photo_id' => $photoId]);

        return $query->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }
}