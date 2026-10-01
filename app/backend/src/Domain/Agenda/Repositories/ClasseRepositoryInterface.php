<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Repositories;

use App\Domain\Agenda\Entities\Classe;

interface ClasseRepositoryInterface
{
    public function save(Classe $classe): Classe;

    public function findById(int $id): ?Classe;

    /**
     * @return Classe[]
     */
    public function findAll(): array;

    public function delete(int $id): void;

    public function exists(int $id): bool;
}
