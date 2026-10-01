<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

final class ActivePlaylistDTO
{
    /**
     * @param ActivePlaylistMediaDTO[] $medias
     */
    public function __construct(
        public readonly int $id,
        public readonly string $nom,
        public readonly bool $active,
        public readonly array $medias,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id'     => $this->id,
            'nom'    => $this->nom,
            'active' => $this->active,
            'medias' => array_map(static fn (ActivePlaylistMediaDTO $m) => $m->toArray(), $this->medias),
        ];
    }
}
