<?php

declare(strict_types=1);

namespace App\Domain\Information\ValueObjects;

use InvalidArgumentException;

final class PlaylistItem
{
    public function __construct(
        public readonly int $mediaId,
        public readonly int $ordre,
    ) {
        if ($mediaId <= 0) {
            throw new InvalidArgumentException("L'identifiant du média doit être un entier strictement positif.");
        }
        if ($ordre <= 0) {
            throw new InvalidArgumentException("L'ordre doit être un entier strictement positif.");
        }
    }
}
