<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

use App\Domain\Information\ValueObjects\PlaylistItem;

final class PlaylistMediaDTO
{
    public function __construct(
        public readonly int $playlistId,
        public readonly int $mediaId,
        public readonly int $ordre,
    ) {}

    public static function fromItem(int $playlistId, PlaylistItem $item): self
    {
        return new self(
            playlistId: $playlistId,
            mediaId: $item->mediaId,
            ordre: $item->ordre,
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'playlist_id' => $this->playlistId,
            'media_id'    => $this->mediaId,
            'ordre'       => $this->ordre,
        ];
    }
}
