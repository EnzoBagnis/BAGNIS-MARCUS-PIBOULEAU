<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

final class UpdateReservationInput
{
    public function __construct(
        public readonly int $id,
        public readonly ?string $debut,
        public readonly ?string $fin,
        public readonly ?string $description,
        public readonly ?int $professeurId,
        public readonly ?int $classeId,
        public readonly ?int $machineId,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(int $id, array $payload): self
    {
        return new self(
            id: $id,
            debut: array_key_exists('debut', $payload) ? (string) $payload['debut'] : null,
            fin: array_key_exists('fin', $payload) ? (string) $payload['fin'] : null,
            description: array_key_exists('description', $payload) ? (string) $payload['description'] : null,
            professeurId: array_key_exists('professeur_id', $payload)
                ? ($payload['professeur_id'] === null || $payload['professeur_id'] === '' ? null : (int) $payload['professeur_id'])
                : null,
            classeId: array_key_exists('classe_id', $payload)
                ? ($payload['classe_id'] === null || $payload['classe_id'] === '' ? null : (int) $payload['classe_id'])
                : null,
            machineId: array_key_exists('machine_id', $payload)
                ? ($payload['machine_id'] === null || $payload['machine_id'] === '' ? null : (int) $payload['machine_id'])
                : null,
        );
    }
}
