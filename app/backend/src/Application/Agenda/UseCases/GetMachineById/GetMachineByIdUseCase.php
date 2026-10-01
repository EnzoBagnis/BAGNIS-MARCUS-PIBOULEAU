<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\GetMachineById;

use App\Application\Agenda\DTOs\MachineDTO;
use App\Domain\Agenda\Exceptions\MachineNotFoundException;
use App\Domain\Agenda\Repositories\MachineRepositoryInterface;

final class GetMachineByIdUseCase
{
    public function __construct(
        private readonly MachineRepositoryInterface $repository,
    ) {}

    public function execute(int $id): MachineDTO
    {
        $machine = $this->repository->findById($id)
            ?? throw MachineNotFoundException::withId($id);

        return MachineDTO::fromEntity($machine);
    }
}
