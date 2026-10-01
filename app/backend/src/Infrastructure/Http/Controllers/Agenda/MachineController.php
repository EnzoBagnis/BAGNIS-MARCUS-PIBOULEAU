<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers\Agenda;

use App\Application\Agenda\DTOs\CreateMachineInput;
use App\Application\Agenda\DTOs\UpdateMachineInput;
use App\Application\Agenda\UseCases\CreateMachine\CreateMachineUseCase;
use App\Application\Agenda\UseCases\DeleteMachine\DeleteMachineUseCase;
use App\Application\Agenda\UseCases\GetMachineById\GetMachineByIdUseCase;
use App\Application\Agenda\UseCases\ListMachines\ListMachinesUseCase;
use App\Application\Agenda\UseCases\UpdateMachine\UpdateMachineUseCase;
use App\Shared\Http\JsonRequest;
use App\Shared\Http\JsonResponse;

final class MachineController
{
    public function __construct(
        private readonly ListMachinesUseCase $listMachines,
        private readonly GetMachineByIdUseCase $getMachineById,
        private readonly CreateMachineUseCase $createMachine,
        private readonly UpdateMachineUseCase $updateMachine,
        private readonly DeleteMachineUseCase $deleteMachine,
    ) {}

    /** @param array<string, string> $query */
    public function index(array $query): void
    {
        $machines = $this->listMachines->execute();

        JsonResponse::send([
            'data' => array_map(static fn ($dto) => $dto->toArray(), $machines),
        ]);
    }

    public function show(int $id): void
    {
        $machine = $this->getMachineById->execute($id);
        JsonResponse::send(['data' => $machine->toArray()]);
    }

    public function store(): void
    {
        $payload = JsonRequest::body();
        $machine = $this->createMachine->execute(CreateMachineInput::fromArray($payload));
        JsonResponse::send(['data' => $machine->toArray()], 201);
    }

    public function update(int $id): void
    {
        $payload = JsonRequest::body();
        $machine = $this->updateMachine->execute(UpdateMachineInput::fromArray($id, $payload));
        JsonResponse::send(['data' => $machine->toArray()]);
    }

    public function destroy(int $id): void
    {
        $this->deleteMachine->execute($id);
        JsonResponse::send(null, 204);
    }
}
