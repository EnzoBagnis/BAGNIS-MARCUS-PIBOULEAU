<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

use App\Domain\Information\Entities\Media;

final class MediaDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $titre,
        public readonly string $type,
        public readonly ?string $urlFichier,
        public readonly ?string $contenuTexte,
        public readonly ?int $dureeSec,
        public readonly bool $actif,
        public readonly string $dateAjout,
    ) {}

    public static function fromEntity(Media $media): self
    {
        $id = $media->id();
        if ($id === null) {
            throw new \LogicException("Impossible de créer un DTO depuis un média non persisté.");
        }

        return new self(
            id: $id,
            titre: $media->titre(),
            type: $media->type()->value,
            urlFichier: $media->urlFichier(),
            contenuTexte: $media->contenuTexte(),
            dureeSec: $media->dureeSec(),
            actif: $media->actif(),
            dateAjout: $media->dateAjout()->format(\DateTimeInterface::ATOM),
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id'            => $this->id,
            'titre'         => $this->titre,
            'type'          => $this->type,
            'url_fichier'   => $this->urlFichier,
            'contenu_texte' => $this->contenuTexte,
            'duree_sec'     => $this->dureeSec,
            'actif'         => $this->actif,
            'date_ajout'    => $this->dateAjout,
        ];
    }
}
