<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

use App\Domain\Information\Entities\Playlist;

final class PlaylistDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $nom,
        public readonly bool $active,
    ) {}

    public static function fromEntity(Playlist $playlist): self
    {
        $id = $playlist->id();
        if ($id === null) {
            throw new \LogicException("Impossible de créer un DTO depuis une playlist non persistée.");
        }

        return new self(
            id: $id,
            nom: $playlist->nom(),
            active: $playlist->active(),
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id'     => $this->id,
            'nom'    => $this->nom,
            'active' => $this->active,
        ];
    }
}
