<?php

declare(strict_types=1);

namespace App\Domain\Information\ValueObjects;

use InvalidArgumentException;

enum MediaType: string
{
    case Image = 'image';
    case Video = 'video';
    case Texte = 'texte';

    public static function fromString(string $value): self
    {
        return self::tryFrom($value)
            ?? throw new InvalidArgumentException("Type de média invalide : {$value}");
    }
}
