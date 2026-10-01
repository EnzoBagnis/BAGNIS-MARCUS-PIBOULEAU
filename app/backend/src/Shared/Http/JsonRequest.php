<?php

declare(strict_types=1);

namespace App\Shared\Http;

use InvalidArgumentException;

final class JsonRequest
{
    /** @return array<string, mixed> */
    public static function body(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new InvalidArgumentException('JSON invalide : ' . $e->getMessage(), 0, $e);
        }

        if (!is_array($decoded)) {
            throw new InvalidArgumentException('Le corps JSON doit être un objet.');
        }

        return $decoded;
    }
}
