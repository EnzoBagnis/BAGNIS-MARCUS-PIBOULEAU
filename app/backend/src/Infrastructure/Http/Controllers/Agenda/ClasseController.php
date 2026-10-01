<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Agenda;

use App\Application\Agenda\DTOs\CreateClasseInput;
use App\Application\Agenda\DTOs\UpdateClasseInput;
use App\Application\Agenda\UseCases\CreateClasse\CreateClasseUseCase;
use App\Application\Agenda\UseCases\DeleteClasse\DeleteClasseUseCase;
use App\Application\Agenda\UseCases\GetClasseById\GetClasseByIdUseCase;
use App\Application\Agenda\UseCases\ListClasses\ListClassesUseCase;
use App\Application\Agenda\UseCases\UpdateClasse\UpdateClasseUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class ClasseController
{
    public function __construct(
        private readonly ListClassesUseCase $listClasses,
        private readonly GetClasseByIdUseCase $getClasseById,
        private readonly CreateClasseUseCase $createClasse,
        private readonly UpdateClasseUseCase $updateClasse,
        private readonly DeleteClasseUseCase $deleteClasse,
    ) {}

    public function index(): void
    {
        $classes = $this->listClasses->execute();

        JsonResponse::send([
            'data' => array_map(static fn ($dto) => $dto->toArray(), $classes),
        ]);
    }

    public function show(int $id): void
    {
        $classe = $this->getClasseById->execute($id);
        JsonResponse::send(['data' => $classe->toArray()]);
    }

    public function store(): void
    {
        $payload = JsonRequest::body();
        $classe = $this->createClasse->execute(CreateClasseInput::fromArray($payload));
        JsonResponse::send(['data' => $classe->toArray()], 201);
    }

    public function update(int $id): void
    {
        $payload = JsonRequest::body();
        $classe = $this->updateClasse->execute(UpdateClasseInput::fromArray($id, $payload));
        JsonResponse::send(['data' => $classe->toArray()]);
    }

    public function destroy(int $id): void
    {
        $this->deleteClasse->execute($id);
        JsonResponse::send(null, 204);
    }
}
