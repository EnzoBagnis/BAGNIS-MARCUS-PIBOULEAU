<?php

/**
 * Script de test manuel pour la couche d'accès aux données Media.
 *
 * Prérequis :
 *   1. XAMPP / MySQL doit tourner
 *   2. La base bts_aero_information doit exister (lance docs/Script_BDD_information.txt)
 *
 * Usage : php tests/test_data_layer.php
 */

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Domain\Information\Entities\Media;
use App\Domain\Information\ValueObjects\MediaType;
use App\Infrastructure\Persistence\MySQL\Connection\DatabaseConnection;
use App\Infrastructure\Persistence\MySQL\Mappers\MediaMapper;
use App\Infrastructure\Persistence\MySQL\Repositories\MySQLMediaRepository;
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
title('1. Test connexion à la base de données');
// ============================================================
try {
    $db = new DatabaseConnection();
    $pdo = $db->getInformationConnection();
    assert_true($pdo instanceof PDO, 'Connexion PDO à bts_aero_information OK');
} catch (Throwable $e) {
    fail('Connexion échouée : ' . $e->getMessage());
    echo PHP_EOL . "⚠  Vérifie que MySQL tourne et que la base bts_aero_information existe." . PHP_EOL;
    echo "   Lance le script : docs/Script_BDD_information.txt" . PHP_EOL;
    exit(1);
}

// ============================================================
title('2. Test instanciation du Repository');
// ============================================================
try {
    $repo = new MySQLMediaRepository($db);
    assert_true(true, 'MySQLMediaRepository instancié OK');
} catch (Throwable $e) {
    fail('Instanciation échouée : ' . $e->getMessage());
    exit(1);
}

// ============================================================
title('3. Test CREATE (save d\'un nouveau média)');
// ============================================================
try {
    $media = Media::create(
        titre: 'Test Média - ' . date('H:i:s'),
        type: MediaType::Image,
        urlFichier: '/uploads/test_image.jpg',
        contenuTexte: null,
        dureeSec: null,
        actif: true,
    );
    assert_true($media->id() === null, 'Média créé sans ID (avant persistance)');

    $saved = $repo->save($media);
    assert_true($saved->id() !== null, 'Média persisté avec ID = ' . $saved->id());
    assert_true($saved->titre() === $media->titre(), 'Titre conservé après save');
    assert_true($saved->type() === MediaType::Image, 'Type MediaType::Image conservé');
    assert_true($saved->actif() === true, 'Actif = true conservé');

    $createdId = $saved->id();
} catch (Throwable $e) {
    fail('CREATE échoué : ' . $e->getMessage());
    exit(1);
}

// ============================================================
title('4. Test READ (findById)');
// ============================================================
try {
    $found = $repo->findById($createdId);
    assert_true($found !== null, "findById({$createdId}) retourne un résultat");
    assert_true($found->id() === $createdId, 'ID correspond');
    assert_true($found->type() === MediaType::Image, 'Type reconstruit correctement depuis la BDD');
    assert_true($found->dateAjout() instanceof DateTimeImmutable, 'dateAjout est un DateTimeImmutable');
} catch (Throwable $e) {
    fail('READ échoué : ' . $e->getMessage());
    exit(1);
}

// ============================================================
title('5. Test READ (findAll)');
// ============================================================
try {
    $all = $repo->findAll();
    assert_true(is_array($all), 'findAll() retourne un array');
    assert_true(count($all) >= 1, 'findAll() contient au moins 1 élément');

    $allActifs = $repo->findAll(true);
    assert_true(is_array($allActifs), 'findAll(true) retourne un array');
    info('findAll() = ' . count($all) . ' médias, findAll(true) = ' . count($allActifs) . ' actifs');
} catch (Throwable $e) {
    fail('findAll échoué : ' . $e->getMessage());
}

// ============================================================
title('6. Test UPDATE (save d\'un média existant)');
// ============================================================
try {
    $found->renommer('Titre Modifié');
    $updated = $repo->save($found);
    assert_true($updated->titre() === 'Titre Modifié', 'Titre modifié après update');
    assert_true($updated->id() === $createdId, 'ID inchangé après update');
} catch (Throwable $e) {
    fail('UPDATE échoué : ' . $e->getMessage());
}

// ============================================================
title('7. Test EXISTS');
// ============================================================
try {
    assert_true($repo->exists($createdId), "exists({$createdId}) = true");
    assert_true(!$repo->exists(999999), 'exists(999999) = false');
} catch (Throwable $e) {
    fail('EXISTS échoué : ' . $e->getMessage());
}

// ============================================================
title('8. Test DELETE');
// ============================================================
try {
    $repo->delete($createdId);
    assert_true(!$repo->exists($createdId), "Média {$createdId} supprimé, exists() = false");
    assert_true($repo->findById($createdId) === null, "findById({$createdId}) = null après suppression");
} catch (Throwable $e) {
    fail('DELETE échoué : ' . $e->getMessage());
}

// ============================================================
title('9. Test MediaMapper (conversion manuelle)');
// ============================================================
try {
    $row = [
        'id' => '42',
        'titre' => 'Test Mapper',
        'type' => 'video',
        'url_fichier' => '/videos/test.mp4',
        'duree_sec' => '120',
        'actif' => '1',
        'date_ajout' => '2026-01-15 10:30:00',
    ];
    $mapped = MediaMapper::toDomain($row);
    assert_true($mapped->id() === 42, 'ID casté en int');
    assert_true($mapped->type() === MediaType::Video, 'Type converti en MediaType::Video');
    assert_true($mapped->dureeSec() === 120, 'Durée castée en int');
    assert_true($mapped->actif() === true, 'Actif casté en bool');
    assert_true($mapped->dateAjout() instanceof DateTimeImmutable, 'Date convertie en DateTimeImmutable');
} catch (Throwable $e) {
    fail('MediaMapper échoué : ' . $e->getMessage());
}

// ============================================================
// Résumé
// ============================================================
echo PHP_EOL . str_repeat('─', 40) . PHP_EOL;
echo "\033[1m  Résultat : {$passed} passés, {$failed} échoués\033[0m" . PHP_EOL;

if ($failed === 0) {
    echo "\033[32;1m  ✅ Tous les tests sont passés !\033[0m" . PHP_EOL;
} else {
    echo "\033[31;1m  ❌ Certains tests ont échoué.\033[0m" . PHP_EOL;
}
echo PHP_EOL;

exit($failed > 0 ? 1 : 0);
