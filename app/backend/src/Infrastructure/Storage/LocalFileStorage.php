<?php

declare(strict_types=1);

namespace App\Infrastructure\Storage;

use App\Domain\Information\Exceptions\InvalidUploadException;
use App\Domain\Information\Services\FileStorageInterface;

/**
 * Stocke les fichiers uploadés sur le disque local du serveur (= cas AlwaysData
 * en production). Le dossier de destination doit être servi en statique par
 * Apache (typiquement `app/backend/public/uploads/`).
 *
 * Sécurité :
 *  - taille max bornée
 *  - whitelist stricte MIME → extension
 *  - nom de fichier régénéré aléatoirement (jamais le nom client)
 *  - l'exécution PHP doit être désactivée dans le dossier de destination
 *    via un .htaccess (cf. `app/backend/public/uploads/.htaccess`).
 */
final class LocalFileStorage implements FileStorageInterface
{
    /** Whitelist MIME → extension finale du fichier stocké. */
    private const ALLOWED_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
        'video/mp4'  => 'mp4',
    ];

    /** Plafond par fichier (10 Mo) — alignable avec php.ini si nécessaire. */
    private const MAX_BYTES = 10 * 1024 * 1024;

    public function __construct(
        private readonly string $storageDir,
        private readonly string $publicPrefix,
    ) {
        if (!is_dir($this->storageDir)) {
            if (!@mkdir($this->storageDir, 0755, true) && !is_dir($this->storageDir)) {
                throw new \RuntimeException(
                    "Impossible de créer le dossier d'uploads : {$this->storageDir}"
                );
            }
        }
        if (!is_writable($this->storageDir)) {
            throw new \RuntimeException(
                "Le dossier d'uploads n'est pas accessible en écriture : {$this->storageDir}"
            );
        }
    }

    public function store(
        string $tmpPath,
        string $originalName,
        string $mimeType,
        int $sizeBytes,
    ): string {
        if ($sizeBytes <= 0) {
            throw InvalidUploadException::failedToStore('fichier vide');
        }
        if ($sizeBytes > self::MAX_BYTES) {
            throw InvalidUploadException::tooLarge($sizeBytes, self::MAX_BYTES);
        }
        if (!isset(self::ALLOWED_MIMES[$mimeType])) {
            throw InvalidUploadException::unsupportedMime($mimeType, array_keys(self::ALLOWED_MIMES));
        }

        $extension = self::ALLOWED_MIMES[$mimeType];
        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        $destination = rtrim($this->storageDir, '/\\') . DIRECTORY_SEPARATOR . $filename;

        // move_uploaded_file ne fonctionne que pour les vrais uploads HTTP.
        // En tests on retombe sur rename().
        $moved = is_uploaded_file($tmpPath)
            ? @move_uploaded_file($tmpPath, $destination)
            : @rename($tmpPath, $destination);

        if (!$moved) {
            throw InvalidUploadException::failedToStore('échec de l\'écriture sur disque');
        }

        @chmod($destination, 0644);

        return rtrim($this->publicPrefix, '/') . '/' . $filename;
    }

    public function delete(string $publicUrl): void
    {
        $prefix = rtrim($this->publicPrefix, '/') . '/';

        // On ne touche qu'aux fichiers que NOUS avons stockés : une URL externe
        // (http(s)://…) ou un préfixe inconnu est ignorée silencieusement.
        if (!str_starts_with($publicUrl, $prefix)) {
            return;
        }

        // basename() neutralise toute tentative de remontée de chemin (../).
        $filename = basename($publicUrl);
        if ($filename === '' || $filename === '.' || $filename === '..') {
            return;
        }

        $path = rtrim($this->storageDir, '/\\') . DIRECTORY_SEPARATOR . $filename;
        if (is_file($path)) {
            @unlink($path);
        }
    }
}
