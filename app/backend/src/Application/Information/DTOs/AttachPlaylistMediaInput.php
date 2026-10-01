<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

use InvalidArgumentException;

final class AttachPlaylistMediaInput
{
    public function __construct(
        public readonly int $playlistId,
        public readonly int $mediaId,
        public readonly int $ordre,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(int $playlistId, array $payload): self
    {
        if (!isset($payload['media_id']) || $payload['media_id'] === '') {
            throw new InvalidArgumentException("Le champ 'media_id' est obligatoire.");
        }
        if (!isset($payload['ordre']) || $payload['ordre'] === '') {
            throw new InvalidArgumentException("Le champ 'ordre' est obligatoire.");
        }

        return new self(
            playlistId: $playlistId,
            mediaId: (int) $payload['media_id'],
            ordre: (int) $payload['ordre'],
        );
    }
}
