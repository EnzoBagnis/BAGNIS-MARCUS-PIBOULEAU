<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\CreatePlaylist;

use App\Application\Information\DTOs\CreatePlaylistInput;
use App\Application\Information\DTOs\PlaylistDTO;
use App\Domain\Information\Entities\Playlist;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;

final class CreatePlaylistUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $repository,
    ) {}

    public function execute(CreatePlaylistInput $input): PlaylistDTO
    {
        $playlist = Playlist::create(
            nom: $input->nom,
            active: $input->active,
        );

        $persisted = $this->repository->save($playlist);

        return PlaylistDTO::fromEntity($persisted);
    }
}
