<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\ListPlaylists;

use App\Application\Information\DTOs\PlaylistDTO;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;

final class ListPlaylistsUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $repository,
    ) {}

    /** @return PlaylistDTO[] */
    public function execute(?bool $active = null): array
    {
        return array_map(
            static fn ($playlist) => PlaylistDTO::fromEntity($playlist),
            $this->repository->findAll($active),
        );
    }
}
