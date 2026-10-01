<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\CreateReservation;

use App\Application\Agenda\DTOs\CreateReservationInput;
use App\Application\Agenda\DTOs\ReservationDTO;
use App\Domain\Agenda\Entities\Reservation;
use App\Domain\Agenda\Repositories\ReservationRepositoryInterface;
use DateTimeImmutable;
use InvalidArgumentException;

final class CreateReservationUseCase
{
    public function __construct(
        private readonly ReservationRepositoryInterface $repository,
    ) {}

    public function execute(CreateReservationInput $input): ReservationDTO
    {
        $reservation = Reservation::create(
            debut: $this->parseDate('debut', $input->debut),
            fin: $this->parseDate('fin', $input->fin),
            description: $input->description,
            professeurId: $input->professeurId,
            classeId: $input->classeId,
            machineId: $input->machineId,
        );

        $persisted = $this->repository->save($reservation);

        return ReservationDTO::fromEntity($persisted);
    }

    private function parseDate(string $field, string $value): DateTimeImmutable
    {
        if (trim($value) === '') {
            throw new InvalidArgumentException("Le champ '{$field}' est obligatoire.");
        }

        try {
            return new DateTimeImmutable($value);
        } catch (\Exception $e) {
            throw new InvalidArgumentException("Le champ '{$field}' n'est pas une date valide.", 0, $e);
        }
    }
}
