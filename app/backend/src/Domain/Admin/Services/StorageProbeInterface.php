<?php

declare(strict_types=1);

namespace App\Domain\Admin\Services;

/**
 * Sonde de mesure de l'occupation disque. L'implémentation (Infrastructure)
 * connaît les détails techniques (parcours du dossier d'uploads, requête
 * information_schema) ; le domaine ne raisonne qu'en octets.
 */
interface StorageProbeInterface
{
    /** Taille cumulée des fichiers uploadés (médias), en octets. */
    public function uploadsBytes(): int;

    /** Taille cumulée des bases de données du projet, en octets. */
    public function databaseBytes(): int;
}
