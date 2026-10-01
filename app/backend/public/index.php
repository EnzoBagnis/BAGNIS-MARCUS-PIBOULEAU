<?php

declare(strict_types=1);

use App\Domain\Agenda\Exceptions\ClasseNotFoundException;
use App\Domain\Auth\Exceptions\InvalidCredentialsException;
use App\Domain\Agenda\Exceptions\MachineNotFoundException;
use App\Domain\Agenda\Exceptions\ProfesseurNotFoundException;
use App\Domain\Agenda\Exceptions\ReservationNotFoundException;
use App\Domain\Information\Exceptions\MediaNotFoundException;
use App\Domain\Information\Exceptions\PlaylistMediaNotFoundException;
use App\Domain\Information\Exceptions\PlaylistNotFoundException;
use App\Infrastructure\DependencyInjection\Container;
use App\Shared\Config\EnvLoader;
use App\Shared\Http\JsonResponse;
use App\Shared\Http\Router;

require __DIR__ . '/../vendor/autoload.php';

// Chercher le .env en remontant l'arborescence depuis public/
$dir = __DIR__;
$envPath = null;
for ($i = 0; $i < 6; $i++) {
    $dir = dirname($dir);
    if (file_exists($dir . '/../.env')) {
        $envPath = $dir . '/../.env';
        break;
    }
}
if ($envPath === null) {
    throw new RuntimeException('.env introuvable');
}
EnvLoader::load($envPath);

$container = new Container();
$router    = new Router();

(require __DIR__ . '/../src/Infrastructure/Http/Routes/api.php')($router, $container);

try {
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    if ($scriptDir !== '/' && strpos($uri, $scriptDir) === 0) {
        $uri = substr($uri, strlen($scriptDir));
    }

    $router->dispatch(
        $_SERVER['REQUEST_METHOD'] ?? 'GET',
        $uri,
    );
} catch (MediaNotFoundException $e) {
    JsonResponse::error($e->getMessage(), 404, 'MEDIA_NOT_FOUND');
} catch (ProfesseurNotFoundException $e) {
    JsonResponse::error($e->getMessage(), 404, 'PROFESSEUR_NOT_FOUND');
} catch (ClasseNotFoundException $e) {
    JsonResponse::error($e->getMessage(), 404, 'CLASSE_NOT_FOUND');
} catch (MachineNotFoundException $e) {
    JsonResponse::error($e->getMessage(), 404, 'MACHINE_NOT_FOUND');
} catch (ReservationNotFoundException $e) {
    JsonResponse::error($e->getMessage(), 404, 'RESERVATION_NOT_FOUND');
} catch (PlaylistNotFoundException $e) {
    JsonResponse::error($e->getMessage(), 404, 'PLAYLIST_NOT_FOUND');
} catch (PlaylistMediaNotFoundException $e) {
    JsonResponse::error($e->getMessage(), 404, 'PLAYLIST_MEDIA_NOT_FOUND');
} catch (InvalidCredentialsException $e) {
    JsonResponse::error($e->getMessage(), 401, 'INVALID_CREDENTIALS');
} catch (InvalidArgumentException $e) {
    JsonResponse::error($e->getMessage(), 422, 'VALIDATION_ERROR');
} catch (Throwable $e) {
    error_log((string) $e);
    JsonResponse::error('Erreur interne du serveur.', 500);
}
