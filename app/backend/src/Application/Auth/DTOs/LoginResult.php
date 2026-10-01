<?php

declare(strict_types=1);

namespace App\Application\Auth\DTOs;

use App\Domain\Auth\ValueObjects\Role;

final class LoginResult
{
    public function __construct(
        public readonly Role $role,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'role' => $this->role->value,
        ];
    }
}
