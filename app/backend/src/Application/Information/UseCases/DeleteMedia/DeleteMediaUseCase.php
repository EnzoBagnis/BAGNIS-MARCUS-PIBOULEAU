<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\DeleteMedia;

use App\Domain\Information\Exceptions\MediaNotFoundException;
use App\Domain\Information\Repositories\MediaRepositoryInterface;
use App\Domain\Information\Services\FileStorageInterface;

final class DeleteMediaUseCase
{
    public function __construct(
        private readonly MediaRepositoryInterface $repository,
        private readonly FileStorageInterface $storage,
    ) {}

    public function execute(int $id): void
    {
        $media = $this->repository->findById($id);
        if ($media === null) {
            throw MediaNotFoundException::withId($id);
        }

        $this->repository->delete($id);

        // Supprime aussi le fichier physique uploadé (image/vidéo) pour ne pas
        // laisser de fichiers orphelins qui satureraient le quota disque.
        // No-op pour un média texte (pas d'URL) ou une ressource externe.
        $url = $media->urlFichier();
        if ($url !== null && $url !== '') {
            $this->storage->delete($url);
        }
    }
}
