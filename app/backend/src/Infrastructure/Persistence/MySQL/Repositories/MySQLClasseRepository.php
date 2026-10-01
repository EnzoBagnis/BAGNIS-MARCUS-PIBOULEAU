<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Repositories;

use App\Domain\Agenda\Entities\Classe;
use App\Domain\Agenda\Repositories\ClasseRepositoryInterface;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Mappers\ClasseMapper;
use PDO;

final class MySQLClasseRepository implements ClasseRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $databaseConnection)
    {
        $this->connection = $databaseConnection->getAgendaConnection();
    }

    public function save(Classe $classe): Classe
    {
        if ($classe->id() === null) {
            return $this->insert($classe);
        }

        return $this->update($classe);
    }

    private function insert(Classe $classe): Classe
    {
        $sql = "INSERT INTO CLASSE (nom) VALUES (:nom)";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom' => $classe->nom(),
        ]);

        $id = (int) $this->connection->lastInsertId();
        $classe->attachId($id);

        return $classe;
    }

    private function update(Classe $classe): Classe
    {
        $sql = "UPDATE CLASSE SET nom = :nom WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom' => $classe->nom(),
            'id'  => $classe->id(),
        ]);

        return $classe;
    }

    public function findById(int $id): ?Classe
    {
        $sql = "SELECT * FROM CLASSE WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }

        return ClasseMapper::toDomain($row);
    }

    public function findAll(): array
    {
        $sql = "SELECT * FROM CLASSE ORDER BY nom ASC";
        $stmt = $this->connection->query($sql);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = ClasseMapper::toDomain($row);
        }

        return $results;
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM CLASSE WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);
    }

    public function exists(int $id): bool
    {
        $sql = "SELECT 1 FROM CLASSE WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        return (bool) $stmt->fetchColumn();
    }
}
