<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\CreateClasse;

use App\Application\Agenda\DTOs\ClasseDTO;
use App\Application\Agenda\DTOs\CreateClasseInput;
use App\Domain\Agenda\Entities\Classe;
use App\Domain\Agenda\Repositories\ClasseRepositoryInterface;

final class CreateClasseUseCase
{
    public function __construct(
        private readonly ClasseRepositoryInterface $repository,
    ) {}

    public function execute(CreateClasseInput $input): ClasseDTO
    {
        $classe = Classe::create(
            nom: $input->nom,
        );

        $persisted = $this->repository->save($classe);

        return ClasseDTO::fromEntity($persisted);
    }
}
