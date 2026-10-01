<?php

declare(strict_types=1);

namespace App\Domain\Admin\ValueObjects;

use InvalidArgumentException;

/**
 * Occupation disque d'un compte (cas AlwaysData en production).
 *
 * Le quota n'est pas exposé par l'API d'AlwaysData : c'est une constante de
 * configuration (offre souscrite). On mesure de notre côté ce qui grossit
 * réellement — fichiers uploadés + bases — et on en déduit l'espace restant.
 */
final class StorageUsage
{
    public function __construct(
        private readonly int $quotaBytes,
        private readonly int $uploadsBytes,
        private readonly int $databaseBytes,
    ) {
        $this->guardNonNegative('quotaBytes', $quotaBytes);
        $this->guardNonNegative('uploadsBytes', $uploadsBytes);
        $this->guardNonNegative('databaseBytes', $databaseBytes);
    }

    public function quotaBytes(): int { return $this->quotaBytes; }
    public function uploadsBytes(): int { return $this->uploadsBytes; }
    public function databaseBytes(): int { return $this->databaseBytes; }

    public function usedBytes(): int
    {
        return $this->uploadsBytes + $this->databaseBytes;
    }

    /** Jamais négatif, même si l'occupation dépasse le quota configuré. */
    public function freeBytes(): int
    {
        return max(0, $this->quotaBytes - $this->usedBytes());
    }

    /** Pourcentage d'occupation, borné à 100, arrondi au dixième. */
    public function percentUsed(): float
    {
        if ($this->quotaBytes <= 0) {
            return 0.0;
        }
        return min(100.0, round($this->usedBytes() / $this->quotaBytes * 100, 1));
    }

    private function guardNonNegative(string $field, int $value): void
    {
        if ($value < 0) {
            throw new InvalidArgumentException("La valeur '{$field}' ne peut pas être négative.");
        }
    }
}
