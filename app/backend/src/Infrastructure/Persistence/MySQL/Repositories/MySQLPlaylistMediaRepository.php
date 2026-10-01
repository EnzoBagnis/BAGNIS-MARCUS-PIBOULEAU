<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Repositories;

use App\Domain\Information\Repositories\PlaylistMediaRepositoryInterface;
use App\Domain\Information\ValueObjects\PlaylistItem;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use PDO;

final class MySQLPlaylistMediaRepository implements PlaylistMediaRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $databaseConnection)
    {
        $this->connection = $databaseConnection->getInformationConnection();
    }

    public function findByPlaylist(int $playlistId): array
    {
        $sql = "SELECT media_id, ordre FROM PLAYLIST_MEDIA WHERE playlist_id = :playlist_id ORDER BY ordre ASC";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['playlist_id' => $playlistId]);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = new PlaylistItem(
                mediaId: (int) $row['media_id'],
                ordre: (int) $row['ordre'],
            );
        }

        return $results;
    }

    public function attach(int $playlistId, int $mediaId, int $ordre): void
    {
        $sql = "INSERT INTO PLAYLIST_MEDIA (playlist_id, media_id, ordre)
                VALUES (:playlist_id, :media_id, :ordre)";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'playlist_id' => $playlistId,
            'media_id'    => $mediaId,
            'ordre'       => $ordre,
        ]);
    }

    public function updateOrdre(int $playlistId, int $mediaId, int $ordre): void
    {
        $sql = "UPDATE PLAYLIST_MEDIA SET ordre = :ordre
                WHERE playlist_id = :playlist_id AND media_id = :media_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'ordre'       => $ordre,
            'playlist_id' => $playlistId,
            'media_id'    => $mediaId,
        ]);
    }

    public function detach(int $playlistId, int $mediaId): void
    {
        $sql = "DELETE FROM PLAYLIST_MEDIA WHERE playlist_id = :playlist_id AND media_id = :media_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'playlist_id' => $playlistId,
            'media_id'    => $mediaId,
        ]);
    }

    public function exists(int $playlistId, int $mediaId): bool
    {
        $sql = "SELECT 1 FROM PLAYLIST_MEDIA WHERE playlist_id = :playlist_id AND media_id = :media_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'playlist_id' => $playlistId,
            'media_id'    => $mediaId,
        ]);

        return (bool) $stmt->fetchColumn();
    }
}
