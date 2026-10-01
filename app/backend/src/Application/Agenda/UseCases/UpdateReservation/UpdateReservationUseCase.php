<?php

declare(strict_types=1);

namespace App\Application\Agenda\UseCases\UpdateReservation;

use App\Application\Agenda\DTOs\ReservationDTO;
use App\Application\Agenda\DTOs\UpdateReservationInput;
use App\Domain\Agenda\Exceptions\ReservationNotFoundException;
use App\Domain\Agenda\Repositories\ReservationRepositoryInterface;
use DateTimeImmutable;
use InvalidArgumentException;

final class UpdateReservationUseCase
{
    public function __construct(
        private readonly ReservationRepositoryInterface $repository,
    ) {}

    public function execute(UpdateReservationInput $input): ReservationDTO
    {
        $reservation = $this->repository->findById($input->id)
            ?? throw ReservationNotFoundException::withId($input->id);

        if ($input->debut !== null || $input->fin !== null) {
            $debut = $input->debut !== null
                ? $this->parseDate('debut', $input->debut)
                : $reservation->debut();
            $fin = $input->fin !== null
                ? $this->parseDate('fin', $input->fin)
                : $reservation->fin();
            $reservation->reschedule($debut, $fin);
        }

        if ($input->description !== null) {
            $reservation->changeDescription($input->description);
        }

        if ($input->professeurId !== null) {
            $reservation->assignProfesseur($input->professeurId);
        }
        if ($input->classeId !== null) {
            $reservation->assignClasse($input->classeId);
        }
        if ($input->machineId !== null) {
            $reservation->assignMachine($input->machineId);
        }

        $updated = $this->repository->save($reservation);

        return ReservationDTO::fromEntity($updated);
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
