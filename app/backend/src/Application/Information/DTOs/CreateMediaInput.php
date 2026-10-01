<?php

declare(strict_types=1);

namespace App\Application\Information\DTOs;

final class CreateMediaInput
{
    public function __construct(
        public readonly string $titre,
        public readonly string $type,
        public readonly ?string $urlFichier,
        public readonly ?string $contenuTexte,
        public readonly ?int $dureeSec = null,
        public readonly bool $actif = true,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromArray(array $payload): self
    {
        return new self(
            titre: (string) ($payload['titre'] ?? ''),
            type: (string) ($payload['type'] ?? ''),
            urlFichier: self::nullableString($payload['url_fichier'] ?? null),
            contenuTexte: self::nullableString($payload['contenu_texte'] ?? null),
            dureeSec: isset($payload['duree_sec']) && $payload['duree_sec'] !== ''
                ? (int) $payload['duree_sec']
                : null,
            actif: (bool) ($payload['actif'] ?? true),
        );
    }

    private static function nullableString(mixed $value): ?string
    {
        if ($value === null) return null;
        $str = (string) $value;
        return $str === '' ? null : $str;
    }
}
