<?php

declare(strict_types=1);

namespace App\Domain\Auth\Exceptions;

use RuntimeException;

final class InvalidCredentialsException extends RuntimeException
{
    public static function unknownKey(): self
    {
        return new self("Clé d'accès invalide.");
    }
}
