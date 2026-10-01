<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\UpdatePlaylistMediaOrdre;

use App\Application\Information\DTOs\PlaylistMediaDTO;
use App\Application\Information\DTOs\UpdatePlaylistMediaInput;
use App\Domain\Information\Exceptions\PlaylistMediaNotFoundException;
use App\Domain\Information\Repositories\PlaylistMediaRepositoryInterface;
use App\Domain\Information\ValueObjects\PlaylistItem;

final class UpdatePlaylistMediaOrdreUseCase
{
    public function __construct(
        private readonly PlaylistMediaRepositoryInterface $playlistMedias,
    ) {}

    public function execute(UpdatePlaylistMediaInput $input): PlaylistMediaDTO
    {
        if (!$this->playlistMedias->exists($input->playlistId, $input->mediaId)) {
            throw PlaylistMediaNotFoundException::forPair($input->playlistId, $input->mediaId);
        }

        // Validation des invariants (ordre strictement positif).
        $item = new PlaylistItem($input->mediaId, $input->ordre);

        $this->playlistMedias->updateOrdre($input->playlistId, $item->mediaId, $item->ordre);

        return PlaylistMediaDTO::fromItem($input->playlistId, $item);
    }
}
