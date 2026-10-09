<!-- Généré par npm run verdict depuis review.json : modifier le JSON, pas ce fichier. -->
# Critique — PremierJour-9x16 (passe 2)

Critique : motion-critic · 2026-10-07 · cible : **interne**

| Critère | Note | Commentaire |
|---|---|---|
| Clarté du message | 8 | Problème → app → preuve → signature, compréhensible sans le son |
| Hiérarchie | 8 | Un sous-titre et un écran à la fois |
| Rythme | 8 | Un événement toutes les 1 à 3 s, calé sur 120 BPM |
| Qualité du mouvement | 8 | Téléphone heavy, micro UI snappy, aucun rebond |
| Lisibilité (360 px) | 7 | Sous-titres lisibles ; le texte secondaire de l'UI reste petit (c'est du décor) |
| Fidélité à la marque | 8 | Poppins, palette officielle, Remix Icon, symbole officiel vectorisé |
| Finition | 8 | Superposition de sous-titres et écran vide corrigés en passe 2 |
| **Moyenne** | **7,86** | minimum 7 |

## Corrigé depuis la passe précédente
1. 2,9–3,1 s : deux sous-titres superposés → Caption.tsx, entrée décalée de 6 frames.
2. 2,9–3,2 s : téléphone à l'écran vide → timeline.ts, homeReveal passé de 98 à 88.
3. Planche stills : téléphone et chaos trop petits → LAYOUT (téléphone ×1,95, cartes ×1,5).

## Défauts restants
1. 11,0–12,5 s : Scène chiffre un peu nue. → Ajouter un fond de 100 points ou d'avatars seedés qui se remplissent.
2. 8,2–11,0 s : Bas de l'écran Copilote vide. → Faire monter le clavier ou ajouter une 2ᵉ question (Screens.tsx, CopilotScreen).
3. 12,5–15,0 s : Symbole vectorisé depuis un JPG. → Remplacer brand/logo-mark.svg par le SVG d'origine s'il est retrouvé.

## Verdict : **PILOTE INTERNE**
- Note : PILOTE INTERNE. Validation technique finale réussie.

Contrôles : déterminisme ✓ (frame 230), loudness -14,7 LUFS / -1,0 dBTP, 15 s, H.264.
