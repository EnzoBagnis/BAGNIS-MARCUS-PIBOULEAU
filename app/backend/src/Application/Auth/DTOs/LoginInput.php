<?php

declare(strict_types=1);

namespace App\Application\Auth\DTOs;

final class LoginInput
{
    public function __construct(
        public readonly string $cle,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(array $payload): self
    {
        return new self(
            cle: (string) ($payload['cle'] ?? ''),
        );
    }
}
