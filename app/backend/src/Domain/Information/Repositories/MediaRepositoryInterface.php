<?php

declare(strict_types=1);

namespace App\Domain\Information\Repositories;

use App\Domain\Information\Entities\Media;

interface MediaRepositoryInterface
{
    public function save(Media $media): Media;

    public function findById(int $id): ?Media;

    /**
     * @return Media[]
     */
    public function findAll(?bool $actif = null): array;

    public function delete(int $id): void;

    public function exists(int $id): bool;
}
