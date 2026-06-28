<?php

namespace core;

use controllers\AlbumController;
use controllers\PhotoController;
use controllers\AuthController;
use controllers\UserController;

class Router
{
    public function handleRequest() : void
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'];

        $segments = explode('/', trim($uri, '/'));
        $baseRoute = $segments[0] ?? '';
        $resourceId = isset($segments[1]) ? (int)$segments[1] : null;

        if ($baseRoute === '') {
            $this->sendNotFound();
            return;
        }

        switch ($baseRoute) {

            case 'auth':
                $authController = new AuthController();
                $action = $segments[1] ?? null;
                if ($method === 'POST') {
                    if ($action === 'login') {
                        $authController->login();
                    } elseif ($action === 'register') {
                        $authController->register();
                    }
                }
                break;

            case 'albums':
                $albumController = new AlbumController();
                $action = $segments[2] ?? null;
                $targetUserId = isset($segments[3]) ? (int)$segments[3] : null;

                if ($method === 'GET') {
                    if ($resourceId && $action === 'users') {
                        $albumController->getUsers($resourceId);
                    } else {
                        $resourceId ? $albumController->show($resourceId) : $albumController->getAll();
                    }
                } elseif ($method === 'POST') {
                    if ($resourceId && $action === 'update') {
                        $albumController->updateDescription($resourceId);
                    } elseif ($resourceId && $action === 'invite') {
                        $albumController->invite($resourceId);
                    } elseif ($resourceId && $action === 'visibility') {
                        $albumController->updateVisibility($resourceId);
                    } else {
                        $albumController->create();
                    }
                } elseif ($method === 'PATCH') {
                    if ($resourceId && $action === 'access' && $targetUserId) {
                        $albumController->updateAccess($resourceId, $targetUserId);
                    }
                } elseif ($method === 'DELETE' && $resourceId) {
                    if ($action === 'access' && $targetUserId) {
                        $albumController->removeAccess($resourceId, $targetUserId);
                    } else {
                        $albumController->delete($resourceId);
                    }
                }
                break;

            case 'photos':
                $photoController = new PhotoController();
                $action = $segments[2] ?? null;

                if ($method === 'GET') {
                    if ($resourceId && $action === 'comments') {
                        $photoController->getComments($resourceId);
                    } else {
                        $resourceId ? $photoController->show($resourceId) : $photoController->index();
                    }
                } elseif ($method === 'POST') {
                    if ($resourceId && $action === 'comments') {
                        $photoController->addComment($resourceId);
                    } else {
                        $photoController->upload();
                    }
                } elseif ($method === 'DELETE' && $resourceId) {
                    $photoController->delete($resourceId);
                }
                break;

            case 'users':
                $userController = new UserController();
                if ($method === 'GET') {
                    $userController->search();
                } elseif ($method === 'POST' && ($segments[1] ?? '') === 'friend') {
                    $userController->addFriend();
                }
                break;

            default:
                $this->sendNotFound();
                break;
        }
    }

    private function sendNotFound() : void
    {
        http_response_code(404);
        echo json_encode(["error" => "Route introuvable"]);
        exit();
    }
}