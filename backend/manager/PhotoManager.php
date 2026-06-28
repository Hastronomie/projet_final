<?php

namespace manager;

use core\Database;
use PDO;
use models\Photo;

class PhotoManager
{
    private PDO $dbConnection;

    public function __construct()
    {
        $this->dbConnection = Database::getConnection();
    }

    public function create(Photo $photo): int
    {
        $query = $this->dbConnection->prepare(
            'INSERT INTO photo (alt, date, caption) VALUES (:alt, :date, :caption)'
        );
        $query->execute([
            'alt'     => $photo->getAlt(),
            'date'    => $photo->getDate(),
            'caption' => $photo->getCaption(),
        ]);

        return (int) $this->dbConnection->lastInsertId();
    }

    public function linkToAlbum(int $photoId, int $albumId): void
    {
        $query = $this->dbConnection->prepare(
            'INSERT INTO album_photo (album_id, photo_id) VALUES (:album_id, :photo_id)'
        );
        $query->execute([
            'album_id' => $albumId,
            'photo_id' => $photoId,
        ]);
    }

    public function fetchByAlbumId(int $albumId): array
    {
        $query = $this->dbConnection->prepare('
            SELECT p.id, p.alt, p.date, p.caption
            FROM photo p
            INNER JOIN album_photo ap ON ap.photo_id = p.id
            WHERE ap.album_id = :album_id
            ORDER BY p.date DESC
        ');
        $query->execute(['album_id' => $albumId]);
        $results = $query->fetchAll(PDO::FETCH_ASSOC);

        $photos = [];
        foreach ($results as $result) {
            $photos[] = new Photo(
                $result['id'],
                $result['alt'],
                $result['date'],
                $result['caption']
            );
        }

        return $photos;
    }

    public function delete(int $id): void
    {
        $query = $this->dbConnection->prepare(
            'DELETE FROM album_photo WHERE photo_id = :id'
        );
        $query->execute(['id' => $id]);

        $query = $this->dbConnection->prepare(
            'DELETE FROM photo WHERE id = :id'
        );
        $query->execute(['id' => $id]);
    }
}