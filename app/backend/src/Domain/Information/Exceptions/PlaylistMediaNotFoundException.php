<?php

declare(strict_types=1);

namespace App\Domain\Information\Exceptions;

use RuntimeException;

final class PlaylistMediaNotFoundException extends RuntimeException
{
    public static function forPair(int $playlistId, int $mediaId): self
    {
        return new self("Aucune association média {$mediaId} dans la playlist {$playlistId}.");
    }
}
