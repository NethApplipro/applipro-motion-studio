---
name: motion-reel
description: Produire un film motion design Applipro (démo produit, annonce, post réseau) de l'idée au MP4 livré en 3 formats, avec étapes validées et boucle de critique. Utiliser dès qu'on demande une vidéo, une animation, un reel, un teaser ou une démo animée Applipro.
---

# motion-reel — pipeline de production

Lire `CLAUDE.md` d'abord. Chaque étape a une **gate** : s'arrêter et montrer le résultat à l'utilisateur avant de passer à la suivante, sauf s'il a demandé un « run complet ».

1. **Brief.** Copier `films/_template/` vers `films/<film>/`. Remplir `brief.md` : objectif, public, message unique, durée, formats, CTA, faits sourcés. Séparer les faits produit des choix créatifs.
   Gate : brief validé.
2. **Référence.** Si l'utilisateur donne une vidéo ou une image de référence : `ffmpeg -i ref.mp4 -vf fps=2,scale=480:-1,tile=6x6 reviews/<film>/ref.jpg`, puis analyser palette, typo, composition, rythme et mouvement dans `style-guide.md` (section « Analyse de référence »). Reprendre la grammaire visuelle, jamais le contenu.
3. **Shot list.** `shotlist.md` : temps forts calés sur la grille de 120 BPM (frames multiples de 15), texte à l'écran, écran de l'app montré, mouvement et son pour chaque plan. Vérifier que chaque écran existe dans `references/applipro-ui/`.
   Gate : style et shot list validés.
4. **Construction.** Créer `src/films/<film>/` (`timeline.ts`, `schema.ts`, `<Film>.tsx`) en réutilisant `src/components/` et `src/lib/`. Enregistrer les 3 formats dans `src/Root.tsx`. Exposer les textes et réglages dans le schéma zod pour qu'ils soient modifiables dans le Studio.
5. **Stills.** `npm run typecheck`, puis `npm run stills -- <Film> 9x16 …` sur 8 à 12 images clés. Les regarder, corriger.
   Gate : images fixes validées.
6. **Premier montage.** `npm run render -- <Film> 9x16`, puis `npm run critic -- out/<Film>-9x16.mp4`. Appliquer `reviews/CRITIC.md` : noter, corriger les 3 pires défauts, re-rendre. 3 passes au maximum.
7. **Son et formats.** Vérifier le calage des sons dans `timeline.ts` (SFX). Rendre `1x1` et `16x9` et passer chacun dans `critic`. Lancer `node scripts/determinism.mjs <Film>-9x16 <frame>`.
8. **Livraison.** Les MP4 dans `out/`, un `review.md` final (notes, défauts restants, choix faits). Résumer à l'utilisateur ce qui est livré et ce qui reste à valider (musique, voix).

## Garde-fous
- Ne jamais inventer d'écran, de fonctionnalité, de client, de logo tiers ni de chiffre.
- Ne jamais utiliser le nom ou le logo d'un client (ex. Eiffage) sans accord écrit. Utiliser « votre entreprise » ou un prénom.
- Effort : `high` pour construire, `medium` pour les retouches.
