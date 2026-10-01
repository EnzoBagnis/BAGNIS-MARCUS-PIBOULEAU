<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Information;

use App\Application\Information\DTOs\CreateMediaInput;
use App\Application\Information\DTOs\UpdateMediaInput;
use App\Application\Information\UseCases\CreateMedia\CreateMediaUseCase;
use App\Application\Information\UseCases\DeleteMedia\DeleteMediaUseCase;
use App\Application\Information\UseCases\GetMediaById\GetMediaByIdUseCase;
use App\Application\Information\UseCases\ListMedias\ListMediasUseCase;
use App\Application\Information\UseCases\UpdateMedia\UpdateMediaUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class MediaController
{
    public function __construct(
        private readonly CreateMediaUseCase $createMedia,
        private readonly UpdateMediaUseCase $updateMedia,
        private readonly DeleteMediaUseCase $deleteMedia,
        private readonly ListMediasUseCase $listMedias,
        private readonly GetMediaByIdUseCase $getMediaById,
    ) {}

    /** @param array<string, string> $query */
    public function index(array $query): void
    {
        $actif = isset($query['actif'])
            ? filter_var($query['actif'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : null;

        $medias = $this->listMedias->execute($actif);

        JsonResponse::send([
            'data' => array_map(static fn ($dto) => $dto->toArray(), $medias),
        ]);
    }

    public function show(int $id): void
    {
        $media = $this->getMediaById->execute($id);
        JsonResponse::send(['data' => $media->toArray()]);
    }

    public function store(): void
    {
        $payload = JsonRequest::body();
        $media = $this->createMedia->execute(CreateMediaInput::fromArray($payload));
        JsonResponse::send(['data' => $media->toArray()], 201);
    }

    public function update(int $id): void
    {
        $payload = JsonRequest::body();
        $media = $this->updateMedia->execute(UpdateMediaInput::fromArray($id, $payload));
        JsonResponse::send(['data' => $media->toArray()]);
    }

    public function destroy(int $id): void
    {
        $this->deleteMedia->execute($id);
        JsonResponse::send(null, 204);
    }
}
