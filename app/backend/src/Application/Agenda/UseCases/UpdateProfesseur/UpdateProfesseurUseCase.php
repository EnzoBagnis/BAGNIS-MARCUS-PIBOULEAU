<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\UpdateProfesseur;

use App\Application\Agenda\DTOs\ProfesseurDTO;
use App\Application\Agenda\DTOs\UpdateProfesseurInput;
use App\Domain\Agenda\Exceptions\ProfesseurNotFoundException;
use App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface;

final class UpdateProfesseurUseCase
{
    public function __construct(
        private readonly ProfesseurRepositoryInterface $repository,
    ) {}

    public function execute(UpdateProfesseurInput $input): ProfesseurDTO
    {
        $professeur = $this->repository->findById($input->id);

        if ($professeur === null) {
            throw ProfesseurNotFoundException::withId($input->id);
        }

        $professeur->rename($input->nom, $input->prenom);

        $updated = $this->repository->save($professeur);

        return ProfesseurDTO::fromEntity($updated);
    }
}
