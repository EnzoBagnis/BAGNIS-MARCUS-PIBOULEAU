<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\CreateMedia;

use App\Application\Information\DTOs\CreateMediaInput;
use App\Application\Information\DTOs\MediaDTO;
use App\Domain\Information\Entities\Media;
use App\Domain\Information\Repositories\MediaRepositoryInterface;
use App\Domain\Information\ValueObjects\MediaType;

final class CreateMediaUseCase
{
    public function __construct(
        private readonly MediaRepositoryInterface $repository,
    ) {}

    public function execute(CreateMediaInput $input): MediaDTO
    {
        $media = Media::create(
            titre: $input->titre,
            type: MediaType::fromString($input->type),
            urlFichier: $input->urlFichier,
            contenuTexte: $input->contenuTexte,
            dureeSec: $input->dureeSec,
            actif: $input->actif,
        );

        $persisted = $this->repository->save($media);

        return MediaDTO::fromEntity($persisted);
    }
}
