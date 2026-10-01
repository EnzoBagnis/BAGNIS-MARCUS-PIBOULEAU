<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Repositories;

use App\Domain\Agenda\Entities\Machine;

interface MachineRepositoryInterface
{
    public function save(Machine $machine): Machine;

    public function findById(int $id): ?Machine;

    /**
     * @return Machine[]
     */
    public function findAll(): array;

    public function delete(int $id): void;

    public function exists(int $id): bool;
}
