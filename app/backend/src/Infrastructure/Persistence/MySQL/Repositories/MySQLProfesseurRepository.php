<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Repositories;

use App\Domain\Agenda\Entities\Professeur;
use App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Mappers\ProfesseurMapper;
use PDO;

final class MySQLProfesseurRepository implements ProfesseurRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $databaseConnection)
    {
        $this->connection = $databaseConnection->getAgendaConnection();
    }

    public function save(Professeur $professeur): Professeur
    {
        if ($professeur->id() === null) {
            return $this->insert($professeur);
        }

        return $this->update($professeur);
    }

    private function insert(Professeur $professeur): Professeur
    {
        $sql = "INSERT INTO PROFESSEUR (nom, prenom) VALUES (:nom, :prenom)";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom'    => $professeur->nom(),
            'prenom' => $professeur->prenom(),
        ]);

        $id = (int) $this->connection->lastInsertId();
        $professeur->attachId($id);

        return $professeur;
    }

    private function update(Professeur $professeur): Professeur
    {
        $sql = "UPDATE PROFESSEUR SET nom = :nom, prenom = :prenom WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'nom'    => $professeur->nom(),
            'prenom' => $professeur->prenom(),
            'id'     => $professeur->id(),
        ]);

        return $professeur;
    }

    public function findById(int $id): ?Professeur
    {
        $sql = "SELECT * FROM PROFESSEUR WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }

        return ProfesseurMapper::toDomain($row);
    }

    public function findAll(): array
    {
        $sql = "SELECT * FROM PROFESSEUR ORDER BY nom ASC, prenom ASC";
        $stmt = $this->connection->query($sql);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = ProfesseurMapper::toDomain($row);
        }

        return $results;
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM PROFESSEUR WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);
    }

    public function exists(int $id): bool
    {
        $sql = "SELECT 1 FROM PROFESSEUR WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        return (bool) $stmt->fetchColumn();
    }
}
