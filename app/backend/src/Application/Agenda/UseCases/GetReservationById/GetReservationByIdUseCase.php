<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\GetReservationById;

use App\Application\Agenda\DTOs\ReservationDTO;
use App\Domain\Agenda\Exceptions\ReservationNotFoundException;
use App\Domain\Agenda\Repositories\ReservationRepositoryInterface;

final class GetReservationByIdUseCase
{
    public function __construct(
        private readonly ReservationRepositoryInterface $repository,
    ) {}

    public function execute(int $id): ReservationDTO
    {
        $reservation = $this->repository->findById($id)
            ?? throw ReservationNotFoundException::withId($id);

        return ReservationDTO::fromEntity($reservation);
    }
}
