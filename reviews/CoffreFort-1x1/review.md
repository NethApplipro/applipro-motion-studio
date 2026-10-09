<!-- Généré par npm run verdict depuis review.json : modifier le JSON, pas ce fichier. -->
# Critique — CoffreFort-1x1 (passe 3)

Critique : motion-critic (sous-agent indépendant) · 2026-10-09 · cible : **interne**

| Critère | Note | Commentaire |
|---|---|---|
| Clarté du message | 8 | Le parcours tuile → dossiers → dépôt → ligne → « Signé » se lit sans le son et la promesse finale (deux lignes, logo, URL) tient désormais environ 1,2 s complète. |
| Hiérarchie | 8 | Un seul objet central à chaque instant et le curseur ne se gare plus dans le coin, mais il reste immobile sous la carte de clôture pendant 3,7 s sans aucun geste. |
| Rythme | 8 | Un événement par temps de bout en bout, seule la carte de clôture reste un aplat de dégradé sans contenu entre 10,0 et 10,5 s. |
| Qualité du mouvement | 8 | Les échanges ne passent plus par une forme vide : la forme se transforme en continu, sélection en deux bords et drag justes, retour à la tuile en snappy propre. |
| Lisibilité (360 px) | 7 | Sous-titres, nom du fichier, « En attente de signature » (26) et « Signé » (30) se lisent sur phone-360, mais la ligne des formats du dépôt et « Partagé à Camille » restent illisibles à 360 px. |
| Fidélité à la marque | 8 | Poppins, accent bleu unique, statuts gris/vert de la charte, dégradé réservé à la clôture, dossiers et dépôt fidèles à BO_40, tuile fidèle à FO_40, logo et mot « Applipro » qui sortent ensemble. |
| Finition | 7 | Boucle parfaite et aucun trou blanc, mais les échanges superposent brièvement deux contenus nets (liste et texte de dépôt à 5,0–5,1 s, dépôt et ligne à 7,45–7,5 s). |
| **Moyenne** | **7,71** | minimum 7 |

## Corrigé depuis la passe précédente
1. Plus de forme vide aux échanges : sorties à + 2, entrées à + 0, tileBack à T.toTile (vérifié l.76-80 et image par image à 1,2 s, 5,0 s, 7,5 s, 13,1 s) ; contrepartie : brève double exposition (défaut 1).
2. Curseur sorti du coin et de la marge : cursorRest {x: 320, y: L.close.h/2 + 60} (l.70), ~110 px du bord bas.
3. Fin : logo beat(22) - 5, URL beat(22) + 5, toTile et cursorHome beat(26) + 5, retour à la tuile en snappy (timeline.ts, l.54) ; logo + URL complets ~11,7–12,97 s, soit ~1,2 s ; QA --loop à 0.
4. « En attente de signature » en 26 (l.186), lisible sur phone-360.
5. Le mot « Applipro » s'efface avec le symbole (logoOut, l.106 et l.200) : plus de mot orphelin sur la carte qui blanchit.

## Défauts restants
1. 5,0–5,1 s : Images consécutives 4,95–5,3 s : « Déposer un fichier ou cliquer pour parcourir » apparaît par-dessus « Fiche de paie / Mes Documents » encore lisibles pendant 2 à 3 frames ; même double exposition à 7,45–7,5 s (texte du dépôt sous « Contrat_CDI.pdf ») et à 1,15–1,25 s (contenu de la tuile au centre du panneau qui s'ouvre). Le correctif de passe 2 a supprimé le vide mais a créé un fondu enchaîné, que le style interdit (« sortie avant entrée »). → src/films/coffre-fort/CoffreFort.tsx l.76-80 : garder les sorties à + 2 mais retarder les entrées à + 2 au lieu de + 0 (panelC T.toPanel + 2, dropC T.toDrop + 2, rowC T.toRow + 2), et réduire la durée de sortie de swap à 3 frames dans src/components/style/Morph.tsx si elle est plus longue : la sortie floutée doit être sous 30 % d'opacité quand l'entrée commence.
2. 10,0–13,6 s : close.jpg et contact.jpg (cases 21 à 27) : cursorRest {x: 320, y: L.close.h/2 + 60} place le curseur à ~(860, 970) px, sous la carte, immobile 3,6 s pendant toute la clôture ; il n'est plus dans le coin mais reste un élément sans rôle qui attire l'œil hors du logo. → src/films/coffre-fort/CoffreFort.tsx : opacité du curseur → 1 - sp(frame, fps, T.cursorRest + 8, 'snappy') + sp(frame, fps, T.toTile - 10, 'snappy') (masqué pendant la clôture, revient pour le retour à la tuile et la boucle) ; ou cursorRest à l'emplacement HOME {x: 360, y: 340} déjà, pour que la boucle n'ait plus de trajet final.
3. 5,0–7,5 s : phone-360.jpg (cases 6 à 8) : la ligne « PDF, Word, Excel, PowerPoint ou image (max. 5 Mo) » (19 px de scène) n'est qu'un trait gris à 360 px, alors que c'est un fait sourcé du brief ; « Partagé à Camille » (24) reste à la limite (cases 9 et 10). Troisième passe où un texte d'écran d'app trop petit échappe au compteur texteTropPetit : à consigner dans JOURNAL.md et à corriger dans le studio. → src/films/coffre-fort/CoffreFort.tsx l.166 : fontSize px(19) → px(24), top px(214) → px(220) ; l.180 : « Partagé à » px(24) → px(26). Studio : marquer data-qa="text" les textes d'app porteurs d'un fait du brief (ou ajouter un seuil 22 px pour les textes d'app dans src/components/QAProbe.tsx).

## Verdict : **PILOTE INTERNE**
- Note : PILOTE INTERNE. Validation technique finale réussie.

Contrôles : QA finale refaite avec --loop (qa.md) : 420/420 frames contrôlées, tous les compteurs à 0 (erreurs, texte hors cadre/zone sûre/trop petit, chevauchement, couleur hors charte, temps mort, densité d'événements avec plage calme max 2 s, saccade, non-déterminisme, boucle, fichier vidéo, loudness). tech.md : H.264 1080×1080 yuv420p 30 fps, 14,00 s, -14,43 LUFS intégrés, crête -1,45 dBTP (≤ -1). Limite des capteurs : chevauchement ne voit pas les textes d'app superposés pendant les échanges, texteTropPetit ne mesure pas les textes d'app non marqués.
