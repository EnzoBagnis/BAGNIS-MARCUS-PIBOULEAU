<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\DeletePlaylist;

use App\Domain\Information\Exceptions\PlaylistNotFoundException;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;

final class DeletePlaylistUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        if (!$this->repository->exists($id)) {
            throw PlaylistNotFoundException::withId($id);
        }

        $this->repository->delete($id);
    }
}
