<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\AttachMediaToPlaylist;

use App\Application\Information\DTOs\AttachPlaylistMediaInput;
use App\Application\Information\DTOs\PlaylistMediaDTO;
use App\Domain\Information\Exceptions\PlaylistNotFoundException;
use App\Domain\Information\Repositories\PlaylistMediaRepositoryInterface;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;
use App\Domain\Information\ValueObjects\PlaylistItem;

final class AttachMediaToPlaylistUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $playlists,
        private readonly PlaylistMediaRepositoryInterface $playlistMedias,
    ) {}

    public function execute(AttachPlaylistMediaInput $input): PlaylistMediaDTO
    {
        if (!$this->playlists->exists($input->playlistId)) {
            throw PlaylistNotFoundException::withId($input->playlistId);
        }

        // Validation des invariants (ids et ordre strictement positifs).
        $item = new PlaylistItem($input->mediaId, $input->ordre);

        $this->playlistMedias->attach($input->playlistId, $item->mediaId, $item->ordre);

        return PlaylistMediaDTO::fromItem($input->playlistId, $item);
    }
}
