<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Repositories;

use App\Domain\Agenda\Entities\Reservation;
use App\Domain\Agenda\Repositories\ReservationRepositoryInterface;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Mappers\ReservationMapper;
use PDO;

final class MySQLReservationRepository implements ReservationRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $databaseConnection)
    {
        $this->connection = $databaseConnection->getAgendaConnection();
    }

    public function save(Reservation $reservation): Reservation
    {
        if ($reservation->id() === null) {
            return $this->insert($reservation);
        }

        return $this->update($reservation);
    }

    private function insert(Reservation $reservation): Reservation
    {
        $sql = "INSERT INTO RESERVATION (debut, fin, description, professeur_id, classe_id, machine_id)
                VALUES (:debut, :fin, :description, :professeur_id, :classe_id, :machine_id)";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'debut'         => $reservation->debut()->format('Y-m-d H:i:s'),
            'fin'           => $reservation->fin()->format('Y-m-d H:i:s'),
            'description'   => $reservation->description(),
            'professeur_id' => $reservation->professeurId(),
            'classe_id'     => $reservation->classeId(),
            'machine_id'    => $reservation->machineId(),
        ]);

        $id = (int) $this->connection->lastInsertId();
        $reservation->attachId($id);

        return $reservation;
    }

    private function update(Reservation $reservation): Reservation
    {
        $sql = "UPDATE RESERVATION SET debut = :debut, fin = :fin, description = :description,
                professeur_id = :professeur_id, classe_id = :classe_id, machine_id = :machine_id
                WHERE id = :id";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'debut'         => $reservation->debut()->format('Y-m-d H:i:s'),
            'fin'           => $reservation->fin()->format('Y-m-d H:i:s'),
            'description'   => $reservation->description(),
            'professeur_id' => $reservation->professeurId(),
            'classe_id'     => $reservation->classeId(),
            'machine_id'    => $reservation->machineId(),
            'id'            => $reservation->id(),
        ]);

        return $reservation;
    }

    public function findById(int $id): ?Reservation
    {
        $sql = "SELECT * FROM RESERVATION WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }

        return ReservationMapper::toDomain($row);
    }

    public function findAll(): array
    {
        $sql = "SELECT * FROM RESERVATION ORDER BY debut ASC";
        $stmt = $this->connection->query($sql);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = ReservationMapper::toDomain($row);
        }

        return $results;
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM RESERVATION WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);
    }

    public function exists(int $id): bool
    {
        $sql = "SELECT 1 FROM RESERVATION WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        return (bool) $stmt->fetchColumn();
    }
}
