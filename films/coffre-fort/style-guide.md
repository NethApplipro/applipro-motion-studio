# Style — Coffre-fort RH (morph-continu)

## Charte (brand/brand.json)
Poppins · bleu #3374FF (accent unique) · bleu foncé #0E0E52 · fond gris clair #ECECF4 (grey05) · formes blanches #FFFFFF ·
curseur noir #121624 · Remix Icon. Dégradé de marque réservé à la carte de clôture.
États : « En attente de signature » en gris #6E707C, « Signé » en vert #00A878 (couleurs de statut de la charte, pas des accents).

## Grammaire (fiche morph-continu)
- Une seule forme (`MorphShape`), centrée sur la scène, qui change de taille et d'arrondi à chaque état ; jamais de coupe.
- Contenu échangé avec `swap()` : sortie avant entrée, court flou.
- Sélection de dossier avec `splitSpring()` : le bord avant mène, le bord arrière suit.
- Curseur (`Cursor`, `cursorAt`) : vrais clics et un glisser-déposer ; pendant le drag, la pièce jointe suit le curseur.
- Sous-titres hors de la forme avec `KineticText` (mot à mot), sauf en 1:1 où ils passent au-dessus de la scène.

## Mouvement
- Forme : `default` pour les changements d'état, `heavy` pour l'ouverture de la clôture.
- Micro UI (lignes, coches, pastilles) : `snappy`.
- Curseur : `default`, gestes de 10 à 15 frames.

## Son
Nappe 120 BPM (bed.wav). click à chaque clic, pop à chaque ligne, swish à chaque changement de forme, whoosh au début
du glisser, tick sur la progression et l'état « Signé », thump à la clôture, chime sur le logo. -14 LUFS.
