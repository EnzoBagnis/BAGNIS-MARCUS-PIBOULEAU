<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Repositories;

use App\Domain\Information\Entities\Playlist;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Mappers\PlaylistMapper;
use PDO;

final class MySQLPlaylistRepository implements PlaylistRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $databaseConnection)
    {
        $this->connection = $databaseConnection->getInformationConnection();
    }

    public function save(Playlist $playlist): Playlist
    {
        if ($playlist->id() === null) {
            return $this->insert($playlist);
        }

        return $this->update($playlist);
    }

    private function insert(Playlist $playlist): Playlist
    {
        $sql = "INSERT INTO PLAYLIST (nom, active) VALUES (:nom, :active)";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom'    => $playlist->nom(),
            'active' => $playlist->active() ? 1 : 0,
        ]);

        $id = (int) $this->connection->lastInsertId();
        $playlist->attachId($id);

        return $playlist;
    }

    private function update(Playlist $playlist): Playlist
    {
        $sql = "UPDATE PLAYLIST SET nom = :nom, active = :active WHERE id = :id";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom'    => $playlist->nom(),
            'active' => $playlist->active() ? 1 : 0,
            'id'     => $playlist->id(),
        ]);

        return $playlist;
    }

    public function findById(int $id): ?Playlist
    {
        $sql = "SELECT * FROM PLAYLIST WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }

        return PlaylistMapper::toDomain($row);
    }

    public function findActive(): ?Playlist
    {
        $sql = "SELECT * FROM PLAYLIST WHERE active = 1 LIMIT 1";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }

        return PlaylistMapper::toDomain($row);
    }

    public function findAllActive(): array
    {
        $sql = "SELECT * FROM PLAYLIST WHERE active = 1 ORDER BY id ASC";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = PlaylistMapper::toDomain($row);
        }

        return $results;
    }

    public function findAll(?bool $active = null): array
    {
        $sql = "SELECT * FROM PLAYLIST";
        $params = [];

        if ($active !== null) {
            $sql .= " WHERE active = :active";
            $params['active'] = $active ? 1 : 0;
        }

        $sql .= " ORDER BY id DESC";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = PlaylistMapper::toDomain($row);
        }

        return $results;
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM PLAYLIST WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);
    }

    public function exists(int $id): bool
    {
        $sql = "SELECT 1 FROM PLAYLIST WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        return (bool) $stmt->fetchColumn();
    }
}
