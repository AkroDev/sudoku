# Sudoku AkroLabs

Application Sudoku indépendante, destinée à s'intégrer à l'univers visuel d'AkroLabs.

## Fonctionnement

- La partie, sa reprise et les statistiques personnelles fonctionnent dans le
  navigateur.
- Supabase gère la connexion par lien magique, la synchronisation des parties
  des comptes connectés et le Hall of Fame public.
- Un pseudo suffit pour proposer un score au Hall of Fame ; aucun compte n'est
  nécessaire.
- Les scores publics sont déclaratifs : le serveur vérifie leur format et les
  doublons connus, mais ne rejoue pas la partie. Le classement n'est donc pas
  conçu comme un classement anti-triche.

Le projet utilise Next.js, React, TypeScript et Tailwind CSS. Le site vitrine
AkroLabs reste dans son dépôt Astro séparé : ce dépôt contient uniquement le
jeu Sudoku.

## Développement local

La version Node.js de référence est indiquée dans `.nvmrc`.

```bash
nvm install
nvm use
npm ci
npm run test
npm run dev
```

Sur Mac Apple Silicon, `node -p "process.arch"` doit renvoyer `arm64`.

## Configuration

Copier `.env.example` vers `.env.local`, puis renseigner les variables
Supabase. Sans ces variables, la partie et les statistiques locales restent
utilisables, mais les fonctions distantes (connexion et Hall of Fame) ne sont
pas disponibles.

`NEXT_PUBLIC_SUDOKU_START_SEED` et `NEXT_PUBLIC_SITE_URL` sont facultatives en
développement. En production, `NEXT_PUBLIC_SUDOKU_START_SEED=1` active le
catalogue public et `NEXT_PUBLIC_SITE_URL` définit l'URL absolue utilisée pour
les aperçus de partage.

## Numérotation de production

La numérotation publique est indépendante par difficulté et utilise quatre chiffres :
`F-0001`, `M-0001`, `D-0001` et `X-0001`.

Le développement local conserve par défaut la grille de travail `M-1927`. Le
catalogue de production numérote les grilles séparément par difficulté ; le
numéro public avance tandis que la graine technique reste interne à la
génération.

## Supabase

Le projet Supabase est séparé de ce dépôt. Les migrations versionnées se
trouvent dans [`supabase/migrations`](supabase/migrations) et doivent être
appliquées dans l'ordre lorsqu'on installe un nouvel environnement. La
configuration et les limites de sécurité du Hall of Fame sont détaillées dans
[`supabase/README.md`](supabase/README.md).

## Licence

Le code original du projet est soumis à la licence [PolyForm Noncommercial
1.0.0](LICENSE). Elle autorise la reprise et les modifications pour des usages
non commerciaux, sous réserve de conserver la licence et l'avis d'attribution.
L'usage commercial n'est pas autorisé par cette licence.

Les visuels du dossier `public/` sont exclus de cette licence et peuvent avoir
des conditions distinctes. Le dépôt est à code source disponible sous conditions
non commerciales ; il ne s'agit pas d'une licence Open Source approuvée par
l'OSI.

## Scripts

- `npm run dev` : serveur de développement
- `npm run build` : compilation de production
- `npm start` : serveur de production après compilation
- `npm test` : tests des règles métier
