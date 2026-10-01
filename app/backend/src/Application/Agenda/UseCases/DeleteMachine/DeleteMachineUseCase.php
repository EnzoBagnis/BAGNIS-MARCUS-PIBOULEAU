<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\DeleteMachine;

use App\Domain\Agenda\Exceptions\MachineNotFoundException;
use App\Domain\Agenda\Repositories\MachineRepositoryInterface;

final class DeleteMachineUseCase
{
    public function __construct(
        private readonly MachineRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        if (!$this->repository->exists($id)) {
            throw MachineNotFoundException::withId($id);
        }

        $this->repository->delete($id);
    }
}
