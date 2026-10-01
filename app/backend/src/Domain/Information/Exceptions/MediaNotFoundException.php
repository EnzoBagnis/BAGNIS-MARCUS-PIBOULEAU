<?php

declare(strict_types=1);

namespace App\Domain\Information\Exceptions;

use RuntimeException;

final class MediaNotFoundException extends RuntimeException
{
    public static function withId(int $id): self
    {
        return new self("Aucun média trouvé pour l'identifiant {$id}.");
    }
}
