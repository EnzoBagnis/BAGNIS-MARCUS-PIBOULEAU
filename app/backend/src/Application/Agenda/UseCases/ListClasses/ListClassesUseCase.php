<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\ListClasses;

use App\Application\Agenda\DTOs\ClasseDTO;
use App\Domain\Agenda\Repositories\ClasseRepositoryInterface;

final class ListClassesUseCase
{
    public function __construct(
        private readonly ClasseRepositoryInterface $repository,
    ) {}

    /** @return ClasseDTO[] */
    public function execute(): array
    {
        return array_map(
            static fn ($classe) => ClasseDTO::fromEntity($classe),
            $this->repository->findAll(),
        );
    }
}
