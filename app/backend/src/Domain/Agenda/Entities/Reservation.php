<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Entities;

use DateTimeImmutable;
use InvalidArgumentException;

final class Reservation
{
    private const DESCRIPTION_MAX_LENGTH = 500;

    private ?string $description;

    public function __construct(
        private ?int $id,
        private DateTimeImmutable $debut,
        private DateTimeImmutable $fin,
        ?string $description,
        private int $professeurId,
        private int $classeId,
        private int $machineId,
    ) {
        $this->guardDates($debut, $fin);
        $this->description = $this->normalizeDescription($description);
    }

    public static function create(
        DateTimeImmutable $debut,
        DateTimeImmutable $fin,
        ?string $description,
        int $professeurId,
        int $classeId,
        int $machineId,
    ): self {
        return new self(
            id: null,
            debut: $debut,
            fin: $fin,
            description: $description,
            professeurId: $professeurId,
            classeId: $classeId,
            machineId: $machineId,
        );
    }

    public function id(): ?int { return $this->id; }
    public function debut(): DateTimeImmutable { return $this->debut; }
    public function fin(): DateTimeImmutable { return $this->fin; }
    public function description(): ?string { return $this->description; }
    public function professeurId(): int { return $this->professeurId; }
    public function classeId(): int { return $this->classeId; }
    public function machineId(): int { return $this->machineId; }

    public function reschedule(DateTimeImmutable $debut, DateTimeImmutable $fin): void
    {
        $this->guardDates($debut, $fin);
        $this->debut = $debut;
        $this->fin = $fin;
    }

    public function changeDescription(?string $description): void
    {
        $this->description = $this->normalizeDescription($description);
    }

    public function assignProfesseur(int $id): void { $this->professeurId = $id; }
    public function assignClasse(int $id): void    { $this->classeId    = $id; }
    public function assignMachine(int $id): void   { $this->machineId   = $id; }

    public function attachId(int $id): void
    {
        if ($this->id !== null) {
            throw new InvalidArgumentException("L'identifiant de la réservation est déjà défini.");
        }
        $this->id = $id;
    }

    private function guardDates(DateTimeImmutable $debut, DateTimeImmutable $fin): void
    {
        if ($fin <= $debut) {
            throw new InvalidArgumentException('La date de fin de la réservation doit être postérieure à la date de début.');
        }
    }

    private function normalizeDescription(?string $description): ?string
    {
        if ($description === null) {
            return null;
        }
        $trimmed = trim($description);
        if ($trimmed === '') {
            return null;
        }
        if (mb_strlen($trimmed) > self::DESCRIPTION_MAX_LENGTH) {
            throw new InvalidArgumentException(sprintf(
                "Le champ 'description' ne peut excéder %d caractères.",
                self::DESCRIPTION_MAX_LENGTH,
            ));
        }
        return $trimmed;
    }
}
