<?php

declare(strict_types=1);

namespace App\Application\Admin\DTOs;

use App\Domain\Admin\ValueObjects\StorageUsage;

final class StorageUsageDTO
{
    public function __construct(
        public readonly int $quotaBytes,
        public readonly int $usedBytes,
        public readonly int $freeBytes,
        public readonly float $percentUsed,
        public readonly int $uploadsBytes,
        public readonly int $databaseBytes,
    ) {}

    public static function fromValueObject(StorageUsage $usage): self
    {
        return new self(
            quotaBytes: $usage->quotaBytes(),
            usedBytes: $usage->usedBytes(),
            freeBytes: $usage->freeBytes(),
            percentUsed: $usage->percentUsed(),
            uploadsBytes: $usage->uploadsBytes(),
            databaseBytes: $usage->databaseBytes(),
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'quota_bytes'   => $this->quotaBytes,
            'used_bytes'    => $this->usedBytes,
            'free_bytes'    => $this->freeBytes,
            'percent_used'  => $this->percentUsed,
            'breakdown'     => [
                'uploads'  => $this->uploadsBytes,
                'database' => $this->databaseBytes,
            ],
        ];
    }
}
