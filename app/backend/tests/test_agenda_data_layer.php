<?php

/**
 * Script de test manuel pour la couche d'accès aux données de l'Agenda.
 *
 * Prérequis :
 *   1. XAMPP / MySQL doit tourner
 *   2. La base bts_aero_agenda doit exister (Script_BDD_agenda.txt)
 *   3. Les données de test doivent exister (Script_Insertion_données.txt)
 *
 * Usage : php tests/test_agenda_data_layer.php
 */

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Domain\Agenda\Entities\Professeur;
use App\Domain\Agenda\Entities\Classe;
use App\Domain\Agenda\Entities\Machine;
use App\Domain\Agenda\Entities\Reservation;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Repositories\MySQLProfesseurRepository;
use App\Infrastructure\Persistence\MySQL\Repositories\MySQLClasseRepository;
use App\Infrastructure\Persistence\MySQL\Repositories\MySQLMachineRepository;
use App\Infrastructure\Persistence\MySQL\Repositories\MySQLReservationRepository;
use App\Shared\Config\EnvLoader;

// Charger le .env à la racine du dépôt (LPMF_projet_stage/.env)
EnvLoader::load(__DIR__ . '/../../../.env');

// -- Couleurs console --
function ok(string $msg): void   { echo "\033[32m  ✔ {$msg}\033[0m" . PHP_EOL; }
function fail(string $msg): void { echo "\033[31m  ✘ {$msg}\033[0m" . PHP_EOL; }
function info(string $msg): void { echo "\033[36m  ℹ {$msg}\033[0m" . PHP_EOL; }
function title(string $msg): void { echo PHP_EOL . "\033[1;33m▶ {$msg}\033[0m" . PHP_EOL; }

$passed = 0;
$failed = 0;

function assert_true(bool $condition, string $label): void
{
    global $passed, $failed;
    if ($condition) {
        ok($label);
        $passed++;
    } else {
        fail($label);
        $failed++;
    }
}

// ============================================================
title('1. Test connexion à la base de données Agenda');
// ============================================================
try {
    $db = new DatabaseConnection();
    $pdo = $db->getAgendaConnection();
    assert_true($pdo instanceof PDO, 'Connexion PDO à bts_aero_agenda OK');
} catch (Throwable $e) {
    fail('Connexion échouée : ' . $e->getMessage());
    exit(1);
}

// ============================================================
title('2. Test instanciation des Repositories');
// ============================================================
try {
    $repoProf = new MySQLProfesseurRepository($db);
    $repoClasse = new MySQLClasseRepository($db);
    $repoMachine = new MySQLMachineRepository($db);
    $repoResa = new MySQLReservationRepository($db);
    assert_true(true, 'Tous les repositories instanciés OK');
} catch (Throwable $e) {
    fail('Instanciation échouée : ' . $e->getMessage());
    exit(1);
}

// ============================================================
title('3. Test READ sur Entités statiques (Professeur, Classe, Machine)');
// ============================================================
try {
    $profs = $repoProf->findAll();
    assert_true(count($profs) > 0, 'findAll() trouve des professeurs (' . count($profs) . ')');
    $profId = $profs[0]->id();
    assert_true($repoProf->findById($profId) instanceof Professeur, 'findById() trouve le premier professeur');

    $classes = $repoClasse->findAll();
    assert_true(count($classes) > 0, 'findAll() trouve des classes (' . count($classes) . ')');
    $classeId = $classes[0]->id();
    assert_true($repoClasse->findById($classeId) instanceof Classe, 'findById() trouve la première classe');

    $machines = $repoMachine->findAll();
    assert_true(count($machines) > 0, 'findAll() trouve des machines (' . count($machines) . ')');
    $machineId = $machines[0]->id();
    assert_true($repoMachine->findById($machineId) instanceof Machine, 'findById() trouve la première machine');
} catch (Throwable $e) {
    fail('READ entités statiques échoué : ' . $e->getMessage());
    exit(1);
}

// ============================================================
title('4. Test CRUD sur Reservation');
// ============================================================
try {
    // CREATE
    $debut = new DateTimeImmutable('2026-06-01 08:00:00');
    $fin = new DateTimeImmutable('2026-06-01 10:00:00');
    $resa = Reservation::create($debut, $fin, 'Travail sur le rotor principal', $profId, $classeId, $machineId);
    
    assert_true($resa->id() === null, 'Réservation créée sans ID (avant persistance)');
    
    $savedResa = $repoResa->save($resa);
    $resaId = $savedResa->id();
    assert_true($resaId !== null, "Réservation persistée avec ID = {$resaId}");
    
    // READ
    $foundResa = $repoResa->findById($resaId);
    assert_true($foundResa !== null, 'findById() retrouve la réservation');
    assert_true($foundResa->professeurId() === $profId, 'ID du professeur correct');
    assert_true($repoResa->exists($resaId), 'exists() retourne true');
    
    // READ ALL
    $allResas = $repoResa->findAll();
    assert_true(count($allResas) > 0, 'findAll() trouve des réservations');
    
    // UPDATE
    $nouveauFin = new DateTimeImmutable('2026-06-01 12:00:00');
    // On doit recréer l'objet ou utiliser la reflexion pour la mise à jour (pas de setter dans l'entité actuelle)
    // On va simuler qu'on veut étendre la durée, en recréant un objet avec le même ID
    $updatedResa = new Reservation(
        id: $resaId,
        debut: $debut,
        fin: $nouveauFin,
        description: 'Travail sur le rotor principal (durée étendue)',
        professeurId: $profId,
        classeId: $classeId,
        machineId: $machineId
    );
    $repoResa->save($updatedResa);
    $foundUpdated = $repoResa->findById($resaId);
    assert_true($foundUpdated->fin()->format('H:i') === '12:00', 'Update (fin changée) réussi');

    // DELETE
    $repoResa->delete($resaId);
    assert_true(!$repoResa->exists($resaId), 'exists() = false après suppression');
    
} catch (Throwable $e) {
    fail('CRUD Réservation échoué : ' . $e->getMessage());
    exit(1);
}

// ============================================================
// Résumé
// ============================================================
echo PHP_EOL . str_repeat('─', 40) . PHP_EOL;
echo "\033[1m  Résultat : {$passed} passés, {$failed} échoués\033[0m" . PHP_EOL;

if ($failed === 0) {
    echo "\033[32;1m  ✅ Tous les tests Agenda sont passés !\033[0m" . PHP_EOL;
} else {
    echo "\033[31;1m  ❌ Certains tests ont échoué.\033[0m" . PHP_EOL;
}
echo PHP_EOL;

exit($failed > 0 ? 1 : 0);
