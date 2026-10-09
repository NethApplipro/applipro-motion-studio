---
name: motion-reel
description: Produire un film motion design Applipro (démo produit, annonce, post réseau, teaser) de l'idée au MP4 livré en 3 formats, avec directions artistiques comparées, étapes validées et boucle de critique. Utiliser dès qu'on demande une vidéo, une animation, un reel, un teaser ou une démo animée Applipro.
---

# motion-reel — pipeline de production

Lire `AGENTS.md` d'abord. Chaque étape a une **gate** : s'arrêter, montrer le résultat (images, tableau) et attendre la
validation avant de continuer, sauf si l'utilisateur a demandé un « run complet ».

1. **Brief.** `npm run new-film -- <slug> "Titre"`. Remplir `films/<slug>/brief.md` (balises inputs / direction / structure /
   faits / start). Si la demande est trop courte, ne pas inventer : poser au maximum 5 questions ciblées (style ou référence,
   concept, texte de fin, durée et formats, écrans à montrer) en s'appuyant sur `docs/BRIEFER.md`. Séparer les faits produit des choix créatifs.
   **Gate : brief validé.**
2. **Référence.** Si une vidéo ou une image est fournie : `npm run ref -- <fichier>`, regarder `contact.jpg` et `rythme.jpg`,
   remplir `references/inbox/<nom>/analyse.md` (palette, typo, composition, rythme, mouvement, caméra, transitions, texture,
   son, à ne pas copier). Reprendre la grammaire visuelle, jamais le contenu. Si le look est réutilisable, créer une fiche
   dans `references/styles/` à partir de `_modele.md`.
3. **Trois directions.** Pour toute pièce destinée à être diffusée : proposer **3 directions vraiment différentes**
   (hiérarchie, typo, structure, langage de mouvement, pas seulement les couleurs), chacune adossée à une fiche de
   `references/styles/`. Pour chacune, construire 1 image clé du moment le plus important (composition temporaire dans
   `src/films/<slug>/`) et la rendre avec `npm run stills`. Présenter les 3 images côte à côte avec 2 lignes d'intention chacune.
   **Gate : une direction choisie** (ou un mélange explicite). Supprimer ensuite les compositions temporaires.
4. **Shot list.** `films/<slug>/shotlist.md` : temps forts calés sur 120 BPM (frames multiples de 15), texte exact à l'écran,
   écran de l'app montré (doit exister dans `references/applipro-ui/`), mouvement et son pour chaque plan.
   Écrire `style-guide.md` à partir de la fiche choisie. **Gate : shot list validée.**
5. **Construction.** Coder `timeline.ts` (toutes les frames et les sons), `schema.ts` (textes et réglages exposés dans le Studio),
   et la composition. Réutiliser `src/components/` et `src/lib/` ; ajouter les briques manquantes indiquées dans la fiche de
   style (en composants réutilisables, pas dans le film). Mise en page par format via une table `LAYOUT` et `useFormat()`.
6. **Stills.** `npm run check`, puis `npm run stills -- <Film> 9x16` et sur 1x1 et 16x9. Regarder chaque image : texte coupé,
   chevauchements, écrans vides, éléments hors cadre. Corriger. **Gate : images fixes validées.**
7. **Capteurs puis premier montage.** `npm run qa -- <Film> 9x16 --preflight` : boucle de correction jusqu'à zéro (le pire défaut à chaque
   tour, 5 tours maximum, arrêt si un tour ne progresse pas, cf. `AGENTS.md`). Puis `npm run render -- <Film> 9x16 --draft`
   et critique **par un regard séparé** (sous-agent `motion-critic` ou passe dédiée) avec `reviews/CRITIC.md` :
   corriger les 3 pires défauts, re-rendre. 3 passes au maximum.
8. **Son et formats.** Vérifier le calage des sons dans `timeline.ts`. `npm run render -- <Film>` (3 formats, qualité finale),
   puis `npm run qa -- <Film>` (contrôle aussi les MP4 : format, frames, son) jusqu'à zéro, `npm run critic` sur chacun.
9. **Livraison.** MP4 dans `out/` ; `reviews/<Film>-9x16/review.md` (notes, défauts restants, choix faits) ; nouvelles
   lignes dans `reviews/JOURNAL.md` (un défaut vu deux fois → corriger le studio) ; commit des sources.
   Résumer à l'utilisateur ce qui est livré et ce qui reste à valider (musique sous licence, voix off).

## Garde-fous
- Marquer avec `data-qa="caption"` ou `data-qa="text"` tout texte qui doit être lu, sinon les capteurs ne le voient pas.
- Ne jamais déclarer un contrôle réussi sans l'avoir exécuté.
- Ne jamais inventer d'écran, de fonctionnalité, de client, de logo tiers ni de chiffre.
- Ne jamais utiliser le nom ou le logo d'un client (ex. Eiffage) sans accord écrit : « votre entreprise » ou un prénom.
- Si un asset manque (logo SVG, capture d'écran, musique), le dire et s'arrêter plutôt que d'improviser.
