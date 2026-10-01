<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\ListProfesseurs;

use App\Application\Agenda\DTOs\ProfesseurDTO;
use App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface;

final class ListProfesseursUseCase
{
    public function __construct(
        private readonly ProfesseurRepositoryInterface $repository,
    ) {}

    /** @return ProfesseurDTO[] */
    public function execute(): array
    {
        return array_map(
            static fn ($professeur) => ProfesseurDTO::fromEntity($professeur),
            $this->repository->findAll(),
        );
    }
}
