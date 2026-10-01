<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Repositories;

use App\Domain\Agenda\Entities\Professeur;

interface ProfesseurRepositoryInterface
{
    public function save(Professeur $professeur): Professeur;

    public function findById(int $id): ?Professeur;

    /**
     * @return Professeur[]
     */
    public function findAll(): array;

    public function delete(int $id): void;

    public function exists(int $id): bool;
}
