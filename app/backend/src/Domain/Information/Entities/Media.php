<?php

declare(strict_types=1);

namespace App\Domain\Information\Entities;

use App\Domain\Information\ValueObjects\MediaType;
use DateTimeImmutable;
use InvalidArgumentException;

final class Media
{
    public function __construct(
        private ?int $id,
        private string $titre,
        private MediaType $type,
        private ?string $urlFichier,
        private ?string $contenuTexte,
        private ?int $dureeSec,
        private bool $actif,
        private DateTimeImmutable $dateAjout,
    ) {
        $this->guardTitre($titre);
        $this->guardContenu($type, $urlFichier, $contenuTexte);
        $this->guardDuree($type, $dureeSec);
    }

    public static function create(
        string $titre,
        MediaType $type,
        ?string $urlFichier,
        ?string $contenuTexte,
        ?int $dureeSec = null,
        bool $actif = true,
    ): self {
        return new self(
            id: null,
            titre: $titre,
            type: $type,
            urlFichier: $urlFichier,
            contenuTexte: $contenuTexte,
            dureeSec: $dureeSec,
            actif: $actif,
            dateAjout: new DateTimeImmutable(),
        );
    }

    public function id(): ?int { return $this->id; }
    public function titre(): string { return $this->titre; }
    public function type(): MediaType { return $this->type; }
    public function urlFichier(): ?string { return $this->urlFichier; }
    public function contenuTexte(): ?string { return $this->contenuTexte; }
    public function dureeSec(): ?int { return $this->dureeSec; }
    public function actif(): bool { return $this->actif; }
    public function dateAjout(): DateTimeImmutable { return $this->dateAjout; }

    public function renommer(string $titre): void
    {
        $this->guardTitre($titre);
        $this->titre = $titre;
    }

    /**
     * Remplace le contenu (type + url ou texte + durée) en une opération atomique
     * afin de garantir la cohérence des invariants.
     */
    public function changerContenu(
        MediaType $type,
        ?string $urlFichier,
        ?string $contenuTexte,
        ?int $dureeSec,
    ): void {
        $this->guardContenu($type, $urlFichier, $contenuTexte);
        $this->guardDuree($type, $dureeSec);
        $this->type = $type;
        $this->urlFichier = $urlFichier;
        $this->contenuTexte = $contenuTexte;
        $this->dureeSec = $dureeSec;
    }

    public function activer(): void { $this->actif = true; }
    public function desactiver(): void { $this->actif = false; }

    public function attachId(int $id): void
    {
        if ($this->id !== null) {
            throw new InvalidArgumentException("L'identifiant du média est déjà défini.");
        }
        $this->id = $id;
    }

    private function guardTitre(string $titre): void
    {
        if (trim($titre) === '') {
            throw new InvalidArgumentException('Le titre du média ne peut pas être vide.');
        }
        if (mb_strlen($titre) > 150) {
            throw new InvalidArgumentException('Le titre du média ne peut pas dépasser 150 caractères.');
        }
    }

    private function guardContenu(MediaType $type, ?string $urlFichier, ?string $contenuTexte): void
    {
        if ($type === MediaType::Texte) {
            if ($urlFichier !== null && trim($urlFichier) !== '') {
                throw new InvalidArgumentException("Un média de type 'texte' ne doit pas avoir d'URL de fichier.");
            }
            if ($contenuTexte === null || trim($contenuTexte) === '') {
                throw new InvalidArgumentException("Le contenu texte est obligatoire pour un média de type 'texte'.");
            }
        } else {
            if ($contenuTexte !== null && trim($contenuTexte) !== '') {
                throw new InvalidArgumentException("Le contenu texte n'est utilisé que pour les médias de type 'texte'.");
            }
            if ($urlFichier === null || trim($urlFichier) === '') {
                throw new InvalidArgumentException("L'URL du fichier est obligatoire pour un média de type 'image' ou 'video'.");
            }
            if (mb_strlen($urlFichier) > 255) {
                throw new InvalidArgumentException("L'URL du fichier ne peut pas dépasser 255 caractères.");
            }
        }
    }

    private function guardDuree(MediaType $type, ?int $duree): void
    {
        if ($duree !== null && $duree <= 0) {
            throw new InvalidArgumentException('La durée doit être strictement positive.');
        }
        if ($type === MediaType::Video && $duree === null) {
            throw new InvalidArgumentException('Une vidéo doit avoir une durée.');
        }
    }
}
