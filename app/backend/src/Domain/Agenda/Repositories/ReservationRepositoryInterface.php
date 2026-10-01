<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Repositories;

use App\Domain\Agenda\Entities\Reservation;

interface ReservationRepositoryInterface
{
    public function save(Reservation $reservation): Reservation;

    public function findById(int $id): ?Reservation;

    /**
     * @return Reservation[]
     */
    public function findAll(): array;

    public function delete(int $id): void;

    public function exists(int $id): bool;
}
