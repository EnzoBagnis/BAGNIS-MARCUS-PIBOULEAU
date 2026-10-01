<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Repositories;

use App\Domain\Information\Entities\Media;
use App\Domain\Information\Repositories\MediaRepositoryInterface;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Mappers\MediaMapper;
use PDO;

final class MySQLMediaRepository implements MediaRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $databaseConnection)
    {
        $this->connection = $databaseConnection->getInformationConnection();
    }

    public function save(Media $media): Media
    {
        if ($media->id() === null) {
            return $this->insert($media);
        }

        return $this->update($media);
    }

    private function insert(Media $media): Media
    {
        $sql = "INSERT INTO MEDIA (titre, type, url_fichier, contenu_texte, duree_sec, actif, date_ajout)
                VALUES (:titre, :type, :url_fichier, :contenu_texte, :duree_sec, :actif, :date_ajout)";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'titre'         => $media->titre(),
            'type'          => $media->type()->value,
            'url_fichier'   => $media->urlFichier(),
            'contenu_texte' => $media->contenuTexte(),
            'duree_sec'     => $media->dureeSec(),
            'actif'         => $media->actif() ? 1 : 0,
            'date_ajout'    => $media->dateAjout()->format('Y-m-d H:i:s'),
        ]);

        $id = (int) $this->connection->lastInsertId();
        $media->attachId($id);

        return $media;
    }

    private function update(Media $media): Media
    {
        $sql = "UPDATE MEDIA SET titre = :titre, type = :type,
                url_fichier = :url_fichier, contenu_texte = :contenu_texte,
                duree_sec = :duree_sec, actif = :actif WHERE id = :id";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute([
            'titre'         => $media->titre(),
            'type'          => $media->type()->value,
            'url_fichier'   => $media->urlFichier(),
            'contenu_texte' => $media->contenuTexte(),
            'duree_sec'     => $media->dureeSec(),
            'actif'         => $media->actif() ? 1 : 0,
            'id'            => $media->id(),
        ]);

        return $media;
    }

    public function findById(int $id): ?Media
    {
        $sql = "SELECT * FROM MEDIA WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }

        return MediaMapper::toDomain($row);
    }

    public function findAll(?bool $actif = null): array
    {
        $sql = "SELECT * FROM MEDIA";
        $params = [];

        if ($actif !== null) {
            $sql .= " WHERE actif = :actif";
            $params['actif'] = $actif ? 1 : 0;
        }

        $sql .= " ORDER BY id DESC";

        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = MediaMapper::toDomain($row);
        }

        return $results;
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM MEDIA WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);
    }

    public function exists(int $id): bool
    {
        $sql = "SELECT 1 FROM MEDIA WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute(['id' => $id]);

        return (bool) $stmt->fetchColumn();
    }
}
