<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

final class ActivePlaylistMediaDTO
{
    public function __construct(
        public readonly MediaDTO $media,
        public readonly int $ordre,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return array_merge($this->media->toArray(), [
            'ordre' => $this->ordre,
        ]);
    }
}
