<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Mappers;

use App\Domain\Information\Entities\Media;
use App\Domain\Information\ValueObjects\MediaType;
use DateTimeImmutable;

final class MediaMapper
{
    /**
     * Convertit un tableau associatif (ligne PDO) en entité de domaine Media.
     *
     * @param array<string, mixed> $row
     */
    public static function toDomain(array $row): Media
    {
        return new Media(
            id: (int) $row['id'],
            titre: $row['titre'],
            type: MediaType::fromString($row['type']),
            urlFichier: isset($row['url_fichier']) && $row['url_fichier'] !== ''
                ? (string) $row['url_fichier']
                : null,
            contenuTexte: isset($row['contenu_texte']) && $row['contenu_texte'] !== ''
                ? (string) $row['contenu_texte']
                : null,
            dureeSec: $row['duree_sec'] !== null ? (int) $row['duree_sec'] : null,
            actif: (bool) $row['actif'],
            dateAjout: new DateTimeImmutable($row['date_ajout']),
        );
    }
}
