<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

final class UpdateClasseInput
{
    public function __construct(
        public readonly int $id,
        public readonly string $nom,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(int $id, array $payload): self
    {
        return new self(
            id: $id,
            nom: (string) ($payload['nom'] ?? ''),
        );
    }
}
