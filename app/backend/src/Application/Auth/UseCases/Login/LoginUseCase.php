<?php

declare(strict_types=1);

namespace App\Application\Auth\UseCases\Login;

use App\Application\Auth\DTOs\LoginInput;
use App\Application\Auth\DTOs\LoginResult;
use App\Domain\Auth\Exceptions\InvalidCredentialsException;
use App\Domain\Auth\ValueObjects\Role;
use InvalidArgumentException;

final class LoginUseCase
{
    public function __construct(
        private readonly string $adminKey,
        private readonly string $profKey,
    ) {}

    public function execute(LoginInput $input): LoginResult
    {
        $submitted = trim($input->cle);
        if ($submitted === '') {
            throw new InvalidArgumentException("Le champ 'cle' est obligatoire.");
        }

        // hash_equals : comparaison en temps constant pour éviter les attaques par timing.
        if ($this->adminKey !== '' && hash_equals($this->adminKey, $submitted)) {
            return new LoginResult(Role::Admin);
        }
        if ($this->profKey !== '' && hash_equals($this->profKey, $submitted)) {
            return new LoginResult(Role::Prof);
        }

        throw InvalidCredentialsException::unknownKey();
    }
}
