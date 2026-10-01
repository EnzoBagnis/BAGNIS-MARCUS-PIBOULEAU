<?php

declare(strict_types=1);

namespace App\Domain\Auth\ValueObjects;

use InvalidArgumentException;

enum Role: string
{
    case Admin = 'admin';
    case Prof  = 'prof';

    public static function fromString(string $value): self
    {
        return match ($value) {
            self::Admin->value => self::Admin,
            self::Prof->value  => self::Prof,
            default => throw new InvalidArgumentException(sprintf("Rôle inconnu : '%s'.", $value)),
        };
    }
}
