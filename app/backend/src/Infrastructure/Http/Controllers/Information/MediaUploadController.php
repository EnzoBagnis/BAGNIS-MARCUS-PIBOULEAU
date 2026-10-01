<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Information;

use App\Application\Information\DTOs\UploadFileInput;
use App\Application\Information\UseCases\UploadMediaFile\UploadMediaFileUseCase;
use App\Shared\Http\JsonResponse;

final class MediaUploadController
{
    public function __construct(
        private readonly UploadMediaFileUseCase $uploadMediaFile,
    ) {}

    /**
     * POST /api/medias/upload
     *
     * Reçoit un fichier en `multipart/form-data` (champ `file`) et retourne
     * l'URL publique à utiliser ensuite dans `POST /api/medias`.
     *
     * Réponse 201 :
     *   { "data": { "url": "/uploads/abc.mp4", "mime_type": "video/mp4", "size_bytes": 12345 } }
     */
    public function upload(): void
    {
        if (!isset($_FILES['file'])) {
            JsonResponse::error(
                "Le champ 'file' (multipart/form-data) est requis.",
                422,
                'MISSING_FILE',
            );
            return;
        }

        $input  = UploadFileInput::fromUploadedFile($_FILES['file']);
        $result = $this->uploadMediaFile->execute($input);

        JsonResponse::send(['data' => $result->toArray()], 201);
    }
}
