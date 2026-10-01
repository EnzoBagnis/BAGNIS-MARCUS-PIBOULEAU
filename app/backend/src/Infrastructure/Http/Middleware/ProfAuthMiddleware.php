<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Middleware;

use App\Shared\Http\JsonResponse;
use App\Shared\Http\Middleware\MiddlewareInterface;

final class ProfAuthMiddleware implements MiddlewareInterface
{
    public function handle(): bool
    {
        $headers = function_exists('getallheaders') ? getallheaders() : $this->getHeadersAlternative();
        
        // Certains serveurs capitalisent différemment, on normalise en minuscules pour la recherche
        $headersLower = array_change_key_case($headers, CASE_LOWER);
        
        $authHeader = $headersLower['authorization'] ?? '';
        
        $expectedKey = $_ENV['PROF_API_KEY'] ?? '';

        if (empty($expectedKey)) {
            // Configuration du serveur invalide
            JsonResponse::error('Erreur interne du serveur (Clé Prof manquante).', 500, 'SERVER_CONFIG_ERROR');
            return false;
        }

        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            if ($token === $expectedKey) {
                return true;
            }
        }

        JsonResponse::error('Accès non autorisé. Clé Prof invalide ou manquante.', 401, 'UNAUTHORIZED');
        return false;
    }

    /**
     * @return array<string, string>
     */
    private function getHeadersAlternative(): array
    {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (strpos($name, 'HTTP_') === 0) {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['Content-Type'] = $_SERVER['CONTENT_TYPE'];
        }
        if (isset($_SERVER['CONTENT_LENGTH'])) {
            $headers['Content-Length'] = $_SERVER['CONTENT_LENGTH'];
        }
        return $headers;
    }
}
