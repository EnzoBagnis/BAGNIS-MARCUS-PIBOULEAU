<?php

declare(strict_types=1);

namespace App\Infrastructure\DependencyInjection;

use App\Application\Agenda\UseCases\CreateClasse\CreateClasseUseCase;
use App\Application\Agenda\UseCases\CreateMachine\CreateMachineUseCase;
use App\Application\Agenda\UseCases\CreateProfesseur\CreateProfesseurUseCase;
use App\Application\Admin\UseCases\GetStorageUsage\GetStorageUsageUseCase;
use App\Application\Agenda\UseCases\CreateReservation\CreateReservationUseCase;
use App\Application\Auth\UseCases\Login\LoginUseCase;
use App\Application\Agenda\UseCases\DeleteClasse\DeleteClasseUseCase;
use App\Application\Agenda\UseCases\DeleteMachine\DeleteMachineUseCase;
use App\Application\Agenda\UseCases\DeleteProfesseur\DeleteProfesseurUseCase;
use App\Application\Agenda\UseCases\DeleteReservation\DeleteReservationUseCase;
use App\Application\Agenda\UseCases\GetClasseById\GetClasseByIdUseCase;
use App\Application\Agenda\UseCases\GetMachineById\GetMachineByIdUseCase;
use App\Application\Agenda\UseCases\GetProfesseurById\GetProfesseurByIdUseCase;
use App\Application\Agenda\UseCases\GetReservationById\GetReservationByIdUseCase;
use App\Application\Agenda\UseCases\ListClasses\ListClassesUseCase;
use App\Application\Agenda\UseCases\ListMachines\ListMachinesUseCase;
use App\Application\Agenda\UseCases\ListProfesseurs\ListProfesseursUseCase;
use App\Application\Agenda\UseCases\ListReservations\ListReservationsUseCase;
use App\Application\Agenda\UseCases\UpdateClasse\UpdateClasseUseCase;
use App\Application\Agenda\UseCases\UpdateMachine\UpdateMachineUseCase;
use App\Application\Agenda\UseCases\UpdateProfesseur\UpdateProfesseurUseCase;
use App\Application\Agenda\UseCases\UpdateReservation\UpdateReservationUseCase;
use App\Application\Information\UseCases\AttachMediaToPlaylist\AttachMediaToPlaylistUseCase;
use App\Application\Information\UseCases\CreateMedia\CreateMediaUseCase;
use App\Application\Information\UseCases\CreatePlaylist\CreatePlaylistUseCase;
use App\Application\Information\UseCases\DeleteMedia\DeleteMediaUseCase;
use App\Application\Information\UseCases\DeletePlaylist\DeletePlaylistUseCase;
use App\Application\Information\UseCases\DetachMediaFromPlaylist\DetachMediaFromPlaylistUseCase;
use App\Application\Information\UseCases\GetActivePlaylist\GetActivePlaylistUseCase;
use App\Application\Information\UseCases\GetMediaById\GetMediaByIdUseCase;
use App\Application\Information\UseCases\GetPlaylistById\GetPlaylistByIdUseCase;
use App\Application\Information\UseCases\ListMedias\ListMediasUseCase;
use App\Application\Information\UseCases\ListPlaylistMedias\ListPlaylistMediasUseCase;
use App\Application\Information\UseCases\ListPlaylists\ListPlaylistsUseCase;
use App\Application\Information\UseCases\UpdateMedia\UpdateMediaUseCase;
use App\Application\Information\UseCases\UpdatePlaylist\UpdatePlaylistUseCase;
use App\Application\Information\UseCases\UpdatePlaylistMediaOrdre\UpdatePlaylistMediaOrdreUseCase;
use App\Application\Information\UseCases\UploadMediaFile\UploadMediaFileUseCase;
use App\Domain\Agenda\Repositories\ClasseRepositoryInterface;
use App\Domain\Agenda\Repositories\MachineRepositoryInterface;
use App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface;
use App\Domain\Agenda\Repositories\ReservationRepositoryInterface;
use App\Domain\Information\Repositories\MediaRepositoryInterface;
use App\Domain\Information\Repositories\PlaylistMediaRepositoryInterface;
use App\Domain\Information\Repositories\PlaylistRepositoryInterface;
use App\Domain\Admin\Services\StorageProbeInterface;
use App\Domain\Information\Services\FileStorageInterface;
use App\Infrastructure\Http\Controllers\Admin\StorageController;
use App\Infrastructure\Http\Controllers\Agenda\ClasseController;
use App\Infrastructure\Http\Controllers\Auth\AuthController;
use App\Infrastructure\Http\Controllers\Agenda\MachineController;
use App\Infrastructure\Http\Controllers\Agenda\ProfesseurController;
use App\Infrastructure\Http\Controllers\Agenda\ReservationController;
use App\Infrastructure\Http\Controllers\Information\MediaController;
use App\Infrastructure\Http\Controllers\Information\MediaUploadController;
use App\Infrastructure\Http\Controllers\Information\PlaylistController;
use App\Infrastructure\Http\Controllers\Information\PlaylistMediaController;
use App\Infrastructure\Storage\FilesystemStorageProbe;
use App\Infrastructure\Storage\LocalFileStorage;
use App\Shared\Config\EnvLoader;
use App\Shared\Container\ServiceContainer;

