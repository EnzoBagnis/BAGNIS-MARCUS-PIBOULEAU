<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\GetMediaById;

use App\Application\Information\DTOs\MediaDTO;
use App\Domain\Information\Exceptions\MediaNotFoundException;
use App\Domain\Information\Repositories\MediaRepositoryInterface;

final class GetMediaByIdUseCase
{
    public function __construct(
        private readonly MediaRepositoryInterface $repository,
    ) {}

    public function execute(int $id): MediaDTO
    {
        $media = $this->repository->findById($id)
            ?? throw MediaNotFoundException::withId($id);

        return MediaDTO::fromEntity($media);
    }
}
