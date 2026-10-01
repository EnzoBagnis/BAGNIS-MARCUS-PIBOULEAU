<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\DeleteClasse;

use App\Domain\Agenda\Exceptions\ClasseNotFoundException;
use App\Domain\Agenda\Repositories\ClasseRepositoryInterface;

final class DeleteClasseUseCase
{
    public function __construct(
        private readonly ClasseRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        if (!$this->repository->exists($id)) {
            throw ClasseNotFoundException::withId($id);
        }

        $this->repository->delete($id);
    }
}
