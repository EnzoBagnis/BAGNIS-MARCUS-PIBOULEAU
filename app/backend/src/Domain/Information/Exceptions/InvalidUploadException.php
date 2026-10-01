<?php

declare(strict_types=1);

namespace App\Domain\Information\Exceptions;

use InvalidArgumentException;

/**
 * Levée par la couche application lorsqu'un upload de fichier est rejeté
 * (taille, type MIME, échec de stockage…). Hérite de InvalidArgumentException
 * afin d'être convertie automatiquement en 422 par le mapping d'exceptions
 * de `public/index.php`.
 */
final class InvalidUploadException extends InvalidArgumentException
{
    public static function tooLarge(int $sizeBytes, int $maxBytes): self
    {
        return new self(sprintf(
            'Fichier trop volumineux (%s, max autorisé %s).',
            self::humanize($sizeBytes),
            self::humanize($maxBytes),
        ));
    }

    public static function unsupportedMime(string $mime, array $allowed): self
    {
        return new self(sprintf(
            "Type de fichier non supporté : '%s'. Autorisés : %s.",
            $mime,
            implode(', ', $allowed),
        ));
    }

    public static function uploadError(int $errorCode): self
    {
        $message = match ($errorCode) {
            UPLOAD_ERR_INI_SIZE   => 'Fichier trop volumineux (limite php.ini).',
            UPLOAD_ERR_FORM_SIZE  => 'Fichier trop volumineux (limite formulaire).',
            UPLOAD_ERR_PARTIAL    => 'Upload interrompu, fichier incomplet.',
            UPLOAD_ERR_NO_FILE    => 'Aucun fichier reçu.',
            UPLOAD_ERR_NO_TMP_DIR => "Le serveur n'a pas pu écrire le fichier temporaire.",
            UPLOAD_ERR_CANT_WRITE => "Le serveur n'a pas pu écrire le fichier sur le disque.",
            UPLOAD_ERR_EXTENSION  => "L'upload a été interrompu par une extension PHP.",
            default               => sprintf("Erreur d'upload (code %d).", $errorCode),
        };
        return new self($message);
    }

    public static function failedToStore(string $reason): self
    {
        return new self('Impossible de stocker le fichier : ' . $reason);
    }

    private static function humanize(int $bytes): string
    {
        if ($bytes >= 1024 * 1024) {
            return sprintf('%.1f Mo', $bytes / (1024 * 1024));
        }
        if ($bytes >= 1024) {
            return sprintf('%.1f Ko', $bytes / 1024);
        }
        return $bytes . ' o';
    }
}
