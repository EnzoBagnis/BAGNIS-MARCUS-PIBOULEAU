<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

final class CreateMachineInput
{
    public function __construct(
        public readonly string $nom,
        public readonly string $type,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(array $payload): self
    {
        return new self(
            nom: (string) ($payload['nom'] ?? ''),
            type: (string) ($payload['type'] ?? ''),
        );
    }
}
