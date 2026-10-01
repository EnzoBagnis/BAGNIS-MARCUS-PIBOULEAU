<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\GetPlaylistById;

use App\Application\Information\DTOs\PlaylistDTO;
use App\Domain\Information\Exceptions\PlaylistNotFoundException;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;

final class GetPlaylistByIdUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $repository,
    ) {}

    public function execute(int $id): PlaylistDTO
    {
        $playlist = $this->repository->findById($id)
            ?? throw PlaylistNotFoundException::withId($id);

        return PlaylistDTO::fromEntity($playlist);
    }
}
