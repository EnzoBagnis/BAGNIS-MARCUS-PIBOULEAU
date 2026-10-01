<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Mappers;

use App\Domain\Agenda\Entities\Classe;

final class ClasseMapper
{
    /**
     * @param array<string, mixed> $row
     */
    public static function toDomain(array $row): Classe
    {
        return new Classe(
            id: (int) $row['id'],
            nom: $row['nom'],
        );
    }
}
