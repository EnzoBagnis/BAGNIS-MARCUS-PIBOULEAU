<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Mappers;

use App\Domain\Agenda\Entities\Professeur;

final class ProfesseurMapper
{
    /**
     * @param array<string, mixed> $row
     */
    public static function toDomain(array $row): Professeur
    {
        return new Professeur(
            id: (int) $row['id'],
            nom: $row['nom'],
            prenom: $row['prenom'],
        );
    }
}
