# Studio motion Applipro — instructions pour les agents (Codex, Claude Code, Cursor…)

Ce dépôt fabrique des films produit Applipro **en code** (Remotion + React) : l'agent écrit le programme,
le programme dessine chaque image, le moteur de rendu en fait un MP4, la boucle de critique décide s'il sort.
Ce fichier est la source unique des règles. `CLAUDE.md` l'importe.

## Pour toute demande de vidéo
Lire et suivre **`.agents/skills/motion-reel/SKILL.md`** (pipeline en 9 étapes avec validations).
Avant de proposer une direction artistique, lire **`references/styles/README.md`** (bibliothèque de styles nommés).
Un brief faible se renforce avec **`docs/BRIEFER.md`**.

## Installation et commandes
Node 20+ (22 recommandé, voir `.nvmrc`). ffmpeg complet recommandé, pas obligatoire.
```bash
npm install && npm run setup        # navigateur headless + sons
npm run check                       # types + une image rendue par composition (à lancer avant chaque commit)
npm run studio                      # aperçu interactif, réglages modifiables dans « Props »
npm run new-film -- <slug> "Titre"  # crée films/<slug>/ + src/films/<slug>/ et l'enregistre
npm run stills -- <Film> <format> [frames…]   # images de contrôle → reviews/<Film>/<format>/
npm run render -- <Film> [formats…] [--draft] # MP4 → out/ (H.264 CRF 16, son à -14 LUFS)
npm run qa -- <Film> [formats…] [--loop]  # capteurs automatiques, doivent tous être à 0
npm run critic -- out/<Film>-<format>.mp4     # planches + loudness → reviews/<id>/
npm run determinism -- <Film>-<format> [frame]
npm run ref -- <vidéo|image> [nom]  # prépare l'analyse d'une référence → references/inbox/<nom>/
npm run sfx                         # régénère les sons de synthèse
npm run icons                       # régénère les icônes Remix (liste dans scripts/build-icons.mjs)
```
Formats : `9x16` (1080×1920), `1x1` (1080×1080), `16x9` (1920×1080). Ids : `<Film>-<format>`, ex. `PremierJour-9x16`.

### Environnement cloud (Codex cloud, CI)
Script de setup : `npm ci && npm run setup`. Ajouter `apt-get install -y ffmpeg` si l'image le permet (sinon le
ffmpeg embarqué par Remotion rend et normalise le son, mais ne génère pas les planches). Si le téléchargement du
navigateur est bloqué, définir `REMOTION_BROWSER` (ou `CHROME_PATH`) vers un Chrome/Chromium local.
Vérifier son travail avec `npm run check`, puis `npm run stills` et regarder les images produites.

## Organisation
| Chemin | Rôle |
|---|---|
| `brand/brand.json` | Seule source de la charte : Poppins, palette officielle, dégradé, baseline. Jamais de couleur en dur ailleurs. |
| `brand/logo-mark.svg`, `src/components/Logo.tsx` | Symbole officiel (un seul tracé, animable avec `draw`). |
| `references/applipro-ui/` | Captures réelles de l'app. Tout écran montré doit exister ici. |
| `references/styles/` | Fiches de style nommées (grammaire de mouvement, typo, caméra, interdits). |
| `references/prompts/` | Prompts de films réels annotés (sources créditées). |
| `references/sources.md` | D'où vient chaque règle du studio. |
| `films/<film>/` | `brief.md`, `style-guide.md`, `shotlist.md` : écrits et validés AVANT le code. |
| `src/films/<film>/` | `timeline.ts` (toutes les frames et les sons), `schema.ts` (réglages zod), composition. |
| `src/films/registry.ts` | Registre des films (mis à jour par `new-film`). |
| `src/components/` | Téléphone, tap, sous-titres, logo, cartes, écrans de l'app (`app/`). |
| `src/lib/` | `motion.ts` (sp, track, presets, mulberry32, BEAT), `format.ts` (useFormat), `brand.ts`, `fonts.ts`. |
| `scripts/` | Outils en Node, multiplateformes. `lib.mjs` = navigateur, ffmpeg, bundle. |
| `reviews/` | `CRITIC.md` (grille), `JOURNAL.md` (mémoire des défauts), `qa.md` et `review.md` par rendu. Les images générées ne sont pas versionnées. |
| `src/components/QAProbe.tsx` | Capteur QA (mesures dans le navigateur pendant `npm run qa`). |

## Règles de rendu (non négociables)
- Chaque image est une **fonction pure du temps** (`useCurrentFrame`). Interdit : transitions CSS, `setTimeout`, `requestAnimationFrame`, `Math.random()`, `Date`, état React qui évolue entre deux frames.
- Aléatoire : `mulberry32(seed)` uniquement.
- Mouvement : `sp()` / `track()` avec les presets `snappy`, `default`, `heavy`, `playful`. `track()` additionne un ressort par changement de cible : toute frame se calcule directement.
- Polices et sons servis depuis `public/`. Aucun appel réseau pendant le rendu.
- Les 3 formats sont **recomposés** via `useFormat()` (table `LAYOUT` par format), jamais recadrés.
- Toute la chronologie d'un film vit dans `timeline.ts`, calée sur 120 BPM (1 temps = 15 frames à 30 fps) : l'image et le son bougent ensemble.
- Ne jamais mettre `will-change` sur un élément que la caméra agrandit (texte flou).

