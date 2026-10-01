<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

use App\Domain\Agenda\Entities\Professeur;

final class ProfesseurDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $nom,
        public readonly string $prenom,
    ) {}

    public static function fromEntity(Professeur $professeur): self
    {
        return new self(
            id: $professeur->id(),
            nom: $professeur->nom(),
            prenom: $professeur->prenom(),
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id'     => $this->id,
            'nom'    => $this->nom,
            'prenom' => $this->prenom,
        ];
    }
}
