# Studio motion Applipro

Films produit Applipro écrits en code (Remotion + React), rendus en 9:16, 1:1 et 16:9, contrôlés par une boucle de critique avant livraison.

## Démarrer (sur ton ordinateur)
```bash
npm install
npm run studio        # aperçu interactif : timeline, lecture, textes modifiables dans « Props »
npm run render        # rend les 3 formats dans out/
```
Prérequis : Node 22+ et ffmpeg. Avec Claude Code, ouvre le dossier et demande par exemple :
« Utilise le skill motion-reel pour faire un film de 15 s sur le coffre-fort RH ».

## Ce qu'il y a dedans
| Dossier | Rôle |
|---|---|
| `brand/brand.json` | Charte officielle : Poppins, palette, baseline |
| `references/applipro-ui/` | Captures de l'app (base de tous les écrans redessinés) |
| `films/` | Brief, style et shot list de chaque film (`_template/` pour en créer un) |
| `src/lib/` | Ressorts (`sp`, `track`), aléatoire seedé, formats, polices |
| `src/components/` | Téléphone, tap, sous-titres, logo, écrans de l'app (Accueil, Onboarding, Copilote) |
| `src/films/premier-jour/` | Film pilote : `timeline.ts` (frames et sons), `schema.ts` (réglages), composition |
| `scripts/` | Rendu, images fixes, critique, déterminisme, sons, icônes |
| `reviews/CRITIC.md` | Grille du directeur motion sévère |
| `.claude/skills/motion-reel/` | Le pipeline complet en 8 étapes pour Claude Code |

## Marque
- `brand/logo-mark.svg` : symbole vectorisé d'après `brand/logo-source.jpg`. Remplace-le par le SVG d'origine si l'agence le retrouve.

## Licence Remotion
Applipro compte au plus 3 personnes : la licence gratuite de Remotion s'applique. Il faudra passer en licence entreprise si l'équipe grandit (voir https://www.remotion.dev/docs/license).

## À compléter
- En option : voix off (ElevenLabs, clé dans `.env`) et musique sous licence pour remplacer la nappe de synthèse.
