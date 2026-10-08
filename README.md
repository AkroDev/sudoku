# Sudoku AkroLabs

Application Sudoku indépendante, destinée à s'intégrer à l'univers visuel d'AkroLabs.

## Direction technique

- Next.js
- React
- TypeScript
- Tailwind CSS
- V1 locale dans le navigateur
- Supabase préparé localement pour les comptes, les scores et le Hall of Fame

Le site vitrine AkroLabs reste dans son dépôt Astro séparé. Ce dépôt contient uniquement l'application Sudoku.

## Développement local

La version Node.js de référence est indiquée dans `.nvmrc`.

```bash
nvm install
nvm use
npm install
npm run dev
```

Sur Mac Apple Silicon, `node -p "process.arch"` doit renvoyer `arm64`.

## Numérotation de production

La numérotation publique est indépendante par difficulté et utilise quatre chiffres :
`F-0001`, `M-0001`, `D-0001` et `X-0001`.

Le développement local conserve par défaut la grille de travail `M-1927`. Pour
le build de production, définir `NEXT_PUBLIC_SUDOKU_START_SEED=1` dans
l'environnement de déploiement. Cette valeur active aussi le catalogue de
production : le numéro public avance sans trous, tandis que la graine technique
reste interne à la génération.

## État

Dépôt initialisé avec une V1 locale fonctionnelle. Le schéma Supabase est préparé
localement, mais son application distante et l'authentification restent à cadrer.