## Règles de style
- Charte : Poppins · accent unique `#3374FF` · texte `#0E0E52` · fond `#F7F7FF` · icônes Remix · dégradé de marque réservé aux moments forts (clôture, révélation).
- Interdits par défaut (« look IA ») : titre centré sur un dégradé dès l'ouverture, fondus enchaînés partout, glow, particules gratuites, labels dans les coins, plusieurs couleurs d'accent, tout qui apparaît en même temps, dashboards génériques, texte minuscule.
- Un événement visible toutes les 2 à 4 s (ou sur chaque temps pour un style rapide). Pas de temps mort.
- Chaque transition **montre une fonctionnalité** (l'état A devient l'état B) au lieu de remplacer une carte par une autre.
- Texte lisible à 360 px de large : sous-titres de 58 px minimum en 1080.
- Chiffres et affirmations : uniquement depuis des sources Applipro réelles (brief). Jamais de nom ni de logo client sans accord écrit.

## Capteurs automatiques (`npm run qa`)
Un film ne sort que si **tous les compteurs de la validation finale sont à zéro** (`reviews/<Film>-<format>/qa.md`, code de sortie 1 sinon ;
le précontrôle `--preflight` écrit `preflight.md` et ne valide jamais une livraison) :
erreurs · texteHorsCadre · texteHorsZoneSure · texteTropPetit · chevauchement · couleurHorsCharte · tempsMort ·
nonDeterministe · boucle (avec `--loop`) · fichierVideo (H.264, yuv420p bt709, AAC, 30 fps, nombre exact de frames) · loudness.
- Les mesures viennent de `src/components/QAProbe.tsx`, qui enveloppe chaque film (sans effet sur l'image).
- **Marquer les textes qui doivent être lus** : `data-qa="caption"` (sous-titres, titres : ≥ 58 px en 1080) ou
  `data-qa="text"` (autres textes importants : ≥ 30 px). Les textes décoratifs et ceux des écrans d'app ne sont pas marqués.
- Zone sûre : 9:16 → 220 px en haut, 420 px en bas, 150 px à droite (interface TikTok/Reels/Shorts), 60 px à gauche ;
  autres formats → 4 % de chaque côté.
- Chaque défaut du rapport donne la frame, la preuve et la consigne de correction.

## Boucle de correction (objectif + règle d'arrêt)
Objectif : `npm run qa` (validation finale) à zéro sur les 3 formats **et** note `reviews/CRITIC.md` ≥ 8 (aucun critère < 7).
Pendant le travail, chaque tour utilise le précontrôle rapide : lire `preflight.md`, corriger **le défaut le plus grave**,
relancer `npm run qa -- <Film> <format> --preflight`. Une fois à zéro : `npm run render`, puis `npm run qa -- <Film>` (toutes les frames, MP4).
Arrêt : objectif atteint · 5 tours · ou un tour sans progrès (même défaut, même compteur) → s'arrêter et expliquer le blocage.
Ne jamais déclarer réussi un contrôle qui n'a pas été exécuté. Un rendu n'est pas une validation.

## Fabricant et vérificateur séparés
Celui qui fabrique ne se note pas. Après chaque rendu, la critique est faite par un regard séparé :
Claude Code → sous-agent `motion-critic` (`.claude/agents/motion-critic.md`, lecture seule) ;
Codex ou autre agent → nouvelle session, ou passe dédiée, qui suit les mêmes consignes en lisant ce fichier.

## Journal (`reviews/JOURNAL.md`)
Chaque défaut trouvé y est consigné (date, cause, correction du film, correction du studio).
**Un défaut qui revient deux fois se corrige dans le studio** (règle, capteur ou brique), pas seulement dans le film.

## Boucle qualité (résumé)
`stills` → regarder → corriger → `qa --preflight` (zéro) → `render --draft` → `critic` + note `CRITIC.md` → corriger les 3 pires défauts →
re-rendre. Livrable si qa = 0 et moyenne ≥ 8 sans critère < 7. Consigner dans `reviews/<id>/review.md` et `JOURNAL.md`.
Terminer par `npm test`, `npm run check`, `npm run render`, `npm run qa` (final) et `npm run determinism`.

## Git
Committer les sources, jamais `out/`. Messages de commit en français, au présent (« Ajouter le film coffre-fort »).

## Licence et secrets
Remotion : licence gratuite tant qu'Applipro compte au plus 3 personnes (https://www.remotion.dev/docs/license).
Clés API (ElevenLabs…) dans `.env`, jamais dans un prompt ni dans git.

## Précontrôle et validation finale
`npm run qa -- <Film> --preflight [--step=N]` sert à corriger les compositions avant le MP4.
Il écrit `preflight.md/json`, ignore explicitement vidéo et son et ne valide aucune livraison.
`npm run qa -- <Film>` exige les MP4 et contrôle toutes les frames. Les rapports finaux restent `qa.md/json`.
Lancer `npm test` après toute modification des contrôles. Un contrôle non exécuté apparaît « non contrôlé ».
