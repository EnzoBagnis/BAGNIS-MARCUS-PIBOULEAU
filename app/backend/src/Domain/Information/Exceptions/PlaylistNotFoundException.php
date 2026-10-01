<?php

declare(strict_types=1);

namespace App\Domain\Information\Exceptions;

use RuntimeException;

final class PlaylistNotFoundException extends RuntimeException
{
    public static function withId(int $id): self
    {
        return new self("Aucune playlist trouvée pour l'identifiant {$id}.");
    }
}
