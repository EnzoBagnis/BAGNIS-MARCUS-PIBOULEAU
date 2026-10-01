<?php

declare(strict_types=1);

namespace App\Domain\Information\Services;

use App\Domain\Information\Exceptions\InvalidUploadException;

/**
 * Abstraction de stockage pour les fichiers uploadés (images, vidéos).
 *
 * L'implémentation concrète (disque local AlwaysData / S3 / R2 / …) vit côté
 * Infrastructure ; le domaine ne sait rien du backend de stockage.
 */
interface FileStorageInterface
{
    /**
     * Stocke un fichier uploadé et retourne son URL publique relative.
     *
     * @param string $tmpPath      Chemin temporaire fourni par PHP (cf. $_FILES['file']['tmp_name'])
     * @param string $originalName Nom original utilisé uniquement pour journaliser
     * @param string $mimeType     Type MIME détecté côté serveur (à ne PAS prendre du client)
     * @param int    $sizeBytes    Taille du fichier en octets
     * @return string URL publique relative (ex. : "/uploads/abc123.mp4")
     * @throws InvalidUploadException Si la taille / le type MIME n'est pas accepté,
     *                                ou si le déplacement échoue.
     */
    public function store(
        string $tmpPath,
        string $originalName,
        string $mimeType,
        int $sizeBytes,
    ): string;

    /**
     * Supprime le fichier correspondant à une URL publique précédemment
     * retournée par store(). Sans effet (et sans erreur) si l'URL ne désigne
     * pas un fichier géré par ce stockage (ressource externe, URL inconnue…)
     * ou si le fichier n'existe plus.
     *
     * @param string $publicUrl URL publique relative (ex. : "/uploads/abc123.mp4")
     */
    public function delete(string $publicUrl): void;
}
