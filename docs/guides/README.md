# Documentation — Portail Hall AERO

Point d'entrée de la documentation du projet. Trois guides selon le profil.

## 📚 Guides

| Guide | Pour qui | Contenu |
|-------|----------|---------|
| [Guide développeur](guide-developpeur.md) | Développeurs | Générer la doc technique (front + back), déployer en ligne, mettre à l'écran |
| [Guide administrateur](guide-admin.md) | Administrateurs | Gérer professeurs / classes / machines, créer médias & playlists, afficher sur l'écran |
| [Guide professeur](guide-professeur.md) | Professeurs | Se connecter, réserver une machine (créneau, récurrence, modification) |

## 🗂️ Autres ressources de `docs/`

- **Schémas** : `schema_architecture.puml`, `schema_bdd.puml`, `schema_mcd.mmd`
- **Bases de données** : `portail-aero_agenda.sql`, `portail-aero_information.sql`,
  `Script_BDD_*.txt`, `Script_Insertion_données.txt`
- **Cahier des charges** : `Cahier-des-charges.pdf`

## 🔧 Documentation API générée

La documentation API HTML (JSDoc pour le frontend, phpDocumentor pour le backend)
n'est **pas versionnée** : voir le [guide développeur](guide-developpeur.md#1-générer-la-documentation-technique)
pour la régénérer. Sortie : `docs/api/frontend/` et `docs/api/backend/`.
