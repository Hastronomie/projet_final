<?php

namespace controllers;

use core\AbstractController;

class PhotoController extends AbstractController
{
    public function index(): void
    {
        header('Content-Type: application/json');
        try {
            $albumId = isset($_GET['album_id']) ? (int)$_GET['album_id'] : null;

            if (!$albumId) {
                http_response_code(400);
                echo json_encode(["error" => "Missing album_id parameter."], JSON_THROW_ON_ERROR);
                exit();
            }

            $photoManager = new \manager\PhotoManager();
            $photos = $photoManager->fetchByAlbumId($albumId);

            $result = array_map(fn($p) => [
                'id'      => $p->getId(),
                'alt'     => $p->getAlt(),
                'date'    => $p->getDate(),
                'caption' => $p->getCaption(),
            ], $photos);

            http_response_code(200);
            echo json_encode(array_values($result), JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => "PHP FATAL CRASH: " . $e->getMessage()], JSON_THROW_ON_ERROR);
            exit();
        }
    }

    public function delete(int $id): void
    {
        header('Content-Type: application/json');
        try {
            $photoManager = new \manager\PhotoManager();
            $photoManager->delete($id);

            http_response_code(200);
            echo json_encode(["message" => "Photo supprimée."], JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => "PHP FATAL CRASH: " . $e->getMessage()], JSON_THROW_ON_ERROR);
            exit();
        }
    }

    public function upload(): void
    {
        header('Content-Type: application/json');
        try {
            if (!isset($_FILES['photo']) || empty($_POST['album_id'])) {
                http_response_code(400);
                echo json_encode(["error" => "Payload rejected. Missing file or album ID."], JSON_THROW_ON_ERROR);
                exit();
            }

            $albumId = (int)$_POST['album_id'];
            $file    = $_FILES['photo'];

            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(["error" => "File transfer failed. Code: " . $file['error']], JSON_THROW_ON_ERROR);
                exit();
            }

            $uploadDirectory = __DIR__ . '/../public/uploads/';
            if (!is_dir($uploadDirectory)) {
                if (!mkdir($uploadDirectory, 0777, true) && !is_dir($uploadDirectory)) {
                    throw new \RuntimeException(sprintf('Directory "%s" was not created', $uploadDirectory));
                }
            }

            $fileExtension   = pathinfo($file['name'], PATHINFO_EXTENSION);
            $newFileName     = uniqid('img_', true) . '.' . $fileExtension;
            $destinationPath = $uploadDirectory . $newFileName;

            if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
                http_response_code(500);
                echo json_encode(["error" => "Disk write failure."], JSON_THROW_ON_ERROR);
                exit();
            }

            $publicPath   = '/uploads/' . $newFileName;
            $photo        = new \models\Photo(null, $publicPath, date('Y-m-d'), '');
            $photoManager = new \manager\PhotoManager();
            $newPhotoId   = $photoManager->create($photo);
            $photoManager->linkToAlbum($newPhotoId, $albumId);

            http_response_code(201);
            echo json_encode(["message" => "Binary written to disk and persisted.", "path" => $publicPath], JSON_THROW_ON_ERROR);
            exit();

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => "PHP FATAL CRASH: " . $e->getMessage()], JSON_THROW_ON_ERROR);
            exit();
        }
    }

    public function addComment(int $photoId): void
    {
        try {
            $userId = $this->requireAuth();

            // Le contrôle de permission de l'album lié à la photo devrait idéalement s'opérer ici (Niveau >= 5)

            $payload = $this->getRequestPayload();
            $content = $payload['content'] ?? null;

            if (empty($content)) {
                $this->sendError("Comment content is required.", 400);
            }

            $commentManager = new \manager\CommentManager();
            $commentId = $commentManager->createComment($photoId, $userId, trim($content));

            $this->jsonResponse(["status" => "success", "comment_id" => $commentId], 201);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }

    public function getComments(int $photoId): void
    {
        try {
            $this->requireAuth();
            $commentManager = new \manager\CommentManager();
            $comments = $commentManager->getCommentsByPhotoId($photoId);

            $this->jsonResponse($comments);

        } catch (\Throwable $systemError) {
            $this->sendError("PHP FATAL CRASH: " . $systemError->getMessage(), 500);
        }
    }
}