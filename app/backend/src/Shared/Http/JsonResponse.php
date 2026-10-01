<?php

declare(strict_types=1);

namespace App\Shared\Http;

final class JsonResponse
{
    public static function send(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($status === 204) {
            return;
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function error(string $message, int $status, ?string $code = null): void
    {
        self::send([
            'error' => [
                'code'    => $code ?? self::defaultCode($status),
                'message' => $message,
            ],
        ], $status);
    }

    private static function defaultCode(int $status): string
    {
        return match ($status) {
            400 => 'BAD_REQUEST',
            404 => 'NOT_FOUND',
            422 => 'UNPROCESSABLE_ENTITY',
            500 => 'INTERNAL_SERVER_ERROR',
            default => 'ERROR',
        };
    }
}
