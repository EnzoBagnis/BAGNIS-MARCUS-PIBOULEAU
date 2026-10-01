<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\ListReservations;

use App\Application\Agenda\DTOs\ReservationDTO;
use App\Domain\Agenda\Repositories\ReservationRepositoryInterface;

final class ListReservationsUseCase
{
    public function __construct(
        private readonly ReservationRepositoryInterface $repository,
    ) {}

    /** @return ReservationDTO[] */
    public function execute(): array
    {
        return array_map(
            static fn ($reservation) => ReservationDTO::fromEntity($reservation),
            $this->repository->findAll(),
        );
    }
}
