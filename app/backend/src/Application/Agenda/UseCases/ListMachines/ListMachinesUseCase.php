<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\ListMachines;

use App\Application\Agenda\DTOs\MachineDTO;
use App\Domain\Agenda\Repositories\MachineRepositoryInterface;

final class ListMachinesUseCase
{
    public function __construct(
        private readonly MachineRepositoryInterface $repository,
    ) {}

    /** @return MachineDTO[] */
    public function execute(): array
    {
        return array_map(
            static fn ($machine) => MachineDTO::fromEntity($machine),
            $this->repository->findAll(),
        );
    }
}
