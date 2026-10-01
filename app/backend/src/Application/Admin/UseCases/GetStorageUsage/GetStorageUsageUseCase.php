<?php

declare(strict_types=1);

namespace App\Application\Admin\UseCases\GetStorageUsage;

use App\Application\Admin\DTOs\StorageUsageDTO;
use App\Domain\Admin\Services\StorageProbeInterface;
use App\Domain\Admin\ValueObjects\StorageUsage;

final class GetStorageUsageUseCase
{
    public function __construct(
        private readonly StorageProbeInterface $probe,
        private readonly int $quotaBytes,
    ) {}

    public function execute(): StorageUsageDTO
    {
        $usage = new StorageUsage(
            quotaBytes: $this->quotaBytes,
            uploadsBytes: $this->probe->uploadsBytes(),
            databaseBytes: $this->probe->databaseBytes(),
        );

        return StorageUsageDTO::fromValueObject($usage);
    }
}
