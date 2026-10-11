'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export type Locale = 'fr' | 'en';

const english: Record<string, string> = {
  'GRILLE': 'GRID',
  'Options actives': 'Active options',
  'Options': 'Settings',
  'Surbrillance': 'Highlighting',
  'Vérification': 'Error checking',
  'Vérification des erreurs': 'Error checking',
  'Notes': 'Notes',
  'Facile': 'Easy',
  'Moyen': 'Medium',
  'Difficile': 'Hard',
  'Expert': 'Expert',
  'Difficulté': 'Difficulty',
  'Se connecter pour synchroniser mes statistiques': 'Sign in to sync your stats',
  'Se déconnecter': 'Sign out',
  'Adresse e-mail': 'Email address',
  'Lien envoyé. Consultez votre boîte mail.': 'Link sent. Check your inbox.',
  'On change de grille ?': 'Ready for a new puzzle?',
  'La progression actuelle ne sera pas conservée.': 'Your current progress will not be saved.',
  'Rester sur cette grille': 'Stay on this puzzle',
  'Oui, nouvelle grille': 'Yes, new puzzle',
  'On remet les compteurs à zéro ?': 'Start this puzzle over?',
  'La grille actuelle sera conservée, mais votre progression sera effacée.': 'The current puzzle will stay, but your progress will be cleared.',
  'Continuer': 'Continue',
  'Recommencer': 'Restart',
  'Bienvenue dans le Sudoku AkroLabs': 'Welcome to AkroLabs Sudoku',
  'Faites travailler vos neurones à votre rythme. Difficulté, aides et statistiques se cachent sous la roue dentée.': 'Give your brain a workout at your own pace. Choose a difficulty, hints and stats under the gear.',
  'J’ai compris, on peut cacher cette fenêtre.': 'Got it — you can hide this window next time.',
  'C’est parti': 'Let’s play',
  'Cette grille a déjà été jouée': 'You have already played this puzzle',
  'Vous pouvez la recommencer et modifier les options si vous le souhaitez. Votre nouveau score ne sera pas ajouté au Hall of Fame.': 'You can replay it and change the settings if you like. Your new score will not be added to the Hall of Fame.',
  'Rester sur le résultat': 'Keep my result',
  'Rejouer la grille': 'Replay puzzle',
  'Voir mon résultat': 'View my result',
  'Nouvelle partie': 'New game',
  'Nouvelle grille': 'New puzzle',
  'Case {{number}}': 'Cell {{number}}',
  'Grille Sudoku': 'Sudoku grid',
  'Grille 9 par 9': '9 by 9 grid',
  'Saisie des chiffres': 'Number pad',
  'Effacer': 'Clear',
  'Pause': 'Pause',
  'Reprendre': 'Resume',
  'Notes : ': 'Notes: ',
  'Pénalités': 'Penalties',
  'Oups ! +15 s sur le chrono': 'Oops! +15 sec penalty',
  'Chronomètre': 'Timer',
  'Statistiques personnelles': 'Personal stats',
  'Parties terminées': 'Games completed',
  'Meilleur temps': 'Best time',
  'Temps moyen': 'Average time',
  'Erreurs': 'Mistakes',
  'Hall of Fame': 'Hall of Fame',
  'Classement': 'Leaderboard',
  'Statistiques par difficulté': 'Stats by difficulty',
  'Historique': 'History',
  'Toutes les grilles': 'All puzzles',
  'Filtrer le classement': 'Filter leaderboard',
  'Toutes': 'All',
  'Avec': 'With',
  'Sans': 'Without',
  'Activée': 'On',
  'Désactivée': 'Off',
  'Quelle grille voulez-vous jouer ?': 'Which puzzle would you like to play?',
  'Ouvrir la grille': 'Open puzzle',
  'En attente d’un nouveau champion': 'Waiting for a new champion',
  'Éternel second ?': 'Always the runner-up?',
  'Le podium, c’est déjà bien': 'A podium finish is still pretty good',
  'Place {{place}}, {{nickname}}, {{errors}}{{grid}}': 'Rank {{place}}, {{nickname}}, {{errors}}{{grid}}',
  '{{count}} erreur': '{{count}} mistake',
  '{{count}} erreurs': '{{count}} mistakes',
  '{{count}} err.': '{{count}} err.',
  'Difficulté : {{difficulty}}': 'Difficulty: {{difficulty}}',
  'Notes utilisées': 'Notes used',
  'Surbrillance active': 'Highlighting on',
  'Vérification des erreurs active': 'Error checking on',
  'Options utilisées': 'Options used',
  'Voir mes statistiques détaillées': 'View detailed stats',
  'STATISTIQUES PERSONNELLES': 'PERSONAL STATS',
  'Grille': 'Puzzle',
  'Temps': 'Time',
  'Date': 'Date',
  'Sudoku': 'Sudoku',
  'HALL OF FAME': 'HALL OF FAME',
  'Bravo, partie terminée !': 'Well done, puzzle complete!',
  'Temps final': 'Final time',
  'activée': 'on',
  'désactivée': 'off',
  'Fermer la fenêtre de fin de partie': 'Close completion dialog',
  'Fermer': 'Close',
  'Votre pseudo': 'Your nickname',
  'Enregistrer mon score': 'Submit my score',
  'Votre pseudo sera visible dans le Hall of Fame.': 'Your nickname will appear in the Hall of Fame.',
  'Hall of Fame ↗': 'Hall of Fame ↗',
  'Lien copié !': 'Link copied!',
  'Partager ma victoire': 'Share my win',
  'Soutenir mes projets open-source': 'Support my open-source projects',
  'Cours du Bitcoin': 'Bitcoin price',
  'Voir mes projets GitHub': 'Explore my GitHub projects',
  'Bitcoin on-chain': 'Bitcoin on-chain',
  'QR code Bitcoin on-chain': 'Bitcoin on-chain QR code',
  'Adresse copiée': 'Address copied',
  'Copier l’adresse': 'Copy address',
  'À venir': 'Coming soon',
  'Adresse Lightning': 'Lightning address',
  'QR Lightning bientôt disponible.': 'Lightning QR code coming soon.',
  'Je viens de terminer la grille #{{grid}} en {{time}}. À toi de jouer !': 'I just completed puzzle #{{grid}} in {{time}}. Your turn!',
  'Une nouvelle grille t’attend.': 'A new puzzle is waiting for you.',
  'À toi de jouer !': 'Your turn!',
  'GRILLE #{{grid}}': 'PUZZLE #{{grid}}',
  'Bitcoin · Puzzles · Open-source': 'Bitcoin · Puzzles · Open source',
  'English': 'English',
  'Français': 'French',
  'Appuyez sur Entrée pour saisir le chiffre': 'Press Enter to enter the number',
};

type TranslationValues = Record<string, string | number>;
type LocaleContextValue = { locale: Locale; t: (text: string, values?: TranslationValues) => string };

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'fr',
  t: (text) => text,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const locale: Locale = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr';

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (text: string, values?: TranslationValues) => {
    let translated = locale === 'en' ? english[text] ?? text : text;
    for (const [key, value] of Object.entries(values ?? {})) {
      translated = translated.replaceAll(`{{${key}}}`, String(value));
    }
    return translated;
  };

  return <LocaleContext.Provider value={{ locale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocaleText() {
  return useContext(LocaleContext);
}

export function localizedPath(path: string, locale: Locale) {
  const unprefixedPath = path === '/en' ? '/' : path.startsWith('/en/') ? path.slice(3) : path;
  const languagePath = locale === 'en'
    ? unprefixedPath.replace('/sudoku/statistiques', '/sudoku/statistics')
    : unprefixedPath.replace('/sudoku/statistics', '/sudoku/statistiques');
  return locale === 'en' ? (languagePath === '/' ? '/en' : `/en${languagePath}`) : languagePath;
}
