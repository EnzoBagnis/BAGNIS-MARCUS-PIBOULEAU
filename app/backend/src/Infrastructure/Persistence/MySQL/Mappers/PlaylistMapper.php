<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Mappers;

use App\Domain\Information\Entities\Playlist;

final class PlaylistMapper
{
    /**
     * @param array<string, mixed> $row
     */
    public static function toDomain(array $row): Playlist
    {
        return new Playlist(
            id: (int) $row['id'],
            nom: $row['nom'],
            active: (bool) $row['active'],
        );
    }
}
