# Frontend LPMF — Guide d'utilisation

Stack : **Vite 5 + React 18 + react-router v7 + JSX** (JavaScript pur, pas de TypeScript).
Package manager : **pnpm**.

---

## 1. Prérequis

- **Node.js 18+** installé (vérifie avec `node -v`)
- **pnpm** installé en global (vérifie avec `pnpm -v`)
  - Si tu ne l'as pas : `npm install -g pnpm`

---

## 2. Première installation

Depuis la racine du dépôt :

```powershell
cd app\frontend
pnpm install
```

Cela crée le dossier `node_modules/` (ignoré par git) et installe React, react-router et Vite.

---

## 3. Lancer en développement

```powershell
pnpm dev
```

- Le serveur Vite démarre sur **http://localhost:5173**
- Tu arrives par défaut sur `/login` (page placeholder pour l'instant, sera remplacée par le vrai espace de connexion plus tard)
- Hot Module Replacement (HMR) activé : toute modif d'un `.jsx` se reflète instantanément dans le navigateur
- Pour stopper : `Ctrl+C` dans le terminal

**Important** : le backend PHP tourne en parallèle sur **XAMPP / Apache** à `http://localhost/LPMF_projet_stage/...`. Les deux serveurs cohabitent — Vite sert le front (port 5173), Apache sert l'API PHP. Le backend a déjà le CORS activé.

---

## 4. Build de production

```powershell
pnpm build
```

- Génère le dossier `dist/` (ignoré par git) contenant l'app compilée et minifiée
- C'est ce dossier qui sera déployé en production (servi par Apache plus tard)

Pour prévisualiser le build localement :

```powershell
pnpm preview
```

→ http://localhost:4173

---

## 5. Routes disponibles

Le projet sera déployé sur **alwaysdata**. Deux usages cohabitent :

- **Utilisateurs** (profs / admin sur ordi ou téléphone) → entrent par `/` puis `/login`.
- **Téléviseur** en mode kiosque (écran fixe sur place) → ouvre directement une URL `/ecran/...`.

| URL | Public | Page | Fichier |
|-----|--------|------|---------|
| `/` | Utilisateurs | Redirige vers `/login` | — |
| `/login` | Utilisateurs | Espace de connexion (placeholder pour l'instant) | `src/app/pages/LoginPlaceholderPage.jsx` |
| `/ecran` | TV | Redirige vers `/ecran/info` | — |
| `/ecran/info` | TV | Écran Information (affichage médias) | `src/features/information/pages/InformationPage.jsx` |
| `/ecran/agenda` | TV | Écran Agenda (réservations) | `src/features/agenda/pages/AgendaPage.jsx` |
| `*` (tout le reste) | — | Page 404 | `src/app/pages/NotFoundPage.jsx` |

> Les écrans `/ecran/*` n'ont volontairement **aucun lien public** depuis l'app utilisateur. La TV doit être configurée pour démarrer directement sur l'URL voulue (cf. mode kiosque, issue #52).

Les définitions de routes sont centralisées dans **`src/infrastructure/router/router.jsx`**, avec les constantes `ROUTES` (à importer plutôt que de hard-coder les URL).

Exemple :

```jsx
import { Link } from 'react-router';
import { ROUTES } from '@/infrastructure/router/router.jsx';

<Link to={ROUTES.ecranAgenda}>Agenda</Link>
```

---

## 6. Arborescence

```
app/frontend/
├── index.html                ← point d'entrée HTML (Vite)
├── package.json
├── vite.config.js            ← config Vite + alias "@" → src/
├── jsconfig.json             ← support de l'alias dans l'éditeur
├── public/                   ← fichiers statiques copiés tels quels
└── src/
    ├── main.jsx              ← bootstrap React (createRoot)
    ├── app/
    │   ├── App.jsx           ← racine de l'app, monte le RouterProvider
    │   ├── layouts/
    │   │   └── EcranLayout.jsx   ← wrapper des routes /ecran/*
    │   └── pages/
    │       └── NotFoundPage.jsx
    ├── features/             ← une feature = un module métier
    │   ├── information/pages/InformationPage.jsx
    │   └── agenda/pages/AgendaPage.jsx
    ├── core/                 ← (vide pour l'instant) entities, repositories, services
    ├── infrastructure/
    │   ├── router/router.jsx ← définition des routes
    │   ├── api/              ← (à venir) appels HTTP vers le backend
    │   └── http/             ← (à venir) client HTTP de bas niveau
    ├── shared/               ← composants / utilitaires réutilisables
    └── styles/global.css
```

L'alias `@` pointe vers `src/`. Donc :

```jsx
import App from '@/app/App.jsx';        // = src/app/App.jsx
```

---

## 7. Comment ajouter une nouvelle route

Exemple : ajouter `/ecran/admin`.

1. Créer la page :
   ```
   src/features/admin/pages/AdminPage.jsx
   ```
   ```jsx
   export default function AdminPage() {
     return <main className="ecran-page"><h1>Admin</h1></main>;
   }
   ```

2. L'ajouter dans `src/infrastructure/router/router.jsx` :
   ```jsx
   import AdminPage from '@/features/admin/pages/AdminPage.jsx';

   export const ROUTES = {
     // ...
     ecranAdmin: '/ecran/admin',
   };

   // dans le children du layout /ecran :
   { path: 'admin', element: <AdminPage /> },
   ```

3. C'est tout. Le HMR Vite recharge tout seul.

---

## 8. Commandes utiles (résumé)

| Commande | Effet |
|----------|-------|
| `pnpm install` | Installe / met à jour les dépendances |
| `pnpm dev` | Lance le serveur de dev (port 5173) |
| `pnpm build` | Build de production dans `dist/` |
| `pnpm preview` | Prévisualise le build de prod (port 4173) |

---

## 9. Liens vers les prochaines issues

Cette PR (#48) ne pose que **le router + le scaffold**. Les fonctionnalités viendront :

- **#49** — Composant lecteur média plein écran (image / vidéo / texte) → dans `src/features/information/components/`
- **#50** — Logique de rotation automatique selon `duree_sec`
- **#51** — Récupération de la playlist active depuis l'API → dans `src/infrastructure/api/`
- **#52** — Mode kiosque (plein écran, masquage curseur) → probablement dans `EcranLayout.jsx`
