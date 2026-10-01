<?php

declare(strict_types=1);

namespace App\Application\Agenda\DTOs;

use App\Domain\Agenda\Entities\Reservation;
use DateTimeInterface;

final class ReservationDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $debut,
        public readonly string $fin,
        public readonly ?string $description,
        public readonly int $professeurId,
        public readonly int $classeId,
        public readonly int $machineId,
    ) {}

    public static function fromEntity(Reservation $reservation): self
    {
        $id = $reservation->id();
        if ($id === null) {
            throw new \LogicException("Impossible de créer un DTO depuis une réservation non persistée.");
        }

        return new self(
            id: $id,
            debut: $reservation->debut()->format(DateTimeInterface::ATOM),
            fin: $reservation->fin()->format(DateTimeInterface::ATOM),
            description: $reservation->description(),
            professeurId: $reservation->professeurId(),
            classeId: $reservation->classeId(),
            machineId: $reservation->machineId(),
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id'            => $this->id,
            'debut'         => $this->debut,
            'fin'           => $this->fin,
            'description'   => $this->description,
            'professeur_id' => $this->professeurId,
            'classe_id'     => $this->classeId,
            'machine_id'    => $this->machineId,
        ];
    }
}
