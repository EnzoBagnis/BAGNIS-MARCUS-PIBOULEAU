<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

final class UpdatePlaylistInput
{
    public function __construct(
        public readonly int $id,
        public readonly ?string $nom,
        public readonly ?bool $active,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(int $id, array $payload): self
    {
        return new self(
            id: $id,
            nom: array_key_exists('nom', $payload) ? (string) $payload['nom'] : null,
            active: array_key_exists('active', $payload) ? (bool) $payload['active'] : null,
        );
    }
}
