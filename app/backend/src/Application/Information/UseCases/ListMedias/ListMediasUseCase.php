<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\ListMedias;

use App\Application\Information\DTOs\MediaDTO;
use App\Domain\Information\Repositories\MediaRepositoryInterface;

final class ListMediasUseCase
{
    public function __construct(
        private readonly MediaRepositoryInterface $repository,
    ) {}

    /** @return MediaDTO[] */
    public function execute(?bool $actif = null): array
    {
        return array_map(
            static fn ($media) => MediaDTO::fromEntity($media),
            $this->repository->findAll($actif),
        );
    }
}
