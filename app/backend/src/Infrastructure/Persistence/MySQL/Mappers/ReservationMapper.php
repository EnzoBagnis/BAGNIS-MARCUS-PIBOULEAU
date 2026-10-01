<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Mappers;

use App\Domain\Agenda\Entities\Reservation;
use DateTimeImmutable;

final class ReservationMapper
{
    /**
     * @param array<string, mixed> $row
     */
    public static function toDomain(array $row): Reservation
    {
        return new Reservation(
            id: (int) $row['id'],
            debut: new DateTimeImmutable($row['debut']),
            fin: new DateTimeImmutable($row['fin']),
            description: isset($row['description']) ? (string) $row['description'] : null,
            professeurId: (int) $row['professeur_id'],
            classeId: (int) $row['classe_id'],
            machineId: (int) $row['machine_id'],
        );
    }
}
