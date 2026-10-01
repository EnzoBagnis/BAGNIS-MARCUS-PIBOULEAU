<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\CreateProfesseur;

use App\Application\Agenda\DTOs\CreateProfesseurInput;
use App\Application\Agenda\DTOs\ProfesseurDTO;
use App\Domain\Agenda\Entities\Professeur;
use App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface;

final class CreateProfesseurUseCase
{
    public function __construct(
        private readonly ProfesseurRepositoryInterface $repository,
    ) {}

    public function execute(CreateProfesseurInput $input): ProfesseurDTO
    {
        $professeur = Professeur::create(
            nom: $input->nom,
            prenom: $input->prenom,
        );

        $persisted = $this->repository->save($professeur);

        return ProfesseurDTO::fromEntity($persisted);
    }
}
