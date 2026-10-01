<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Entities;

use InvalidArgumentException;

final class Classe
{
    public function __construct(
        private ?int $id,
        private string $nom,
    ) {
        $this->guardNom($nom);
    }

    public static function create(string $nom): self
    {
        return new self(
            id: null,
            nom: $nom,
        );
    }

    public function id(): ?int { return $this->id; }
    public function nom(): string { return $this->nom; }

    public function attachId(int $id): void
    {
        if ($this->id !== null) {
            throw new InvalidArgumentException("L'identifiant de la classe est déjà défini.");
        }
        $this->id = $id;
    }

    public function rename(string $nom): void
    {
        $this->guardNom($nom);
        $this->nom = $nom;
    }

    private function guardNom(string $nom): void
    {
        if (trim($nom) === '') {
            throw new InvalidArgumentException('Le nom de la classe ne peut pas être vide.');
        }
        if (mb_strlen($nom) > 50) {
            throw new InvalidArgumentException('Le nom de la classe ne peut pas dépasser 50 caractères.');
        }
    }
}
