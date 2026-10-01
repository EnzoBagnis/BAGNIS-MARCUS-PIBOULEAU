<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

final class UpdateMediaInput
{
    public function __construct(
        public readonly int $id,
        public readonly ?string $titre,
        public readonly ?string $type,
        public readonly ?string $urlFichier,
        public readonly ?string $contenuTexte,
        public readonly ?int $dureeSec,
        public readonly ?bool $actif,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(int $id, array $payload): self
    {
        return new self(
            id: $id,
            titre: array_key_exists('titre', $payload) ? (string) $payload['titre'] : null,
            type: array_key_exists('type', $payload) ? (string) $payload['type'] : null,
            urlFichier: array_key_exists('url_fichier', $payload)
                ? self::nullableString($payload['url_fichier'])
                : null,
            contenuTexte: array_key_exists('contenu_texte', $payload)
                ? self::nullableString($payload['contenu_texte'])
                : null,
            dureeSec: array_key_exists('duree_sec', $payload)
                ? ($payload['duree_sec'] === null || $payload['duree_sec'] === '' ? null : (int) $payload['duree_sec'])
                : null,
            actif: array_key_exists('actif', $payload) ? (bool) $payload['actif'] : null,
        );
    }

    private static function nullableString(mixed $value): ?string
    {
        if ($value === null) return null;
        $str = (string) $value;
        return $str === '' ? null : $str;
    }
}
