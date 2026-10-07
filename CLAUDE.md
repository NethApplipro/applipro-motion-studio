# Studio motion Applipro — règles

Studio de films produit Applipro en code (Remotion + React). Le modèle écrit le programme, le programme dessine les images, le moteur de rendu en fait un film, la critique décide s'il sort.

## Commandes
- `npm run studio` : aperçu interactif (props modifiables en direct dans le panneau de droite).
- `npm run stills -- <Film> <format> [frames…]` : images fixes de contrôle dans `reviews/<Film>/<format>/stills/`.
- `npm run render -- <Film> [formats…]` : MP4 dans `out/` (H.264 CRF 16, son normalisé à -14 LUFS).
- `npm run critic -- out/<id>.mp4` : planche contact, test téléphone 360 px, boucle, loudness → `reviews/<id>/`.
- `node scripts/determinism.mjs <id> <frame>` : la même image rendue deux fois doit avoir le même hash.
- `npm run sfx` : régénère les sons de synthèse ; `node scripts/build-icons.mjs` : ajoute des icônes Remix.
- `npm run typecheck` avant chaque rendu.

## Organisation
- `brand/logo-mark.svg` et `src/components/Logo.tsx` : symbole officiel (un seul tracé, animable avec `draw`).
- `brand/brand.json` : seule source de la charte (Poppins, palette officielle, baseline). Ne jamais coder une couleur en dur ailleurs.
- `films/<film>/` : `brief.md`, `style-guide.md` et `shotlist.md`, écrits et validés AVANT le code.
- `src/films/<film>/timeline.ts` : toute la chronologie et les sons. Une frame = un nombre, à un seul endroit.
- `src/components/app/` : écrans de l'app redessinés d'après `references/applipro-ui/`. Ne jamais inventer un écran ni une fonctionnalité qui n'existe pas.
- `reviews/` : contrôles et notes de critique. `out/` : rendus (non versionnés).

## Règles de rendu (non négociables)
- Chaque image est une **fonction pure du temps** (`useCurrentFrame`). Pas de transition CSS, de `setTimeout`, de `Math.random()` ni de `Date`.
- Aléatoire uniquement via `mulberry32(seed)` (`src/lib/motion.ts`).
- Mouvement : `sp()` et `track()` avec les presets `snappy`, `default`, `heavy` ou `playful`. Pas de rebond, sauf `playful` assumé.
- Polices et sons servis en local (`public/`). Aucun appel réseau pendant le rendu.
- Formats 9:16, 1:1 et 16:9 **recomposés** via `useFormat()`, jamais recadrés.

## Règles de style
- Interdits : titre centré sur un dégradé dès l'ouverture, fondus partout, glow, labels dans les coins, plus d'une couleur d'accent.
- Accent = bleu Applipro `#3374FF`. Texte foncé = `#0E0E52`. Le dégradé de marque est réservé à la clôture.
- Un événement à l'écran toutes les 2 à 4 s, calé sur la grille de 120 BPM (1 temps = 15 frames à 30 fps).
- Texte lisible à 360 px de large. Sous-titres de 58 px minimum en 1080.
- Les chiffres et affirmations viennent de sources Applipro réelles (script Demo Night, site). Jamais inventés.

## Boucle qualité
Planche contact → `reviews/CRITIC.md` (7 critères notés de 1 à 10) → corriger les 3 pires défauts → re-rendre.
Livrable si la moyenne est ≥ 8 et qu'aucun critère n'est < 7. Maximum 3 passes, consignées dans `reviews/<id>/review.md`.

## Sécurité
Clés API dans `.env` (jamais dans un prompt ni dans git). Licence Remotion : gratuite tant qu'Applipro compte au plus 3 personnes. Repasser sur https://www.remotion.dev/docs/license si l'équipe grandit.
