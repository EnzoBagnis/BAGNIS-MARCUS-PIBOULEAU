<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

use App\Domain\Agenda\Entities\Machine;

final class MachineDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $nom,
        public readonly string $type,
    ) {}

    public static function fromEntity(Machine $machine): self
    {
        return new self(
            id: $machine->id(),
            nom: $machine->nom(),
            type: $machine->type(),
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id'   => $this->id,
            'nom'  => $this->nom,
            'type' => $this->type,
        ];
    }
}
