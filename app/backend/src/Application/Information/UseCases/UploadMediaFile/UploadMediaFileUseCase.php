<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\UploadMediaFile;

use App\Application\Information\DTOs\UploadFileInput;
use App\Application\Information\DTOs\UploadResultDTO;
use App\Domain\Information\Exceptions\InvalidUploadException;
use App\Domain\Information\Services\FileStorageInterface;

/**
 * Valide une entrée d'upload (état PHP, présence du fichier), détecte le MIME
 * côté serveur (jamais celui du client) et délègue le stockage à l'implémentation
 * de FileStorageInterface.
 */
final class UploadMediaFileUseCase
{
    public function __construct(
        private readonly FileStorageInterface $storage,
    ) {}

    public function execute(UploadFileInput $input): UploadResultDTO
    {
        if ($input->uploadErrorCode !== UPLOAD_ERR_OK) {
            throw InvalidUploadException::uploadError($input->uploadErrorCode);
        }
        if ($input->tmpPath === '' || !is_file($input->tmpPath)) {
            throw InvalidUploadException::failedToStore('fichier temporaire introuvable');
        }

        // On ne fait JAMAIS confiance au champ `type` envoyé par le navigateur :
        // détection serveur via fileinfo.
        $detectedMime = $this->detectMime($input->tmpPath, $input->mimeTypeFromClient);

        $url = $this->storage->store(
            tmpPath: $input->tmpPath,
            originalName: $input->originalName,
            mimeType: $detectedMime,
            sizeBytes: $input->sizeBytes,
        );

        return new UploadResultDTO(
            url: $url,
            mimeType: $detectedMime,
            sizeBytes: $input->sizeBytes,
        );
    }

    private function detectMime(string $tmpPath, string $fallback): string
    {
        if (function_exists('mime_content_type')) {
            $mime = @mime_content_type($tmpPath);
            if (is_string($mime) && $mime !== '') {
                return $mime;
            }
        }
        if (class_exists(\finfo::class)) {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mime = @$finfo->file($tmpPath);
            if (is_string($mime) && $mime !== '') {
                return $mime;
            }
        }
        // Si l'extension fileinfo n'est pas dispo (rare), on retombe sur le client
        // mais l'implémentation de stockage refusera tout MIME non whitelisté.
        return $fallback;
    }
}
