<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\CreateMachine;

use App\Application\Agenda\DTOs\CreateMachineInput;
use App\Application\Agenda\DTOs\MachineDTO;
use App\Domain\Agenda\Entities\Machine;
use App\Domain\Agenda\Repositories\MachineRepositoryInterface;

final class CreateMachineUseCase
{
    public function __construct(
        private readonly MachineRepositoryInterface $repository,
    ) {}

    public function execute(CreateMachineInput $input): MachineDTO
    {
        $machine = Machine::create(
            nom: $input->nom,
            type: $input->type,
        );

        $persisted = $this->repository->save($machine);

        return MachineDTO::fromEntity($persisted);
    }
}
