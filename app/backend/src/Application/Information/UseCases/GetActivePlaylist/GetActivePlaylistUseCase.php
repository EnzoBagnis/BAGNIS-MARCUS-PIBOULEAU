<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\GetActivePlaylist;

use App\Application\Information\DTOs\ActivePlaylistDTO;
use App\Application\Information\DTOs\ActivePlaylistMediaDTO;
use App\Application\Information\DTOs\MediaDTO;
use App\Domain\Information\Repositories\MediaRepositoryInterface;
use App\Domain\Information\Repositories\PlaylistMediaRepositoryInterface;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;

final class GetActivePlaylistUseCase
{
    public function __construct(
        private readonly PlaylistRepositoryInterface $playlistRepository,
        private readonly PlaylistMediaRepositoryInterface $playlistMediaRepository,
        private readonly MediaRepositoryInterface $mediaRepository,
    ) {}

    public function execute(): ?ActivePlaylistDTO
    {
        // Récupère TOUTES les playlists actives (triées par id ASC).
        // Si plusieurs playlists sont actives, leurs médias sont concaténés :
        // d'abord tous les médias de la playlist 1 (dans leur ordre), puis
        // ceux de la playlist 2, etc.
        $playlists = $this->playlistRepository->findAllActive();
        if (empty($playlists)) {
            return null;
        }

        $allMedias = [];
        $globalOrdre = 1;

        foreach ($playlists as $playlist) {
            $playlistId = $playlist->id();
            if ($playlistId === null) {
                continue;
            }

            $items = $this->playlistMediaRepository->findByPlaylist($playlistId);

            foreach ($items as $item) {
                $media = $this->mediaRepository->findById($item->mediaId);
                if ($media !== null && $media->actif()) {
                    $allMedias[] = new ActivePlaylistMediaDTO(
                        media: MediaDTO::fromEntity($media),
                        ordre: $globalOrdre++,
                    );
                }
            }
        }

        // Utilise la première playlist comme conteneur de la réponse.
        $first = $playlists[0];

        return new ActivePlaylistDTO(
            id: $first->id(),
            nom: $first->nom(),
            active: true,
            medias: $allMedias,
        );
    }
}
