<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Mappers;

use App\Domain\Agenda\Entities\Machine;

final class MachineMapper
{
    /**
     * @param array<string, mixed> $row
     */
    public static function toDomain(array $row): Machine
    {
        return new Machine(
            id: (int) $row['id'],
            nom: $row['nom'],
            type: $row['type'],
        );
    }
}
