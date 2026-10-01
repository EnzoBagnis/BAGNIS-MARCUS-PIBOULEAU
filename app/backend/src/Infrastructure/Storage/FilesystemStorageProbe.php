<?php

declare(strict_types=1);

namespace App\Infrastructure\Storage;

use App\Domain\Admin\Services\StorageProbeInterface;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use FilesystemIterator;
use PDO;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

/**
 * Sonde d'occupation disque pour un hébergement type AlwaysData :
 *  - `uploads` : somme récursive de la taille des fichiers du dossier d'uploads ;
 *  - `database` : somme de (data_length + index_length) des tables des bases du projet,
 *    lue dans information_schema.
 */
final class FilesystemStorageProbe implements StorageProbeInterface
{
    /**
     * @param string         $uploadsDir    Chemin absolu du dossier d'uploads.
     * @param string[]       $databaseNames Noms des bases à comptabiliser.
     */
    public function __construct(
        private readonly string $uploadsDir,
        private readonly DatabaseConnection $connection,
        private readonly array $databaseNames,
    ) {}

    public function uploadsBytes(): int
    {
        if (!is_dir($this->uploadsDir)) {
            return 0;
        }

        $total = 0;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->uploadsDir, FilesystemIterator::SKIP_DOTS),
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $total += $file->getSize();
            }
        }

        return $total;
    }

    public function databaseBytes(): int
    {
        $names = array_values(array_filter($this->databaseNames, static fn ($n) => $n !== ''));
        if ($names === []) {
            return 0;
        }

        // information_schema est global : une seule connexion suffit pour interroger
        // les deux bases du projet.
        $pdo = $this->connection->getInformationConnection();
        $placeholders = implode(',', array_fill(0, count($names), '?'));

        $sql = "SELECT IFNULL(SUM(data_length + index_length), 0) AS bytes
                FROM information_schema.TABLES
                WHERE table_schema IN ($placeholders)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($names);

        return (int) $stmt->fetchColumn();
    }
}
