# Studio motion Applipro

Films produit Applipro écrits en code (Remotion + React), rendus en 9:16, 1:1 et 16:9, contrôlés par une boucle de critique avant livraison.

## Démarrer (sur ton ordinateur)
```bash
npm install
npm run setup         # prépare le navigateur de rendu et les sons
npm run studio        # aperçu interactif : timeline, lecture, textes modifiables dans « Props »
npm run render        # rend les 3 formats dans out/
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
| `scripts/` | Rendu, stills, critique, déterminisme, nouveau film, référence, sons, icônes |
| `reviews/` | Grille de critique et notes de chaque rendu |

## Marque
- `brand/logo-mark.svg` : symbole vectorisé d'après `brand/logo-source.jpg`. Remplace-le par le SVG d'origine si l'agence le retrouve.

## Licence Remotion
Applipro compte au plus 3 personnes : la licence gratuite de Remotion s'applique. Il faudra passer en licence entreprise si l'équipe grandit (voir https://www.remotion.dev/docs/license).

## À compléter
- En option : voix off (ElevenLabs, clé dans `.env`) et musique sous licence pour remplacer la nappe de synthèse.
