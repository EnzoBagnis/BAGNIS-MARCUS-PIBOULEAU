<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\UpdatePlaylist;

use App\Application\Information\DTOs\PlaylistDTO;
use App\Application\Information\DTOs\UpdatePlaylistInput;
use App\Domain\Information\Exceptions\PlaylistNotFoundException;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;

final class UpdatePlaylistUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $repository,
    ) {}

    public function execute(UpdatePlaylistInput $input): PlaylistDTO
    {
        $playlist = $this->repository->findById($input->id)
            ?? throw PlaylistNotFoundException::withId($input->id);

        if ($input->nom !== null) {
            $playlist->renommer($input->nom);
        }

        if ($input->active !== null) {
            $input->active ? $playlist->activer() : $playlist->desactiver();
        }

        $updated = $this->repository->save($playlist);

        return PlaylistDTO::fromEntity($updated);
    }
}
