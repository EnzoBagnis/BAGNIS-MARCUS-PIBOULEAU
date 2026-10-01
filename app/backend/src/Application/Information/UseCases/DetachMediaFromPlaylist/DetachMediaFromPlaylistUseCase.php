<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\DetachMediaFromPlaylist;

use App\Domain\Information\Exceptions\PlaylistMediaNotFoundException;
use App\Domain\Information\Repositories\PlaylistMediaRepositoryInterface;

final class DetachMediaFromPlaylistUseCase
{
    public function __construct(
        private readonly PlaylistMediaRepositoryInterface $playlistMedias,
    ) {}

    public function execute(int $playlistId, int $mediaId): void
    {
        if (!$this->playlistMedias->exists($playlistId, $mediaId)) {
            throw PlaylistMediaNotFoundException::forPair($playlistId, $mediaId);
        }

        $this->playlistMedias->detach($playlistId, $mediaId);
    }
}
