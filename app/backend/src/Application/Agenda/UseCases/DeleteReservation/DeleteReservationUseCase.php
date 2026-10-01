<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\DeleteReservation;

use App\Domain\Agenda\Exceptions\ReservationNotFoundException;
use App\Domain\Agenda\Repositories\ReservationRepositoryInterface;

final class DeleteReservationUseCase
{
    public function __construct(
        private readonly ReservationRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        if (!$this->repository->exists($id)) {
            throw ReservationNotFoundException::withId($id);
        }

        $this->repository->delete($id);
    }
}
