<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\GetClasseById;

use App\Application\Agenda\DTOs\ClasseDTO;
use App\Domain\Agenda\Exceptions\ClasseNotFoundException;
use App\Domain\Agenda\Repositories\ClasseRepositoryInterface;

final class GetClasseByIdUseCase
{
    public function __construct(
        private readonly ClasseRepositoryInterface $repository,
    ) {}

    public function execute(int $id): ClasseDTO
    {
        $classe = $this->repository->findById($id)
            ?? throw ClasseNotFoundException::withId($id);

        return ClasseDTO::fromEntity($classe);
    }
}
