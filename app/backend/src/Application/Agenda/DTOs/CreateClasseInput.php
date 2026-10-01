<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

final class CreateClasseInput
{
    public function __construct(
        public readonly string $nom,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(array $payload): self
    {
        return new self(
            nom: (string) ($payload['nom'] ?? ''),
        );
    }
}