final class Container extends ServiceContainer
{
    public function __construct()
    {
        $this->registerDefaults();
    }

    private function registerDefaults(): void
    {
        $this->set(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection());

        $this->set(MediaRepositoryInterface::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Repositories\MySQLMediaRepository(
            $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class)
        ));
        $this->set(PlaylistRepositoryInterface::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Repositories\MySQLPlaylistRepository(
            $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class)
        ));
        $this->set(PlaylistMediaRepositoryInterface::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Repositories\MySQLPlaylistMediaRepository(
            $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class)
        ));

        // Modules Agenda
        $this->set(\App\Domain\Agenda\Repositories\ProfesseurRepositoryInterface::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Repositories\MySQLProfesseurRepository(
            $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class)
        ));
        $this->set(\App\Domain\Agenda\Repositories\ClasseRepositoryInterface::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Repositories\MySQLClasseRepository(
            $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class)
        ));
        $this->set(\App\Domain\Agenda\Repositories\MachineRepositoryInterface::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Repositories\MySQLMachineRepository(
            $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class)
        ));
        $this->set(\App\Domain\Agenda\Repositories\ReservationRepositoryInterface::class, static fn (Container $c) => new \App\Infrastructure\Persistence\MySQL\Repositories\MySQLReservationRepository(
            $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class)
        ));

        $this->set(CreateMediaUseCase::class,  static fn (Container $c) => new CreateMediaUseCase($c->get(MediaRepositoryInterface::class)));
        $this->set(UpdateMediaUseCase::class,  static fn (Container $c) => new UpdateMediaUseCase($c->get(MediaRepositoryInterface::class)));
        $this->set(DeleteMediaUseCase::class,  static fn (Container $c) => new DeleteMediaUseCase(
            $c->get(MediaRepositoryInterface::class),
            $c->get(FileStorageInterface::class),
        ));
        $this->set(ListMediasUseCase::class,   static fn (Container $c) => new ListMediasUseCase($c->get(MediaRepositoryInterface::class)));
        $this->set(GetMediaByIdUseCase::class, static fn (Container $c) => new GetMediaByIdUseCase($c->get(MediaRepositoryInterface::class)));

        $this->set(MediaController::class, static fn (Container $c) => new MediaController(
            $c->get(CreateMediaUseCase::class),
            $c->get(UpdateMediaUseCase::class),
            $c->get(DeleteMediaUseCase::class),
            $c->get(ListMediasUseCase::class),
            $c->get(GetMediaByIdUseCase::class),
        ));

        // --- Information / Upload de fichiers (images & vidéos) ---
        // Le dossier `public/uploads/` est servi en statique par Apache et
        // protégé par un .htaccess (cf. app/backend/public/uploads/.htaccess).
        $this->set(FileStorageInterface::class, static fn () => new LocalFileStorage(
            storageDir: dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads',
            publicPrefix: '/uploads',
        ));
        $this->set(UploadMediaFileUseCase::class, static fn (Container $c) => new UploadMediaFileUseCase(
            $c->get(FileStorageInterface::class)
        ));
        $this->set(MediaUploadController::class, static fn (Container $c) => new MediaUploadController(
            $c->get(UploadMediaFileUseCase::class)
        ));

        // --- Agenda / Professeur ---
        $this->set(ListProfesseursUseCase::class,     static fn (Container $c) => new ListProfesseursUseCase($c->get(ProfesseurRepositoryInterface::class)));
        $this->set(GetProfesseurByIdUseCase::class,   static fn (Container $c) => new GetProfesseurByIdUseCase($c->get(ProfesseurRepositoryInterface::class)));
        $this->set(CreateProfesseurUseCase::class,    static fn (Container $c) => new CreateProfesseurUseCase($c->get(ProfesseurRepositoryInterface::class)));
        $this->set(UpdateProfesseurUseCase::class,    static fn (Container $c) => new UpdateProfesseurUseCase($c->get(ProfesseurRepositoryInterface::class)));
        $this->set(DeleteProfesseurUseCase::class,    static fn (Container $c) => new DeleteProfesseurUseCase($c->get(ProfesseurRepositoryInterface::class)));

        $this->set(ProfesseurController::class, static fn (Container $c) => new ProfesseurController(
            $c->get(ListProfesseursUseCase::class),
            $c->get(GetProfesseurByIdUseCase::class),
            $c->get(CreateProfesseurUseCase::class),
            $c->get(UpdateProfesseurUseCase::class),
            $c->get(DeleteProfesseurUseCase::class),
        ));

        // --- Agenda / Classe ---
        $this->set(ListClassesUseCase::class,     static fn (Container $c) => new ListClassesUseCase($c->get(ClasseRepositoryInterface::class)));
        $this->set(GetClasseByIdUseCase::class,   static fn (Container $c) => new GetClasseByIdUseCase($c->get(ClasseRepositoryInterface::class)));
        $this->set(CreateClasseUseCase::class,    static fn (Container $c) => new CreateClasseUseCase($c->get(ClasseRepositoryInterface::class)));
        $this->set(UpdateClasseUseCase::class,    static fn (Container $c) => new UpdateClasseUseCase($c->get(ClasseRepositoryInterface::class)));
        $this->set(DeleteClasseUseCase::class,    static fn (Container $c) => new DeleteClasseUseCase($c->get(ClasseRepositoryInterface::class)));

        $this->set(ClasseController::class, static fn (Container $c) => new ClasseController(
            $c->get(ListClassesUseCase::class),
            $c->get(GetClasseByIdUseCase::class),
            $c->get(CreateClasseUseCase::class),
            $c->get(UpdateClasseUseCase::class),
            $c->get(DeleteClasseUseCase::class),
        ));

        // --- Agenda / Machine ---
        $this->set(ListMachinesUseCase::class,     static fn (Container $c) => new ListMachinesUseCase($c->get(MachineRepositoryInterface::class)));
        $this->set(GetMachineByIdUseCase::class,   static fn (Container $c) => new GetMachineByIdUseCase($c->get(MachineRepositoryInterface::class)));
        $this->set(CreateMachineUseCase::class,    static fn (Container $c) => new CreateMachineUseCase($c->get(MachineRepositoryInterface::class)));
        $this->set(UpdateMachineUseCase::class,    static fn (Container $c) => new UpdateMachineUseCase($c->get(MachineRepositoryInterface::class)));
        $this->set(DeleteMachineUseCase::class,    static fn (Container $c) => new DeleteMachineUseCase($c->get(MachineRepositoryInterface::class)));

        $this->set(MachineController::class, static fn (Container $c) => new MachineController(
            $c->get(ListMachinesUseCase::class),
            $c->get(GetMachineByIdUseCase::class),
            $c->get(CreateMachineUseCase::class),
            $c->get(UpdateMachineUseCase::class),
            $c->get(DeleteMachineUseCase::class),
        ));

        // --- Information / Playlist ---
        $this->set(CreatePlaylistUseCase::class,  static fn (Container $c) => new CreatePlaylistUseCase($c->get(PlaylistRepositoryInterface::class)));
        $this->set(UpdatePlaylistUseCase::class,  static fn (Container $c) => new UpdatePlaylistUseCase($c->get(PlaylistRepositoryInterface::class)));
        $this->set(DeletePlaylistUseCase::class,  static fn (Container $c) => new DeletePlaylistUseCase($c->get(PlaylistRepositoryInterface::class)));
        $this->set(ListPlaylistsUseCase::class,   static fn (Container $c) => new ListPlaylistsUseCase($c->get(PlaylistRepositoryInterface::class)));
        $this->set(GetPlaylistByIdUseCase::class, static fn (Container $c) => new GetPlaylistByIdUseCase($c->get(PlaylistRepositoryInterface::class)));
        $this->set(GetActivePlaylistUseCase::class, static fn (Container $c) => new GetActivePlaylistUseCase(
            $c->get(PlaylistRepositoryInterface::class),
            $c->get(PlaylistMediaRepositoryInterface::class),
            $c->get(MediaRepositoryInterface::class),
        ));

        $this->set(PlaylistController::class, static fn (Container $c) => new PlaylistController(
            $c->get(CreatePlaylistUseCase::class),
            $c->get(UpdatePlaylistUseCase::class),
            $c->get(DeletePlaylistUseCase::class),
            $c->get(ListPlaylistsUseCase::class),
            $c->get(GetPlaylistByIdUseCase::class),
            $c->get(GetActivePlaylistUseCase::class),
        ));

        // --- Information / PlaylistMedia ---
        $this->set(ListPlaylistMediasUseCase::class,       static fn (Container $c) => new ListPlaylistMediasUseCase(
            $c->get(PlaylistRepositoryInterface::class),
            $c->get(PlaylistMediaRepositoryInterface::class),
        ));
        $this->set(AttachMediaToPlaylistUseCase::class,    static fn (Container $c) => new AttachMediaToPlaylistUseCase(
            $c->get(PlaylistRepositoryInterface::class),
            $c->get(PlaylistMediaRepositoryInterface::class),
        ));
        $this->set(UpdatePlaylistMediaOrdreUseCase::class, static fn (Container $c) => new UpdatePlaylistMediaOrdreUseCase($c->get(PlaylistMediaRepositoryInterface::class)));
        $this->set(DetachMediaFromPlaylistUseCase::class,  static fn (Container $c) => new DetachMediaFromPlaylistUseCase($c->get(PlaylistMediaRepositoryInterface::class)));

        $this->set(PlaylistMediaController::class, static fn (Container $c) => new PlaylistMediaController(
            $c->get(ListPlaylistMediasUseCase::class),
            $c->get(AttachMediaToPlaylistUseCase::class),
            $c->get(UpdatePlaylistMediaOrdreUseCase::class),
            $c->get(DetachMediaFromPlaylistUseCase::class),
        ));

        // --- Agenda / Reservation ---
        $this->set(CreateReservationUseCase::class,  static fn (Container $c) => new CreateReservationUseCase($c->get(ReservationRepositoryInterface::class)));
        $this->set(UpdateReservationUseCase::class,  static fn (Container $c) => new UpdateReservationUseCase($c->get(ReservationRepositoryInterface::class)));
        $this->set(DeleteReservationUseCase::class,  static fn (Container $c) => new DeleteReservationUseCase($c->get(ReservationRepositoryInterface::class)));
        $this->set(ListReservationsUseCase::class,   static fn (Container $c) => new ListReservationsUseCase($c->get(ReservationRepositoryInterface::class)));
        $this->set(GetReservationByIdUseCase::class, static fn (Container $c) => new GetReservationByIdUseCase($c->get(ReservationRepositoryInterface::class)));

        $this->set(ReservationController::class, static fn (Container $c) => new ReservationController(
            $c->get(CreateReservationUseCase::class),
            $c->get(UpdateReservationUseCase::class),
            $c->get(DeleteReservationUseCase::class),
            $c->get(ListReservationsUseCase::class),
            $c->get(GetReservationByIdUseCase::class),
        ));

        // --- Auth / Connexion par clé partagée ---
        // Les deux clés vivent dans le .env racine ; on les injecte au use case
        // pour que le domaine et l'application ne dépendent pas de la superglobale $_ENV.
        $this->set(LoginUseCase::class, static fn () => new LoginUseCase(
            adminKey: (string) ($_ENV['ADMIN_API_KEY'] ?? ''),
            profKey:  (string) ($_ENV['PROF_API_KEY'] ?? ''),
        ));
        $this->set(AuthController::class, static fn (Container $c) => new AuthController(
            $c->get(LoginUseCase::class),
        ));

        // --- Admin / Stockage ---
        // AlwaysData n'expose pas le quota via son API : c'est une constante de
        // config (octets). Par défaut 100 Mo (offre gratuite). On mesure nous-mêmes
        // l'occupation : dossier d'uploads + bases de données du projet.
        $this->set(StorageProbeInterface::class, static fn (Container $c) => new FilesystemStorageProbe(
            uploadsDir: dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads',
            connection: $c->get(\App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection::class),
            databaseNames: [
                EnvLoader::get('DB_INFORMATION', 'bts_aero_information'),
                EnvLoader::get('DB_AGENDA', 'bts_aero_agenda'),
            ],
        ));
        $this->set(GetStorageUsageUseCase::class, static fn (Container $c) => new GetStorageUsageUseCase(
            $c->get(StorageProbeInterface::class),
            (int) EnvLoader::get('DISK_QUOTA_BYTES', '104857600'),
        ));
        $this->set(StorageController::class, static fn (Container $c) => new StorageController(
            $c->get(GetStorageUsageUseCase::class),
        ));
    }
}
