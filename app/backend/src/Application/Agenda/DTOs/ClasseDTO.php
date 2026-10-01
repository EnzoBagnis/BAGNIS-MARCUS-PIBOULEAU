<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

use App\Domain\Agenda\Entities\Classe;

final class ClasseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $nom,
    ) {}

    public static function fromEntity(Classe $classe): self
    {
        return new self(
            id: $classe->id(),
            nom: $classe->nom(),
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id'  => $this->id,
            'nom' => $this->nom,
        ];
    }
}
