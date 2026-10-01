# Guide développeur — Portail Hall AERO

Ce document s'adresse aux développeurs qui reprennent le projet. Il couvre **deux
sujets** : générer la documentation technique, et déployer l'application en ligne.

> Le projet est séparé en deux : `app/frontend` (React + Vite) et `app/backend`
> (PHP, architecture hexagonale). La documentation API est générée séparément
> pour chacun.

---

## 1. Générer la documentation technique

La doc HTML générée n'est **pas** versionnée (elle est dans `.gitignore`) : on la
régénère à la demande. Les fichiers de configuration, eux, sont versionnés.

### 1.1 Frontend (JSDoc)

Les composants et services sont commentés en JSDoc (style TypeScript). La doc est
produite par **JSDoc** + le plugin `jsdoc-plugin-typescript`.

**Installation des outils** (une fois par poste) :

```bash
npm install -g jsdoc jsdoc-plugin-typescript
```

> ⚠️ L'installation locale (`npm install --save-dev`) échoue actuellement à cause
> d'un bug d'`arborist` (npm 10.9) combiné à un protocole `workspace:` présent
> dans l'arbre `node_modules`. On installe donc ces deux outils **en global**.

**Génération :**

```bash
cd app/frontend
npm run docs
```

→ Sortie : `docs/api/frontend/index.html` (ouvrir dans un navigateur).

Configuration : `app/frontend/jsdoc.json`. Le script est défini dans
`app/frontend/package.json` (`"docs": "jsdoc -c jsdoc.json"`).

> Quelques avertissements `Unable to parse a tag's type expression` peuvent
> apparaître sur des types objets inline TypeScript (`{ active?: boolean }`) : ils
> sont **non bloquants**, la doc se génère quand même. Seul ce type précis n'est
> pas rendu.

### 1.2 Backend (phpDocumentor)

Le backend PHP est documenté avec **phpDocumentor** (fourni en `.phar`, non
versionné).

**Téléchargement de l'outil** (une fois) :

```bash
cd app/backend
curl -L https://github.com/phpDocumentor/phpDocumentor/releases/latest/download/phpDocumentor.phar -o phpDocumentor.phar
```

**Génération :**

```bash
cd app/backend
php phpDocumentor.phar
```

→ Sortie : `docs/api/backend/index.html` (classes, namespaces, graphes de
dépendances). Les graphes de classes nécessitent **Graphviz** (`dot`) installé ;
sinon ils sont simplement omis.

Configuration : `app/backend/phpdoc.dist.xml`.

---

## 2. Déployer en ligne

L'application se déploie en **deux temps** : on construit le frontend en fichiers
statiques, puis on assemble frontend + backend + `.env` selon une arborescence
précise sur l'hébergeur.

### 2.1 Construire le frontend

```bash
cd app/frontend
pnpm install
pnpm run build
```

> `npm run build` fonctionne aussi ; le projet utilise `pnpm` par convention.

Cela produit un dossier **`dist/`** contenant `index.html` + un dossier `assets/`.
Ce sont ces fichiers statiques qui seront servis au visiteur.

**Important — l'URL de l'API** : le frontend lit l'adresse du backend dans
`app/frontend/.env.production` :

```
VITE_API_URL=https://portail-aero.alwaysdata.net/api/public
```

Cette valeur est **figée dans le build** au moment du `pnpm run build`. Si l'URL du
backend change, il faut modifier ce fichier **puis rebuild**.

### 2.2 Arborescence cible sur l'hébergeur

Trois éléments à placer :

1. Le **contenu de `dist/`** → à la racine web servie.
2. Le **dossier `backend`** complet → à l'intérieur de cette racine web.
3. Le fichier **`.env`** (secrets du backend) → **un dossier au-dessus** de la
   racine du build.

```
dossier-parent/
├── .env                    ← secrets backend (BDD + clés API) — HORS racine web
└── racine-web/             ← ce que sert le serveur (= contenu de dist/)
    ├── index.html          ← issu de dist/
    ├── assets/             ← issu de dist/
    └── api/                ← le dossier app/backend renommé (voir note ci-dessous)
        ├── public/
        │   ├── index.php
        │   └── uploads/    ← doit être accessible en écriture
        ├── src/
        └── vendor/         ← généré par `composer install`
```

> **Nom du dossier backend = fin de `VITE_API_URL`.** Si l'URL se termine par
> `/api/public`, le dossier backend doit s'appeler **`api`** (et l'API est servie
> depuis `api/public/`). Si tu le laisses nommé `backend`, l'URL doit alors être
> `…/backend/public`. Les deux doivent correspondre, sinon le front ne joint pas
> l'API.

**Pourquoi le `.env` au-dessus de la racine web ?** Pour qu'il ne soit jamais
servi en HTTP (sécurité : il contient les identifiants BDD et les clés API). Le
script `app/backend/public/index.php` remonte l'arborescence (jusqu'à 6 niveaux)
depuis `public/` pour retrouver un fichier `../.env` — il le trouvera donc tant
qu'il est placé au-dessus du dossier `public`.

### 2.3 Préparer le backend

Sur la machine de déploiement (ou en local avant upload) :

```bash
cd app/backend
composer install --no-dev --optimize-autoloader
```

Cela génère le dossier `vendor/` (autoload PSR-4). Il doit être uploadé avec le
reste du backend.

### 2.4 Contenu du fichier `.env`

Le `.env` n'est **pas** versionné. Clés attendues (cf. `app/backend` et
`EnvLoader`) :

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_CHARSET=utf8mb4
DB_INFORMATION=      # nom de la base du module Information
DB_AGENDA=           # nom de la base du module Agenda
PROF_API_KEY=        # clé de connexion espace professeur
ADMIN_API_KEY=       # clé de connexion espace administrateur
DISK_QUOTA_BYTES=    # quota de stockage des médias (en octets)
```

Les scripts SQL de création des bases sont dans `docs/` (`portail-aero_*.sql`,
`Script_BDD_*.txt`).

### 2.5 Récapitulatif du déploiement

| Étape | Commande / action |
|-------|-------------------|
| 1. Build front | `cd app/frontend && pnpm run build` |
| 2. Dépendances back | `cd app/backend && composer install --no-dev` |
| 3. Upload | contenu de `dist/` → racine web ; dossier `backend` (renommé `api`) → dans la racine web |
| 4. `.env` | à placer **un dossier au-dessus** de la racine web |
| 5. Bases de données | importer les scripts SQL de `docs/` |
| 6. Droits | rendre `api/public/uploads/` accessible en écriture |

---

## 3. Mettre l'application sur l'écran (TV)

Voir aussi le [guide administrateur](guide-admin.md). En résumé, sur la TV
**Hisense (OS Vidaa)** :

1. Allumer la télévision.
2. Ouvrir l'application **« TV Browser »**.
3. Saisir l'URL de l'écran d'affichage : `https://<domaine>/ecran`
   (ex. `https://portail-aero.alwaysdata.net/ecran`).
4. Choisir le mode : **Information**, **Agenda** ou **Rotation**.

La route `/ecran` ne demande **aucune connexion** (mode kiosque public). Les modes
écran se rafraîchissent automatiquement (agenda : toutes les 60 s).
