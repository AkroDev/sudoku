# Supabase

Cette partie prépare la synchronisation des statistiques personnelles et les
futurs classements en ligne.

## Migration actuelle

`migrations/20261006150000_create_sudoku_completions.sql` crée une table qui
enregistre une partie terminée par utilisateur authentifié. Les informations
nécessaires pour comparer les temps et les aides utilisées sont conservées,
mais aucune politique publique de lecture n'est ouverte à ce stade.

Les statistiques locales restent la source de fonctionnement pour les visiteurs
non connectés. La synchronisation sera ajoutée avec le client Supabase lorsque
le projet distant et le parcours de connexion seront définis.

## Sécurité prévue

- chaque utilisateur authentifié ne peut lire, créer ou supprimer que ses
  propres parties ;
- les parties sont immuables côté application après leur création ;
- le Hall of Fame nécessitera plus tard une vue ou une fonction contrôlée,
  plutôt qu'un accès direct anonyme à toute la table.

La migration n'est pas appliquée automatiquement à un projet distant.

## Projet distant

Le projet Supabase dédié à Sudoku est :

`https://czevkcnyrxywakzgsbpg.supabase.co`

La configuration locale attendue est documentée dans `.env.example`. La clé
publishable/anon doit rester une variable d'environnement locale et ne doit pas
être remplacée par une clé secrète ou une clé `service_role` côté navigateur.
