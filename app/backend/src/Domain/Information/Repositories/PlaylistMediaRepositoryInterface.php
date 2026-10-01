<?php

declare(strict_types=1);

namespace App\Domain\Information\Repositories;

use App\Domain\Information\ValueObjects\PlaylistItem;

interface PlaylistMediaRepositoryInterface
{
    /**
     * @return PlaylistItem[] Triés par ordre croissant.
     */
    public function findByPlaylist(int $playlistId): array;

    public function attach(int $playlistId, int $mediaId, int $ordre): void;

    public function updateOrdre(int $playlistId, int $mediaId, int $ordre): void;

    public function detach(int $playlistId, int $mediaId): void;

    public function exists(int $playlistId, int $mediaId): bool;
}
