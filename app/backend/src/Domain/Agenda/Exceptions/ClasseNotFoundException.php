<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Exceptions;

use RuntimeException;

final class ClasseNotFoundException extends RuntimeException
{
    public static function withId(int $id): self
    {
        return new self("Aucune classe trouvée pour l'identifiant {$id}.");
    }
}
