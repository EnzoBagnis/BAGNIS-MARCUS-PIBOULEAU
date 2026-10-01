<?php

declare(strict_types=1);

namespace App\Shared\Config;

use RuntimeException;

/**
 * Charge un fichier .env et injecte les variables dans $_ENV et getenv().
 *
 * Ne surcharge pas les variables déjà définies par le système
 * (ce qui permet de configurer via l'environnement réel en production).
 */
final class EnvLoader
{
    /**
     * Charge un fichier .env.
     *
     * @throws RuntimeException si le fichier est introuvable
     */
    public static function load(string $path): void
    {
        if (!is_file($path)) {
            throw new RuntimeException(
                "Fichier d'environnement introuvable : {$path}"
            );
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            throw new RuntimeException(
                "Impossible de lire le fichier : {$path}"
            );
        }

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (!str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key   = trim($key);
            $value = trim($value);

            if (array_key_exists($key, $_ENV)) {
                continue;
            }

            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }
    }

    /**
     * Récupère une variable d'environnement.
     *
     * @throws RuntimeException si la variable est requise mais absente
     */
    public static function get(string $key, ?string $default = null): string
    {
        $value = $_ENV[$key] ?? getenv($key) ?: null;

        if ($value !== null && $value !== false) {
            return (string) $value;
        }

        if ($default !== null) {
            return $default;
        }

        throw new RuntimeException(
            "Variable d'environnement requise non définie : {$key}"
        );
    }
}
