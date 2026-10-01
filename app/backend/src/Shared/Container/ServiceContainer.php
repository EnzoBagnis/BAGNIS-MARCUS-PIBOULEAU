<?php

declare(strict_types=1);

namespace App\Shared\Container;

use Closure;
use RuntimeException;

/**
 * Conteneur d'injection de dépendances minimal et générique.
 *
 * Aucune dépendance projet : peut être réutilisé tel quel sur un autre projet.
 * Pour l'enrichir avec des services métier, étendre cette classe et appeler
 * `set()` dans une méthode `registerDefaults()` invoquée par le constructeur.
 */
class ServiceContainer
{
    /** @var array<string, Closure> */
    private array $factories = [];

    /** @var array<string, object> */
    private array $instances = [];

    public function set(string $id, Closure $factory): void
    {
        $this->factories[$id] = $factory;
        unset($this->instances[$id]);
    }

    public function has(string $id): bool
    {
        return isset($this->factories[$id]);
    }

    public function get(string $id): object
    {
        if (isset($this->instances[$id])) {
            return $this->instances[$id];
        }

        if (!isset($this->factories[$id])) {
            throw new RuntimeException("Service non enregistré : {$id}");
        }

        return $this->instances[$id] = ($this->factories[$id])($this);
    }
}
