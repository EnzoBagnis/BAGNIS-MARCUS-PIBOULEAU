<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Exceptions;

use RuntimeException;

final class ProfesseurNotFoundException extends RuntimeException
{
    public static function withId(int $id): self
    {
        return new self("Aucun professeur trouvé pour l'identifiant {$id}.");
    }
}
