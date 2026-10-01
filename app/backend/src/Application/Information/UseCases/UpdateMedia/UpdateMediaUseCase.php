<?php

declare(strict_types=1);

namespace App\Application\Information\UseCases\UpdateMedia;

use App\Application\Information\DTOs\MediaDTO;
use App\Application\Information\DTOs\UpdateMediaInput;
use App\Domain\Information\Exceptions\MediaNotFoundException;
use App\Domain\Information\Repositories\MediaRepositoryInterface;
use App\Domain\Information\ValueObjects\MediaType;

final class UpdateMediaUseCase
{
    public function __construct(
        private readonly MediaRepositoryInterface $repository,
    ) {}

    public function execute(UpdateMediaInput $input): MediaDTO
    {
        $media = $this->repository->findById($input->id)
            ?? throw MediaNotFoundException::withId($input->id);

        if ($input->titre !== null) {
            $media->renommer($input->titre);
        }

        $touchesContenu = $input->type !== null
            || $input->urlFichier !== null
            || $input->contenuTexte !== null
            || $input->dureeSec !== null;

        if ($touchesContenu) {
            $newType = $input->type !== null
                ? MediaType::fromString($input->type)
                : $media->type();

            // Selon le type final, on choisit url XOR contenu_texte.
            // L'entité valide la cohérence en levant une InvalidArgumentException
            // (→ HTTP 422) si on lui passe un état incohérent.
            if ($newType === MediaType::Texte) {
                $newUrl = null;
                $newTexte = $input->contenuTexte ?? $media->contenuTexte();
            } else {
                $newUrl = $input->urlFichier ?? $media->urlFichier();
                $newTexte = null;
            }
            $newDuree = $input->dureeSec ?? $media->dureeSec();

            $media->changerContenu($newType, $newUrl, $newTexte, $newDuree);
        }

        if ($input->actif !== null) {
            $input->actif ? $media->activer() : $media->desactiver();
        }

        $updated = $this->repository->save($media);

        return MediaDTO::fromEntity($updated);
    }
}
