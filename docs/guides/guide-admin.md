# Guide administrateur — Portail Hall AERO

Ce guide explique, pas à pas, comment utiliser l'**espace administrateur** :
gérer les professeurs, classes et machines, créer des médias et des playlists, et
mettre l'affichage sur l'écran du hall.

---

## 1. Se connecter à l'espace admin

1. Ouvrir le site dans un navigateur (ordinateur). : portail-aero.alwaysdata.net
2. Sur la page de connexion, saisir la **clé d'accès administrateur**.
3. Cliquer sur **« Se connecter »**.

> Il n'y a **qu'un seul champ** : une clé partagée. Selon que la clé saisie
> correspond à la clé **admin** ou à la clé **professeur**, vous êtes dirigé vers
> le bon espace. La clé admin ouvre le **Panneau d'Administration**.
>
> Cochez « Rester connecté sur ce poste » uniquement sur un ordinateur de
> confiance.

Le panneau est organisé en trois sections (accessibles par le menu latéral) :
**Stockage**, **Agenda** (professeurs / machines / classes) et **Médias &
Playlists**.

---

## 2. Gérer l'agenda : professeurs, machines, classes

Ces trois gestions se trouvent dans la section **Agenda** du panneau. Le
fonctionnement est identique : un formulaire d'ajout en haut, la liste en dessous
(avec recherche et suppression).

### 2.1 Ajouter un professeur

1. Dans **« Gestion des Professeurs »**, renseigner le **Prénom** et le **Nom**.
2. Cliquer sur **« Ajouter le professeur »**.

Le professeur apparaît dans « Professeurs enregistrés ». Pour en **supprimer** un,
cliquer sur la croix **✕** à côté de son nom.

### 2.2 Ajouter une machine

1. Dans **« Gestion des Machines »**, saisir le **Nom de la machine**
   (ex. « Imprimante 3D »).
2. Choisir le **Type / Catégorie** : **Avion** ou **Helicoptere**.
3. Cliquer sur **« Ajouter la machine »**.

Chaque machine reçoit une pastille de couleur (réutilisée dans le planning).
Suppression via la croix **✕**.

### 2.3 Ajouter une classe

1. Dans **« Gestion des Classes »**, saisir le **Nom de la classe / Promotion**
   (ex. « Promotion A »).
2. Cliquer sur **« Ajouter la classe »**.

Suppression via la croix **✕**.

> 🔎 Chaque liste possède une **barre de recherche** pour filtrer rapidement quand
> il y a beaucoup d'entrées.

---

## 3. Créer et gérer les médias

Section **« Médias & Playlists » → Bibliothèque de médias**. Un média est un
contenu affiché à l'écran : **image**, **vidéo** ou **texte**.

### 3.1 Créer un média

1. Saisir un **Titre** (ex. « Affiche portes ouvertes »).
2. Choisir le **Type de média** :
   - **Image** ou **Vidéo** → un champ **Fichier** apparaît : sélectionner le
     fichier à téléverser.
   - **Texte** → un champ **Contenu texte** apparaît : saisir le message qui sera
     affiché en plein écran.
3. Renseigner la **Durée (en secondes)** = temps d'affichage à l'écran.
   - Pour une **vidéo**, la durée est **détectée automatiquement** dès que le
     fichier est sélectionné (modifiable ensuite).
4. Cliquer sur **« Ajouter le média »**.

### 3.2 Modifier ou activer un média

Dans la liste **« Médias enregistrés »** :

- **Modifier le titre, la durée ou le texte** : cliquer directement sur la valeur,
  taper la nouvelle valeur, puis `Entrée` (ou cliquer ailleurs) pour valider —
  `Échap` pour annuler.
- **Activer / désactiver** : la case **« Actif »**. Seuls les médias actifs sont
  diffusés à l'écran.
- **Supprimer** : la croix **✕** (demande une confirmation).

---

## 4. Créer et composer une playlist

Section **« Médias & Playlists » → Gestion des playlists**. Une playlist est une
suite ordonnée de médias diffusée en boucle sur l'écran.

### 4.1 Créer une playlist

1. Saisir le **Nom de la nouvelle playlist** (ex. « Écran Accueil — Alternants »).
2. Cliquer sur **« Créer la playlist »**.

### 4.2 Composer la playlist (ajouter / ordonner les médias)

1. **Cliquer sur la playlist** dans la liste pour la sélectionner (la section
   « Composition » s'ouvre).
2. Dans le menu déroulant **« Ajouter un média »**, choisir un média puis cliquer
   sur **« Ajouter »**. Répéter pour chaque média.
3. **Réordonner** : glisser-déposer les médias dans la liste (poignée ⠿) pour
   changer l'ordre de diffusion. L'ordre est enregistré automatiquement.
4. **Retirer** un média : bouton **« Retirer »** sur la ligne concernée.

### 4.3 Activer la playlist

Dans la liste des playlists, cocher la case **« Active »**. C'est la (ou les)
playlist(s) active(s) qui alimente(nt) le **Mode Rotation** de l'écran.

Suppression d'une playlist : croix **✕** (supprime aussi sa composition, avec
confirmation).

---

## 5. Suivi du stockage

La section **« Stockage »** (carte en haut du panneau) affiche l'espace disque
consommé par les fichiers téléversés (images / vidéos) par rapport au quota
configuré. Pensez à supprimer les médias obsolètes si l'espace se remplit.

---

## 6. Mettre le site sur l'écran du hall

Sur la télévision **Hisense (OS Vidaa)** :

1. **Allumer** la télévision.
2. Ouvrir l'application **« TV Browser »** (la chercher dans les applications de
   la TV).
3. Normalement la page s'ouvre toute seule dans le cas contraire saisir l'adresse de l'écran : **`https://<domaine>/ecran`**
   (ex. `https://portail-aero.alwaysdata.net/ecran`).
4. Choisir le mode à afficher :
   - **Information** — diffusion des médias et playlists actives.
   - **Agenda** — planning des réservations des machines.
   - **Rotation** — alternance automatique des écrans.

> L'écran ne demande **aucune connexion** et se met à jour tout seul (le planning
> se rafraîchit toutes les 60 secondes). Pour changer de mode, il suffit de
> revenir à l'adresse `/ecran`.
>
> 💡 Astuce vidéo : les vidéos au format **vertical** s'affichent centrées avec
> des bandes latérales (et non étirées), y compris sur le navigateur Vidaa.
