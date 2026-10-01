<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Repositories;

use App\Domain\Agenda\Entities\Machine;
use App\Domain\Agenda\Repositories\MachineRepositoryInterface;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Mappers\MachineMapper;
use PDO;

final class MySQLMachineRepository implements MachineRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $databaseConnection)
    {
        $this->connection = $databaseConnection->getAgendaConnection();
    }

    public function save(Machine $machine): Machine
    {
        if ($machine->id() === null) {
            return $this->insert($machine);
        }

        return $this->update($machine);
    }

    private function insert(Machine $machine): Machine
    {
        $sql = "INSERT INTO MACHINE (nom, type) VALUES (:nom, :type)";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom'  => $machine->nom(),
            'type' => $machine->type(),
        ]);

        $id = (int) $this->connection->lastInsertId();
        $machine->attachId($id);

        return $machine;
    }

    private function update(Machine $machine): Machine
    {
        $sql = "UPDATE MACHINE SET nom = :nom, type = :type WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom'  => $machine->nom(),
            'type' => $machine->type(),
            'id'   => $machine->id(),
        ]);

        return $machine;
    }

    public function findById(int $id): ?Machine
    {
        $sql = "SELECT * FROM MACHINE WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }

        return MachineMapper::toDomain($row);
    }

    public function findAll(): array
    {
        $sql = "SELECT * FROM MACHINE ORDER BY nom ASC";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute();

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = MachineMapper::toDomain($row);
        }

        return $results;
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM MACHINE WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);
    }

    public function exists(int $id): bool
    {
        $sql = "SELECT 1 FROM MACHINE WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        return (bool) $stmt->fetchColumn();
    }
}
