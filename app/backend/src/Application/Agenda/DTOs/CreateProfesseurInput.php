<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

final class CreateProfesseurInput
{
    public function __construct(
        public readonly string $nom,
        public readonly string $prenom,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(array $payload): self
    {
        return new self(
            nom: (string) ($payload['nom'] ?? ''),
            prenom: (string) ($payload['prenom'] ?? ''),
        );
    }
}
