<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

/**
 * Adapte une entrée `$_FILES['xxx']` (multipart/form-data) en DTO immuable
 * pour l'isoler de la superglobale au niveau application.
 */
final class UploadFileInput
{
    public function __construct(
        public readonly string $tmpPath,
        public readonly string $originalName,
        public readonly string $mimeTypeFromClient,
        public readonly int $sizeBytes,
        public readonly int $uploadErrorCode,
    ) {}

    /** @param array<string, mixed> $file Une entrée de $_FILES */
    public static function fromUploadedFile(array $file): self
    {
        return new self(
            tmpPath: (string) ($file['tmp_name'] ?? ''),
            originalName: (string) ($file['name'] ?? ''),
            mimeTypeFromClient: (string) ($file['type'] ?? ''),
            sizeBytes: (int) ($file['size'] ?? 0),
            uploadErrorCode: (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE),
        );
    }
}
