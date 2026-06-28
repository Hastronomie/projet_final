<?php

namespace manager;

use core\Database;
use PDO;
use models\User;

class UserManager
{
    private PDO $dbConnection;

    public function __construct()
    {
        $this->dbConnection = Database::getConnection();
    }

    // ── CRUD utilisateurs ─────────────────────────────

    public function findAll(): array
    {
        $query = $this->dbConnection->prepare('SELECT * FROM user');
        $query->execute();
        $result = $query->fetchAll(PDO::FETCH_ASSOC);

        $users = [];
        foreach ($result as $item) {
            $users[] = $this->hydrate($item);
        }

        return $users;
    }

    public function findById(int $id): ?User
    {
        $query = $this->dbConnection->prepare('SELECT * FROM user WHERE id = :id');
        $query->execute(['id' => $id]);
        $item = $query->fetch(PDO::FETCH_ASSOC);

        return $item ? $this->hydrate($item) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $query = $this->dbConnection->prepare('SELECT * FROM user WHERE email = :email');
        $query->execute(['email' => $email]);
        $item = $query->fetch(PDO::FETCH_ASSOC);

        return $item ? $this->hydrate($item) : null;
    }

    public function create(User $user): void
    {
        $query = $this->dbConnection->prepare(
            'INSERT INTO user (email, password, name, pronoun) VALUES (:email, :password, :name, :pronoun)'
        );
        $query->execute([
            'email'    => $user->getEmail(),
            'password' => $user->getPassword(),
            'name'     => $user->getName(),
            'pronoun'  => $user->getPronoun(),
        ]);
    }

    public function update(User $user): void
    {
        $query = $this->dbConnection->prepare(
            'UPDATE user SET email = :email, password = :password, name = :name, pronoun = :pronoun WHERE id = :id'
        );
        $query->execute([
            'id'       => $user->getId(),
            'email'    => $user->getEmail(),
            'password' => $user->getPassword(),
            'name'     => $user->getName(),
            'pronoun'  => $user->getPronoun(),
        ]);
    }

    public function delete(User $user): void
    {
        $query = $this->dbConnection->prepare('DELETE FROM user WHERE id = :id');
        $query->execute(['id' => $user->getId()]);
    }

    // ── Recherche & amitié ────────────────────────────

    public function searchByName(string $term, int $excludeId): array
    {
        $stmt = $this->dbConnection->prepare('
            SELECT
                u.id,
                u.name,
                COALESCE(uf.status, 0) AS friendship_status
            FROM user u
            LEFT JOIN user_friend uf
                ON uf.user_id = ? AND uf.friend_id = u.id
            WHERE u.name LIKE ?
              AND u.id != ?
            ORDER BY u.name
            LIMIT 20
        ');
        $stmt->execute([$excludeId, '%' . $term . '%', $excludeId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addFriend(int $userId, int $friendId): void
    {
        $stmt = $this->dbConnection->prepare(
            'INSERT IGNORE INTO user_friend (user_id, friend_id, status) VALUES (?, ?, 1)'
        );
        $stmt->execute([$userId, $friendId]);
    }

    public function acceptFriend(int $userId, int $friendId): void
    {
        $stmt = $this->dbConnection->prepare(
            'UPDATE user_friend SET status = 2 WHERE user_id = ? AND friend_id = ?'
        );
        $stmt->execute([$friendId, $userId]);

        $stmt = $this->dbConnection->prepare(
            'INSERT IGNORE INTO user_friend (user_id, friend_id, status) VALUES (?, ?, 2)'
        );
        $stmt->execute([$userId, $friendId]);
    }

    public function removeFriend(int $userId, int $friendId): void
    {
        $stmt = $this->dbConnection->prepare(
            'DELETE FROM user_friend
             WHERE (user_id = ? AND friend_id = ?)
                OR (user_id = ? AND friend_id = ?)'
        );
        $stmt->execute([$userId, $friendId, $friendId, $userId]);
    }

    // ── Privé ─────────────────────────────────────────

    private function hydrate(array $item): User
    {
        return new User(
            $item['id'],
            $item['name'],
            $item['pronoun'],
            $item['email'],
            $item['password'],
            $item['photo']    ?? null,
        );
    }
}