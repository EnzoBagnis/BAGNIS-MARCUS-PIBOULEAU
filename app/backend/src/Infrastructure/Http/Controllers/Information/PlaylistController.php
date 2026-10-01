<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Information;

use App\Application\Information\DTOs\CreatePlaylistInput;
use App\Application\Information\DTOs\UpdatePlaylistInput;
use App\Application\Information\UseCases\CreatePlaylist\CreatePlaylistUseCase;
use App\Application\Information\UseCases\DeletePlaylist\DeletePlaylistUseCase;
use App\Application\Information\UseCases\GetActivePlaylist\GetActivePlaylistUseCase;
use App\Application\Information\UseCases\GetPlaylistById\GetPlaylistByIdUseCase;
use App\Application\Information\UseCases\ListPlaylists\ListPlaylistsUseCase;
use App\Application\Information\UseCases\UpdatePlaylist\UpdatePlaylistUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class PlaylistController
{
    public function __construct(
        private readonly CreatePlaylistUseCase $createPlaylist,
        private readonly UpdatePlaylistUseCase $updatePlaylist,
        private readonly DeletePlaylistUseCase $deletePlaylist,
        private readonly ListPlaylistsUseCase $listPlaylists,
        private readonly GetPlaylistByIdUseCase $getPlaylistById,
        private readonly GetActivePlaylistUseCase $getActivePlaylist,
    ) {}

    /** @param array<string, string> $query */
    public function index(array $query): void
    {
        $active = isset($query['active'])
            ? filter_var($query['active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : null;

        $playlists = $this->listPlaylists->execute($active);

        JsonResponse::send([
            'data' => array_map(static fn ($dto) => $dto->toArray(), $playlists),
        ]);
    }

    public function showActive(): void
    {
        $playlist = $this->getActivePlaylist->execute();

        if ($playlist === null) {
            JsonResponse::send(['data' => null]);
            return;
        }

        JsonResponse::send(['data' => $playlist->toArray()]);
    }

    public function show(int $id): void
    {
        $playlist = $this->getPlaylistById->execute($id);
        JsonResponse::send(['data' => $playlist->toArray()]);
    }

    public function store(): void
    {
        $payload = JsonRequest::body();
        $playlist = $this->createPlaylist->execute(CreatePlaylistInput::fromArray($payload));
        JsonResponse::send(['data' => $playlist->toArray()], 201);
    }

    public function update(int $id): void
    {
        $payload = JsonRequest::body();
        $playlist = $this->updatePlaylist->execute(UpdatePlaylistInput::fromArray($id, $payload));
        JsonResponse::send(['data' => $playlist->toArray()]);
    }

    public function destroy(int $id): void
    {
        $this->deletePlaylist->execute($id);
        JsonResponse::send(null, 204);
    }
}
