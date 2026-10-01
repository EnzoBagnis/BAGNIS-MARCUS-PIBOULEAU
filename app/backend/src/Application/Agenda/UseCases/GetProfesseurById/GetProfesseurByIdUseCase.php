<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\GetProfesseurById;

use App\Application\Agenda\DTOs\ProfesseurDTO;
use App\Domain\Agenda\Exceptions\ProfesseurNotFoundException;
use App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface;

final class GetProfesseurByIdUseCase
{
    public function __construct(
        private readonly ProfesseurRepositoryInterface $repository,
    ) {}

    public function execute(int $id): ProfesseurDTO
    {
        $professeur = $this->repository->findById($id)
            ?? throw ProfesseurNotFoundException::withId($id);

        return ProfesseurDTO::fromEntity($professeur);
    }
}
