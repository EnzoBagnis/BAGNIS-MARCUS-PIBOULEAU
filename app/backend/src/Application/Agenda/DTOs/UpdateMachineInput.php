<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

final class UpdateMachineInput
{
    public function __construct(
        public readonly int $id,
        public readonly string $nom,
        public readonly string $type,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(int $id, array $payload): self
    {
        return new self(
            id: $id,
            nom: (string) ($payload['nom'] ?? ''),
            type: (string) ($payload['type'] ?? ''),
        );
    }
}
