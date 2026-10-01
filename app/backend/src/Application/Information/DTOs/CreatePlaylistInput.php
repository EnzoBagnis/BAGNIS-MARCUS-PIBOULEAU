<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

final class CreatePlaylistInput
{
    public function __construct(
        public readonly string $nom,
        public readonly bool $active = false,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(array $payload): self
    {
        return new self(
            nom: (string) ($payload['nom'] ?? ''),
            active: (bool) ($payload['active'] ?? false),
        );
    }
}
