<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\UpdateClasse;

use App\Application\Agenda\DTOs\ClasseDTO;
use App\Application\Agenda\DTOs\UpdateClasseInput;
use App\Domain\Agenda\Exceptions\ClasseNotFoundException;
use App\Domain\Agenda\Repositories\ClasseRepositoryInterface;

final class UpdateClasseUseCase
{
    public function __construct(
        private readonly ClasseRepositoryInterface $repository,
    ) {}

    public function execute(UpdateClasseInput $input): ClasseDTO
    {
        $classe = $this->repository->findById($input->id);

        if ($classe === null) {
            throw ClasseNotFoundException::withId($input->id);
        }

        $classe->rename($input->nom);

        $updated = $this->repository->save($classe);

        return ClasseDTO::fromEntity($updated);
    }
}
