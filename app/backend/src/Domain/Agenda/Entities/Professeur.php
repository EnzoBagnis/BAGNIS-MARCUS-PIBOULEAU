<?php

declare(strict_types=1);

namespace App\Domain\Agenda\Entities;

use InvalidArgumentException;

final class Professeur
{
    public function __construct(
        private ?int $id,
        private string $nom,
        private string $prenom,
    ) {
        $this->guardNom($nom);
        $this->guardPrenom($prenom);
    }

    public static function create(string $nom, string $prenom): self
    {
        return new self(
            id: null,
            nom: $nom,
            prenom: $prenom,
        );
    }

    public function id(): ?int { return $this->id; }
    public function nom(): string { return $this->nom; }
    public function prenom(): string { return $this->prenom; }

    public function attachId(int $id): void
    {
        if ($this->id !== null) {
            throw new InvalidArgumentException("L'identifiant du professeur est déjà défini.");
        }
        $this->id = $id;
    }

    public function rename(string $nom, string $prenom): void
    {
        $this->guardNom($nom);
        $this->guardPrenom($prenom);
        $this->nom = $nom;
        $this->prenom = $prenom;
    }

    private function guardNom(string $nom): void
    {
        if (trim($nom) === '') {
            throw new InvalidArgumentException('Le nom du professeur ne peut pas être vide.');
        }
        if (mb_strlen($nom) > 50) {
            throw new InvalidArgumentException('Le nom du professeur ne peut pas dépasser 50 caractères.');
        }
    }

    private function guardPrenom(string $prenom): void
    {
        if (trim($prenom) === '') {
            throw new InvalidArgumentException('Le prénom du professeur ne peut pas être vide.');
        }
        if (mb_strlen($prenom) > 50) {
            throw new InvalidArgumentException('Le prénom du professeur ne peut pas dépasser 50 caractères.');
        }
    }
}
