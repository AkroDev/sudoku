# Supabase

Supabase fournit l'authentification par lien magique, la synchronisation des
parties des utilisateurs connectés et le Hall of Fame public. Le jeu et les
statistiques personnelles locales restent utilisables sans configuration
Supabase.

## Schéma suivi dans ce dépôt

Appliquer les migrations du dossier `migrations/` dans l'ordre chronologique
lors de la création d'un nouvel environnement :

1. `20261006150000_create_sudoku_completions.sql` crée les parties associées à
   un compte. RLS limite la lecture, l'insertion et la suppression aux lignes
   de l'utilisateur connecté ; aucune politique de mise à jour n'est créée.
2. `20261006170000_create_public_sudoku_leaderboard.sql` expose une première
   vue de classement à partir des parties de comptes.
3. `20261006180000_prevent_duplicate_sudoku_scores.sql` limite à une partie
   enregistrée par compte et par grille.
4. `20261006190000_create_anonymous_sudoku_scores.sql` crée la table dédiée aux
   scores publics, remplace la vue pour utiliser cette table et accorde à
   `anon` et `authenticated` l'insertion des scores ainsi que la lecture de la
   vue.

La dernière migration est la source du Hall of Fame actuel. La vue publie le
pseudo, la grille, le temps, les erreurs, les options et la date du score ; elle
n'expose pas l'e-mail, le `user_id` ni l'identifiant visiteur.

## Limites et sécurité

- Les tables sont protégées par RLS. Les clients anonymes et authentifiés
  peuvent insérer dans `sudoku_public_scores`, mais ne reçoivent pas de droit
  direct de lecture, modification ou suppression sur cette table.
- Les index uniques limitent les doublons par `visitor_id` et par grille, ou
  par compte connecté et par grille.
- `visitor_id`, le temps et les autres données du score viennent du navigateur.
  Un visiteur peut falsifier ces valeurs ou générer un nouvel identifiant : ces
  contrôles ne constituent pas une protection anti-triche ni une limitation
  forte du spam.
- La clé publishable/anon est destinée au navigateur ; ne jamais y placer une
  clé `service_role` ou une clé secrète.
- Les migrations ne sont pas appliquées automatiquement par l'application.
  Vérifier l'historique des migrations du projet avant toute opération distante.

## Projet distant

Le projet Supabase dédié à Sudoku est :

`https://czevkcnyrxywakzgsbpg.supabase.co`

La configuration locale attendue est documentée dans `.env.example`. Les
migrations de ce schéma ont été appliquées au projet dédié, d'après l'état
confirmé pendant la mise en place. Pour un nouvel environnement, vérifier son
propre historique et appliquer les migrations dans l'ordre.
