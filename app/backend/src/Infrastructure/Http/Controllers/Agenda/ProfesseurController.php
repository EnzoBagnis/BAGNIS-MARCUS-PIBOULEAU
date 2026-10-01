<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Agenda;

use App\Application\Agenda\DTOs\CreateProfesseurInput;
use App\Application\Agenda\DTOs\UpdateProfesseurInput;
use App\Application\Agenda\UseCases\CreateProfesseur\CreateProfesseurUseCase;
use App\Application\Agenda\UseCases\DeleteProfesseur\DeleteProfesseurUseCase;
use App\Application\Agenda\UseCases\GetProfesseurById\GetProfesseurByIdUseCase;
use App\Application\Agenda\UseCases\ListProfesseurs\ListProfesseursUseCase;
use App\Application\Agenda\UseCases\UpdateProfesseur\UpdateProfesseurUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class ProfesseurController
{
    public function __construct(
        private readonly ListProfesseursUseCase $listProfesseurs,
        private readonly GetProfesseurByIdUseCase $getProfesseurById,
        private readonly CreateProfesseurUseCase $createProfesseur,
        private readonly UpdateProfesseurUseCase $updateProfesseur,
        private readonly DeleteProfesseurUseCase $deleteProfesseur,
    ) {}

    public function index(): void
    {
        $professeurs = $this->listProfesseurs->execute();

        JsonResponse::send([
            'data' => array_map(static fn ($dto) => $dto->toArray(), $professeurs),
        ]);
    }

    public function show(int $id): void
    {
        $professeur = $this->getProfesseurById->execute($id);
        JsonResponse::send(['data' => $professeur->toArray()]);
    }

    public function store(): void
    {
        $payload = JsonRequest::body();
        $professeur = $this->createProfesseur->execute(CreateProfesseurInput::fromArray($payload));
        JsonResponse::send(['data' => $professeur->toArray()], 201);
    }

    public function update(int $id): void
    {
        $payload = JsonRequest::body();
        $professeur = $this->updateProfesseur->execute(UpdateProfesseurInput::fromArray($id, $payload));
        JsonResponse::send(['data' => $professeur->toArray()]);
    }

    public function destroy(int $id): void
    {
        $this->deleteProfesseur->execute($id);
        JsonResponse::send(null, 204);
    }
}
