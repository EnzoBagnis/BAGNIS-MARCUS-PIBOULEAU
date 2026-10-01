<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\DeleteProfesseur;

use App\Domain\Agenda\Exceptions\ProfesseurNotFoundException;
use App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface;

final class DeleteProfesseurUseCase
{
    public function __construct(
        private readonly ProfesseurRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        if (!$this->repository->exists($id)) {
            throw ProfesseurNotFoundException::withId($id);
        }

        $this->repository->delete($id);
    }
}
