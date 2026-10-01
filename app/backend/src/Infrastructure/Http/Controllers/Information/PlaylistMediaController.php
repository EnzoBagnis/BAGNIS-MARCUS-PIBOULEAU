<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Information;

use App\Application\Information\DTOs\AttachPlaylistMediaInput;
use App\Application\Information\DTOs\UpdatePlaylistMediaInput;
use App\Application\Information\UseCases\AttachMediaToPlaylist\AttachMediaToPlaylistUseCase;
use App\Application\Information\UseCases\DetachMediaFromPlaylist\DetachMediaFromPlaylistUseCase;
use App\Application\Information\UseCases\ListPlaylistMedias\ListPlaylistMediasUseCase;
use App\Application\Information\UseCases\UpdatePlaylistMediaOrdre\UpdatePlaylistMediaOrdreUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class PlaylistMediaController
{
    public function __construct(
        private readonly ListPlaylistMediasUseCase $listPlaylistMedias,
        private readonly AttachMediaToPlaylistUseCase $attachMedia,
        private readonly UpdatePlaylistMediaOrdreUseCase $updateOrdre,
        private readonly DetachMediaFromPlaylistUseCase $detachMedia,
    ) {}

    public function index(int $playlistId): void
    {
        $items = $this->listPlaylistMedias->execute($playlistId);

        JsonResponse::send([
            'data' => array_map(static fn ($dto) => $dto->toArray(), $items),
        ]);
    }

    public function store(int $playlistId): void
    {
        $payload = JsonRequest::body();
        $item = $this->attachMedia->execute(AttachPlaylistMediaInput::fromArray($playlistId, $payload));
        JsonResponse::send(['data' => $item->toArray()], 201);
    }

    public function update(int $playlistId, int $mediaId): void
    {
        $payload = JsonRequest::body();
        $item = $this->updateOrdre->execute(UpdatePlaylistMediaInput::fromArray($playlistId, $mediaId, $payload));
        JsonResponse::send(['data' => $item->toArray()]);
    }

    public function destroy(int $playlistId, int $mediaId): void
    {
        $this->detachMedia->execute($playlistId, $mediaId);
        JsonResponse::send(null, 204);
    }
}
