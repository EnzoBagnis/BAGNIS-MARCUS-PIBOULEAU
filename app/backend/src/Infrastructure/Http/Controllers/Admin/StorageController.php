<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Admin;

use App\Application\Admin\UseCases\GetStorageUsage\GetStorageUsageUseCase;
use App\Shared\Http\JsonResponse;

final class StorageController
{
    public function __construct(
        private readonly GetStorageUsageUseCase $getStorageUsage,
    ) {}

    /**
     * GET /api/admin/storage  (réservé admin)
     *
     * Réponse 200 :
     *   { "data": {
     *       "quota_bytes": 104857600,
     *       "used_bytes": 4233211,
     *       "free_bytes": 100624389,
     *       "percent_used": 4.0,
     *       "breakdown": { "uploads": 4100000, "database": 133211 }
     *   } }
     */
    public function index(): void
    {
        $usage = $this->getStorageUsage->execute();
        JsonResponse::send(['data' => $usage->toArray()]);
    }
}
