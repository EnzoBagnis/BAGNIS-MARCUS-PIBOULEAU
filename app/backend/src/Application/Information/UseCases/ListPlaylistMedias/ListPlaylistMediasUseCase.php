<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\ListPlaylistMedias;

use App\Application\Information\DTOs\PlaylistMediaDTO;
use App\Domain\Information\Exceptions\PlaylistNotFoundException;
use App\Domain\Information\Repositories\PlaylistMediaRepositoryInterface;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;

final class ListPlaylistMediasUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $playlists,
        private readonly PlaylistMediaRepositoryInterface $playlistMedias,
    ) {}

    /** @return PlaylistMediaDTO[] */
    public function execute(int $playlistId): array
    {
        if (!$this->playlists->exists($playlistId)) {
            throw PlaylistNotFoundException::withId($playlistId);
        }

        return array_map(
            static fn ($item) => PlaylistMediaDTO::fromItem($playlistId, $item),
            $this->playlistMedias->findByPlaylist($playlistId),
        );
    }
}
