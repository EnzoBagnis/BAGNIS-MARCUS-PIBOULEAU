<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\UpdateMachine;

use App\Application\Agenda\DTOs\MachineDTO;
use App\Application\Agenda\DTOs\UpdateMachineInput;
use App\Domain\Agenda\Exceptions\MachineNotFoundException;
use App\Domain\Agenda\Repositories\MachineRepositoryInterface;

final class UpdateMachineUseCase
{
    public function __construct(
        private readonly MachineRepositoryInterface $repository,
    ) {}

    public function execute(UpdateMachineInput $input): MachineDTO
    {
        $machine = $this->repository->findById($input->id);

        if ($machine === null) {
            throw MachineNotFoundException::withId($input->id);
        }

        $machine->update($input->nom, $input->type);

        $updated = $this->repository->save($machine);

        return MachineDTO::fromEntity($updated);
    }
}
