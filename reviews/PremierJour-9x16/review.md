# Critique — PremierJour-9x16 (passe 2)

| Critère | Note | Commentaire |
|---|---|---|
| Clarté du message | 8 | Problème → app → preuve → signature, compréhensible sans le son |
| Hiérarchie | 8 | Un sous-titre et un écran à la fois |
| Rythme | 8 | Un événement toutes les 1 à 3 s, calé sur 120 BPM |
| Qualité du mouvement | 8 | Téléphone `heavy`, micro UI `snappy`, aucun rebond |
| Lisibilité (360 px) | 7 | Sous-titres lisibles ; le texte secondaire de l'UI reste petit (c'est du décor) |
| Fidélité à la marque | 8 | Poppins, palette officielle, Remix Icon, symbole officiel vectorisé |
| Finition | 8 | Superposition de sous-titres et écran vide corrigés en passe 2 |
| **Moyenne** | **7,9** | |

## Passe 1 → 2 : défauts corrigés
1. 2,9–3,1 s : deux sous-titres superposés → `Caption.tsx`, entrée décalée de 6 frames.
2. 2,9–3,2 s : téléphone à l'écran vide → `timeline.ts`, `homeReveal` passé de 98 à 88.
3. Planche stills : téléphone trop petit et chaos trop petit → `LAYOUT` (téléphone ×1,95, cartes ×1,5).

## Défauts restants (passe 3 possible)
1. 11,0–12,5 s : scène chiffre un peu nue. Ajouter un fond de 100 points ou d'avatars seedés qui se remplissent.
2. 8,2–11 s : bas de l'écran Copilote vide. Faire monter le clavier ou ajouter une 2ᵉ question.
3. Logo : le symbole est vectorisé depuis un JPG. Le remplacer par le SVG d'origine s'il est retrouvé.

Verdict : **LIVRABLE en pilote interne.** Passe 3 recommandée avant diffusion publique.
Contrôles : déterminisme ✓ (frame 230), loudness -14,7 LUFS / -1,0 dBTP, 15 s, H.264.
