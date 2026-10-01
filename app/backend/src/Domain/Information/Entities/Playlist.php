<?php

declare(strict_types=1);

namespace App\Domain\Information\Entities;

use InvalidArgumentException;

final class Playlist
{
    public function __construct(
        private ?int $id,
        private string $nom,
        private bool $active,
    ) {
        $this->guardNom($nom);
    }

    public static function create(string $nom, bool $active = false): self
    {
        return new self(
            id: null,
            nom: $nom,
            active: $active,
        );
    }

    public function id(): ?int { return $this->id; }
    public function nom(): string { return $this->nom; }
    public function active(): bool { return $this->active; }

    public function renommer(string $nom): void
    {
        $this->guardNom($nom);
        $this->nom = $nom;
    }

    public function activer(): void { $this->active = true; }
    public function desactiver(): void { $this->active = false; }

    public function attachId(int $id): void
    {
        if ($this->id !== null) {
            throw new InvalidArgumentException("L'identifiant de la playlist est déjà défini.");
        }
        $this->id = $id;
    }

    private function guardNom(string $nom): void
    {
        if (trim($nom) === '') {
            throw new InvalidArgumentException('Le nom de la playlist ne peut pas être vide.');
        }
        if (mb_strlen($nom) > 100) {
            throw new InvalidArgumentException('Le nom de la playlist ne peut pas dépasser 100 caractères.');
        }
    }
}
