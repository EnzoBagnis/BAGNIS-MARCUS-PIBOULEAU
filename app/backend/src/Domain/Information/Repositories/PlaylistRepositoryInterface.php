<?php

declare(strict_types=1);

namespace App\Domain\Information\Repositories;

use App\Domain\Information\Entities\Playlist;

interface PlaylistRepositoryInterface
{
    public function save(Playlist $playlist): Playlist;

    public function findById(int $id): ?Playlist;

    public function findActive(): ?Playlist;

    /**
     * @return Playlist[]
     */
    public function findAllActive(): array;

    /**
     * @return Playlist[]
     */
    public function findAll(?bool $active = null): array;

    public function delete(int $id): void;

    public function exists(int $id): bool;
}
