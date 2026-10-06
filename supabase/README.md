# Supabase

Cette partie gère les statistiques personnelles et le Hall of Fame public.

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

La migration `20261006170000_create_public_sudoku_leaderboard.sql` a préparé la
vue de classement. La migration `20261006190000_create_anonymous_sudoku_scores.sql`
la remplace par une source publique dédiée : un joueur peut enregistrer son
score avec un pseudo, sans compte ni adresse e-mail. La vue n'expose ni
l'adresse e-mail, ni le `user_id`, ni l'identifiant anonyme du navigateur.

Les migrations doivent être appliquées dans l'ordre. La migration
`20261006180000_prevent_duplicate_sudoku_scores.sql` protège les scores privés,
et la migration `20261006190000_create_anonymous_sudoku_scores.sql` protège les
scores publics avec un score maximum par navigateur et par grille, ou par
compte et par grille lorsqu'un compte est disponible.

## Projet distant

Le projet Supabase dédié à Sudoku est :

`https://czevkcnyrxywakzgsbpg.supabase.co`

La configuration locale attendue est documentée dans `.env.example`. La clé
publishable/anon doit rester une variable d'environnement locale et ne doit pas
être remplacée par une clé secrète ou une clé `service_role` côté navigateur.
