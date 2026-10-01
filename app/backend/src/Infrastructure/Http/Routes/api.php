<?php

declare(strict_types=1);

use App\Infrastructure\DependencyInjection\Container;
use App\Infrastructure\Http\Controllers\Agenda\ClasseController;
use App\Infrastructure\Http\Controllers\Agenda\MachineController;
use App\Infrastructure\Http\Controllers\Agenda\ProfesseurController;
use App\Infrastructure\Http\Controllers\Agenda\ReservationController;
use App\Infrastructure\Http\Controllers\Admin\StorageController;
use App\Infrastructure\Http\Controllers\Auth\AuthController;
use App\Infrastructure\Http\Controllers\Information\MediaController;
use App\Infrastructure\Http\Controllers\Information\MediaUploadController;
use App\Infrastructure\Http\Controllers\Information\PlaylistController;
use App\Infrastructure\Http\Controllers\Information\PlaylistMediaController;
use App\Infrastructure\Http\Middleware\AdminAuthMiddleware;
use App\Infrastructure\Http\Middleware\ProfAuthMiddleware;
use App\Shared\Http\Router;

return static function (Router $router, Container $c): void {
    // Garde "professeur" : routes POST/PUT/DELETE des réservations (mutations).
    // Garde "admin" : routes POST/PUT/DELETE des médias, playlists et playlist_medias.
    // Les lectures restent libres.
    $profAuth  = [new ProfAuthMiddleware()];
    $adminAuth = [new AdminAuthMiddleware()];

    // Auth : route publique (pas de middleware) — c'est ici qu'on délivre le rôle.
    /** @var AuthController $auth */
    $auth = $c->get(AuthController::class);
    $router->post('/api/auth/login', fn () => $auth->loginAction());

    // Admin : occupation disque (quota AlwaysData) — réservé admin.
    /** @var StorageController $storage */
    $storage = $c->get(StorageController::class);
    $router->get('/api/admin/storage', fn () => $storage->index(), $adminAuth);

    /** @var MediaController $media */
    $media = $c->get(MediaController::class);

    $router->get('/api/medias',         fn () => $media->index($_GET));
    $router->get('/api/medias/{id}',    fn (array $p) => $media->show((int) $p['id']));
    $router->post('/api/medias',        fn () => $media->store(),                       $adminAuth);
    $router->put('/api/medias/{id}',    fn (array $p) => $media->update((int) $p['id']),  $adminAuth);
    $router->delete('/api/medias/{id}', fn (array $p) => $media->destroy((int) $p['id']), $adminAuth);

    /** @var MediaUploadController $mediaUpload */
    $mediaUpload = $c->get(MediaUploadController::class);

    // Upload de fichier (image/vidéo) — étape préalable à POST /api/medias.
    // Retourne l'URL publique à passer ensuite dans `url_fichier`.
    $router->post('/api/medias/upload', fn () => $mediaUpload->upload(), $adminAuth);

    /** @var PlaylistController $playlists */
    $playlists = $c->get(PlaylistController::class);

    $router->get('/api/playlists',         fn () => $playlists->index($_GET));
    $router->get('/api/playlists/active',  fn () => $playlists->showActive());
    $router->get('/api/playlists/{id}',    fn (array $p) => $playlists->show((int) $p['id']));
    $router->post('/api/playlists',        fn () => $playlists->store(),                       $adminAuth);
    $router->put('/api/playlists/{id}',    fn (array $p) => $playlists->update((int) $p['id']),  $adminAuth);
    $router->delete('/api/playlists/{id}', fn (array $p) => $playlists->destroy((int) $p['id']), $adminAuth);

    /** @var PlaylistMediaController $playlistMedias */
    $playlistMedias = $c->get(PlaylistMediaController::class);

    $router->get('/api/playlists/{id}/medias',                fn (array $p) => $playlistMedias->index((int) $p['id']));
    $router->post('/api/playlists/{id}/medias',               fn (array $p) => $playlistMedias->store((int) $p['id']),                              $adminAuth);
    $router->put('/api/playlists/{id}/medias/{media_id}',     fn (array $p) => $playlistMedias->update((int) $p['id'], (int) $p['media_id']),          $adminAuth);
    $router->delete('/api/playlists/{id}/medias/{media_id}',  fn (array $p) => $playlistMedias->destroy((int) $p['id'], (int) $p['media_id']),         $adminAuth);

    /** @var ProfesseurController $professeurs */
    $professeurs = $c->get(ProfesseurController::class);

    $router->get('/api/professeurs',      fn () => $professeurs->index());
    $router->get('/api/professeurs/{id}', fn (array $p) => $professeurs->show((int) $p['id']));
    $router->post('/api/professeurs',        fn () => $professeurs->store(),                       $adminAuth);
    $router->put('/api/professeurs/{id}',    fn (array $p) => $professeurs->update((int) $p['id']),  $adminAuth);
    $router->delete('/api/professeurs/{id}', fn (array $p) => $professeurs->destroy((int) $p['id']), $adminAuth);

    /** @var ClasseController $classes */
    $classes = $c->get(ClasseController::class);

    $router->get('/api/classes',      fn () => $classes->index());
    $router->get('/api/classes/{id}', fn (array $p) => $classes->show((int) $p['id']));
    $router->post('/api/classes',        fn () => $classes->store(),                       $adminAuth);
    $router->put('/api/classes/{id}',    fn (array $p) => $classes->update((int) $p['id']),  $adminAuth);
    $router->delete('/api/classes/{id}', fn (array $p) => $classes->destroy((int) $p['id']), $adminAuth);

    /** @var MachineController $machines */
    $machines = $c->get(MachineController::class);

    $router->get('/api/machines',      fn () => $machines->index($_GET));
    $router->get('/api/machines/{id}', fn (array $p) => $machines->show((int) $p['id']));
    $router->post('/api/machines',        fn () => $machines->store(),                       $adminAuth);
    $router->put('/api/machines/{id}',    fn (array $p) => $machines->update((int) $p['id']),  $adminAuth);
    $router->delete('/api/machines/{id}', fn (array $p) => $machines->destroy((int) $p['id']), $adminAuth);

    /** @var ReservationController $reservations */
    $reservations = $c->get(ReservationController::class);

    $router->get('/api/reservations',         fn () => $reservations->index());
    $router->get('/api/reservations/{id}',    fn (array $p) => $reservations->show((int) $p['id']));
    $router->post('/api/reservations',        fn () => $reservations->store(),                       $profAuth);
    $router->put('/api/reservations/{id}',    fn (array $p) => $reservations->update((int) $p['id']),  $profAuth);
    $router->delete('/api/reservations/{id}', fn (array $p) => $reservations->destroy((int) $p['id']), $profAuth);
};
