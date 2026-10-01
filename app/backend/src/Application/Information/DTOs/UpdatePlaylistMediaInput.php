<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

use InvalidArgumentException;

final class UpdatePlaylistMediaInput
{
    public function __construct(
        public readonly int $playlistId,
        public readonly int $mediaId,
        public readonly int $ordre,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(int $playlistId, int $mediaId, array $payload): self
    {
        if (!array_key_exists('ordre', $payload) || $payload['ordre'] === '' || $payload['ordre'] === null) {
            throw new InvalidArgumentException("Le champ 'ordre' est obligatoire.");
        }

        return new self(
            playlistId: $playlistId,
            mediaId: $mediaId,
            ordre: (int) $payload['ordre'],
        );
    }
}
