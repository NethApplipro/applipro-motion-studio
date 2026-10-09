# Studio motion Applipro

Films produit Applipro écrits en code (Remotion + React), rendus en 9:16, 1:1 et 16:9, contrôlés par une boucle de critique avant livraison.

## Démarrer (sur ton ordinateur)
```bash
npm install
npm run setup         # prépare le navigateur de rendu et les sons
npm run studio        # aperçu interactif : timeline, lecture, textes modifiables dans « Props »
npm run render        # rend les 3 formats dans out/
npm test              # tests de régression des contrôles
npm run qa            # validation technique finale : MP4 requis, toutes les frames
npm run verdict -- PremierJour   # verdict calculé : LIVRABLE / PILOTE INTERNE / À REPRENDRE
npm run review-page -- PremierJour  # page de relecture : formats côte à côte, commentaires horodatés
npm run visual        # tests visuels de régression
```
Prérequis : Node 20+ (22 recommandé). ffmpeg est recommandé pour les planches de contrôle (`brew install ffmpeg`).

## Avec un agent (Codex, Claude Code, Cursor…)
Ouvre le dossier dans l'agent et demande par exemple :
> « Suis le skill motion-reel. Film coffre-fort RH, 15 s, 9:16. Style morph-continu. Concept : un PDF qui devient chaque
> document RH. Texte de fin : “Tous vos documents RH. Toujours là.” Montre-moi 3 directions avant de construire. »

- **Codex** lit `AGENTS.md` automatiquement (règles, commandes, organisation). Pour Codex cloud, script de setup : `npm ci && npm run setup`.
- **Claude Code** lit `CLAUDE.md`, qui importe `AGENTS.md`, et trouve le skill dans `.claude/skills`.
- Le pipeline complet est dans `.agents/skills/motion-reel/SKILL.md`. Comment briefer : `docs/BRIEFER.md`.

## Ce qu'il y a dedans
| Dossier | Rôle |
|---|---|
| `AGENTS.md` | Règles du studio pour tous les agents (CLAUDE.md l'importe) |
| `brand/` | Charte officielle (`brand.json`) et logo vectorisé |
| `references/applipro-ui/` | Captures de l'app (base de tous les écrans redessinés) |
| `references/styles/` | Bibliothèque de directions artistiques nommées |
| `references/prompts/` | Prompts de films réels annotés (sources créditées) |
| `references/sources.md` | D'où vient chaque règle (posts X, dépôts) |
| `docs/BRIEFER.md` | Comment écrire un brief qui donne un film moderne |
| `films/` | Brief, style et shot list de chaque film (`_template/` pour en créer un) |
| `src/` | Moteur : ressorts, formats, composants, écrans de l'app, films |
| `scripts/` | Rendu, stills, capteurs `qa`, critique, déterminisme, nouveau film, référence, sons, icônes |
| `reviews/` | Grille de critique, journal des défauts (`JOURNAL.md`), rapports `qa.md` et notes de chaque rendu |
| `.claude/agents/motion-critic.md` | Critique indépendant (Claude Code), en lecture seule |
| `src/components/style/` | Briques des styles : forme qui se transforme, curseur, texte cinétique, caméra, flou de mouvement |
| `src/components/app/catalog.ts` | Catalogue des écrans redessinés, chacun relié à sa capture et à ses états |
| `src/studio/` | Planches « Ecrans » et « Briques » (dossier Studio de Remotion) |
| `tests/visual/` | Images de référence des tests visuels |
| `evals/` | Briefs pour évaluer le skill après chaque modification |
| `.github/workflows/` | CI qualité (2 films × 3 formats + tests visuels) et relecture Codex des PR |
| `docs/RENDU-DISTRIBUE.md`, `Dockerfile` | Rendre sur Hetzner/Coolify ou AWS Lambda |

## Films
| Film | Style | Cible | Verdict |
|---|---|---|---|
| `PremierJour` | editorial-clair, 15 s | interne (pilote) | PILOTE INTERNE (7,86) |
| `CoffreFort` | morph-continu, 14 s | interne | voir `reviews/CoffreFort-1x1/review.md` |

## Marque
- `brand/logo-mark.svg` : symbole vectorisé d'après `brand/logo-source.jpg`. Remplace-le par le SVG d'origine si l'agence le retrouve.

## Licence Remotion
Applipro compte au plus 3 personnes : la licence gratuite de Remotion s'applique. Il faudra passer en licence entreprise si l'équipe grandit (voir https://www.remotion.dev/docs/license).

## À compléter
- Musique sous licence pour remplacer la nappe de synthèse : la déposer dans `public/audio/`, la consigner dans
  `public/audio/LICENCES.md`, puis `npm run beats -- public/audio/<fichier>` pour caler le film dessus.
- Voix off : `ELEVENLABS_API_KEY` et `ELEVENLABS_VOICE_ID` dans `.env`, texte dans `films/<slug>/voix.json`,
  puis `npm run voice -- <slug>` (`--essai` pour monter sans clé).
- Relecture Codex des PR : secret `OPENAI_API_KEY` dans les réglages GitHub Actions du dépôt.

## Contrôler sans confondre aperçu et livraison
- Pendant le travail : `npm run qa -- PremierJour --preflight` (une image sur cinq, aucun contrôle MP4).
- Avant livraison : `npm run render -- PremierJour`, puis `npm run qa -- PremierJour` (chaque image, MP4 obligatoire, BT.709 et son contrôlés).
- `--step=N` est réservé au précontrôle ; une valeur invalide est refusée avant le rendu.
- Les rapports `preflight.md/json` restent séparés des rapports finaux `qa.md/json`. « Non contrôlé » ne signifie jamais réussi.
- Les compteurs ne jugent ni l'intérêt du récit ni la qualité du mouvement. Le test de temps mort détecte uniquement une image strictement figée ; `--loop` compare les images aux extrémités. Visionnage et critique restent obligatoires.
