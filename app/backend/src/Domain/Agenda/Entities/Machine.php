<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Entities;

use InvalidArgumentException;

final class Machine
{
    public function __construct(
        private ?int $id,
        private string $nom,
        private string $type,
    ) {
        $this->guardNom($nom);
        $this->guardType($type);
    }

    public static function create(string $nom, string $type): self
    {
        return new self(
            id: null,
            nom: $nom,
            type: $type,
        );
    }

    public function id(): ?int { return $this->id; }
    public function nom(): string { return $this->nom; }
    public function type(): string { return $this->type; }

    public function attachId(int $id): void
    {
        if ($this->id !== null) {
            throw new InvalidArgumentException("L'identifiant de la machine est déjà défini.");
        }
        $this->id = $id;
    }

    public function update(string $nom, string $type): void
    {
        $this->guardNom($nom);
        $this->guardType($type);
        $this->nom = $nom;
        $this->type = $type;
    }

    private function guardNom(string $nom): void
    {
        if (trim($nom) === '') {
            throw new InvalidArgumentException('Le nom de la machine ne peut pas être vide.');
        }
        if (mb_strlen($nom) > 100) {
            throw new InvalidArgumentException('Le nom de la machine ne peut pas dépasser 100 caractères.');
        }
    }

    private function guardType(string $type): void
    {
        if (trim($type) === '') {
            throw new InvalidArgumentException('Le type de la machine ne peut pas être vide.');
        }
        if (mb_strlen($type) > 50) {
            throw new InvalidArgumentException('Le type de la machine ne peut pas dépasser 50 caractères.');
        }
    }
}
