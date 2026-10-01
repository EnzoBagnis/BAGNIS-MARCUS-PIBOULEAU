<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

final class UploadResultDTO
{
    public function __construct(
        public readonly string $url,
        public readonly string $mimeType,
        public readonly int $sizeBytes,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'url'        => $this->url,
            'mime_type'  => $this->mimeType,
            'size_bytes' => $this->sizeBytes,
        ];
    }
}
