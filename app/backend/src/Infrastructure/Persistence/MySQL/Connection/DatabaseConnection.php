<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\MySQL\Connection;

use App\Shared\Config\EnvLoader;
use PDO;
use PDOException;
use RuntimeException;

final class DatabaseConnection
{
    private ?PDO $agendaConnection = null;
    private ?PDO $informationConnection = null;

    private string $host;
    private string $user;
    private string $password;
    private string $agendaDb;
    private string $informationDb;
    private string $charset;

    public function __construct()
    {
        $this->host          = EnvLoader::get('DB_HOST', '127.0.0.1');
        $this->user          = EnvLoader::get('DB_USER');
        $this->password      = EnvLoader::get('DB_PASSWORD', '');
        $this->agendaDb      = EnvLoader::get('DB_AGENDA', 'bts_aero_agenda');
        $this->informationDb = EnvLoader::get('DB_INFORMATION', 'bts_aero_information');
        $this->charset       = EnvLoader::get('DB_CHARSET', 'utf8mb4');
    }

    public function getAgendaConnection(): PDO
    {
        if ($this->agendaConnection === null) {
            $this->agendaConnection = $this->createConnection($this->agendaDb);
        }
        return $this->agendaConnection;
    }

    public function getInformationConnection(): PDO
    {
        if ($this->informationConnection === null) {
            $this->informationConnection = $this->createConnection($this->informationDb);
        }
        return $this->informationConnection;
    }

    private function createConnection(string $database): PDO
    {
        $dsn = "mysql:host={$this->host};dbname={$database};charset={$this->charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            return new PDO($dsn, $this->user, $this->password, $options);
        } catch (PDOException $e) {
            throw new RuntimeException(
                "Impossible de se connecter à la base de données '{$database}' : " . $e->getMessage(),
                (int) $e->getCode(),
                $e,
            );
        }
    }
}
