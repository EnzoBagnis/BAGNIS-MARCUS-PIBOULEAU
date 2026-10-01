<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Agenda;

use App\Application\Agenda\DTOs\CreateReservationInput;
use App\Application\Agenda\DTOs\UpdateReservationInput;
use App\Application\Agenda\UseCases\CreateReservation\CreateReservationUseCase;
use App\Application\Agenda\UseCases\DeleteReservation\DeleteReservationUseCase;
use App\Application\Agenda\UseCases\GetReservationById\GetReservationByIdUseCase;
use App\Application\Agenda\UseCases\ListReservations\ListReservationsUseCase;
use App\Application\Agenda\UseCases\UpdateReservation\UpdateReservationUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class ReservationController
{
    public function __construct(
        private readonly CreateReservationUseCase $createReservation,
        private readonly UpdateReservationUseCase $updateReservation,
        private readonly DeleteReservationUseCase $deleteReservation,
        private readonly ListReservationsUseCase $listReservations,
        private readonly GetReservationByIdUseCase $getReservationById,
    ) {}

    public function index(): void
    {
        $reservations = $this->listReservations->execute();

        JsonResponse::send([
            'data' => array_map(static fn ($dto) => $dto->toArray(), $reservations),
        ]);
    }

    public function show(int $id): void
    {
        $reservation = $this->getReservationById->execute($id);
        JsonResponse::send(['data' => $reservation->toArray()]);
    }

    public function store(): void
    {
        $payload = JsonRequest::body();
        $reservation = $this->createReservation->execute(CreateReservationInput::fromArray($payload));
        JsonResponse::send(['data' => $reservation->toArray()], 201);
    }

    public function update(int $id): void
    {
        $payload = JsonRequest::body();
        $reservation = $this->updateReservation->execute(UpdateReservationInput::fromArray($id, $payload));
        JsonResponse::send(['data' => $reservation->toArray()]);
    }

    public function destroy(int $id): void
    {
        $this->deleteReservation->execute($id);
        JsonResponse::send(null, 204);
    }
}
