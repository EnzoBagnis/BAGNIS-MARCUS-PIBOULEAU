<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

final class CreateReservationInput
{
    public function __construct(
        public readonly string $debut,
        public readonly string $fin,
        public readonly ?string $description,
        public readonly int $professeurId,
        public readonly int $classeId,
        public readonly int $machineId,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(array $payload): self
    {
        $description = null;
        if (array_key_exists('description', $payload) && $payload['description'] !== null) {
            $description = (string) $payload['description'];
        }

        return new self(
            debut: (string) ($payload['debut'] ?? ''),
            fin: (string) ($payload['fin'] ?? ''),
            description: $description,
            professeurId: (int) ($payload['professeur_id'] ?? 0),
            classeId: (int) ($payload['classe_id'] ?? 0),
            machineId: (int) ($payload['machine_id'] ?? 0),
        );
    }
}
