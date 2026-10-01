<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Auth;

use App\Application\Auth\DTOs\LoginInput;
use App\Application\Auth\UseCases\Login\LoginUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class AuthController
{
    public function __construct(
        private readonly LoginUseCase $login,
    ) {}

    public function loginAction(): void
    {
        $payload = JsonRequest::body();
        $result  = $this->login->execute(LoginInput::fromArray($payload));
        JsonResponse::send(['data' => $result->toArray()]);
    }
}
