<?php

declare(strict_types=1);

namespace App\Shared\Http\Middleware;

interface MiddlewareInterface
{
    /**
     * Handle the incoming request.
     *
     * @return bool True si la requête peut continuer, false si elle est bloquée (la réponse est déjà envoyée).
     */
    public function handle(): bool;
}
