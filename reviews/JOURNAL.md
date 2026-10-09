# Journal du studio (mémoire des défauts)

Règle : **un défaut qui revient deux fois se corrige dans le studio** (une règle dans `AGENTS.md`, un capteur dans
`scripts/qa.mjs` ou `src/components/QAProbe.tsx`, une brique réutilisable), **pas seulement dans le film**.
Chaque entrée : date · défaut · cause · correction du film · correction du studio.

| Date | Défaut | Cause | Film | Studio |
|---|---|---|---|---|
| 2026-10-07 | Deux sous-titres superposés pendant les transitions | Entrée du nouveau texte en même temps que la sortie de l'ancien | `Caption.tsx` : entrée décalée de 6 frames | Capteur `chevauchement` |
| 2026-10-07 | Téléphone à l'écran vide en arrivant | Révélation de l'écran trop tardive | `homeReveal` 98 → 88 | Règle : « pas d'écran vide » (critique visuelle) |
| 2026-10-07 | Son de fin (chime) coupé | `Sequence` limitée à 45 frames pour un son de 2,2 s | `durationInFrames` retiré | Gabarit `new-film` sans limite de durée |
| 2026-10-08 | Panneau « Props » du Studio potentiellement cassé | zod 3 au lieu de la version exigée par Remotion | zod 4.5.4, versions figées | `npx remotion versions` dans la vérification |
| 2026-10-08 | Planches impossibles sans ffmpeg installé | Le ffmpeg embarqué par Remotion n'a pas les filtres `tile`/`fps` | — | Mode dégradé (images séparées) + message d'installation |
| 2026-10-09 | MP4 en `yuvj420p` (plage « PC ») au lieu de `yuv420p` (plage TV) | Images JPEG intermédiaires sans espace couleur explicite | Rendu refait | `colorSpace: 'bt709'` + compteur `fichierVideo` |
| 2026-10-09 | Couleur `#0B0F1A` hors charte (téléphone, tap) | Couleur codée en dur | `C.black` | Compteur `couleurHorsCharte` |
| 2026-10-09 | Sous-titres et chiffre sous la colonne de boutons TikTok/Reels | Largeur de 900 px sans marge à droite | Largeur 820 px, chiffre 160 px | Compteur `texteHorsZoneSure` (150 px à droite en 9:16) |
| 2026-10-09 | Capteur QA qui affichait « zéro défaut » sans rien mesurer | Film mesuré hors écran dans un conteneur de taille nulle | — | Taille explicite + garde-fou « frames non mesurées » = erreur |
| 2026-10-09 | Baseline de fin trop petite en 1:1 (26 px) | Taille proportionnelle au logo, plus petit en carré | Taille plancher de 30 px | Compteur `texteTropPetit` (un capteur a trouvé ce que l'œil avait laissé passer) |
| 2026-10-09 | QA pouvait réussir sans MP4, ignorer BT.709 et accepter une mesure sonore non finie | Contrôles optionnels et valeurs non validées | Aucun changement du pilote | Séparation précontrôle/final, MP4 obligatoire, inspection JSON, comptage des frames décodées, contrôle BT.709, mesures audio finies, tests de régression |
| 2026-10-09 | Crête AAC à -0,99 dBTP détectée en CI | Normalisation à -1 dBTP avant un encodage avec pertes | Nouveau rendu requis | Cible de normalisation -1,5 dBTP pour préserver la limite de livraison -1 dBTP |
| 2026-10-09 | Extraction d’une image après la dernière frame dans critic | Durée du conteneur prolongée par AAC | — | Utiliser la durée du flux vidéo, vérifiée sur le MP4 carré produit en CI |
| 2026-10-09 | Livraison déclarée « LIVRABLE » avec 7,86 de moyenne alors que la règle exige 8 | Verdict écrit à la main par le critique | Statut corrigé : PILOTE INTERNE | Verdict calculé par `npm run verdict` depuis `review.json` ; seuils LIVRABLE / PILOTE INTERNE ; gate en CI |
| 2026-10-09 | Téléphone qui sort à plus de 300 px par frame sans flou (effet stroboscopique) | Sortie en ressort rapide, aucune image intermédiaire | `MotionBlur` sur la sortie (11,0–11,5 s) | Brique `MotionBlur` + compteur `saccade` (saut > ¼ du cadre sans flou) |
| 2026-10-09 | Pièce jointe qui s'arrête net au lâcher (CoffreFort, 6,5 s) | Position figée au moment du clic au lieu de suivre le curseur qui ralentit | La pièce suit le curseur et rejoint sa pointe en ressort | Compteur `saccade` (arrêt sec), trouvé par le capteur et non à l'œil |
| 2026-10-09 | `new-film` collait l'import du nouveau film sur la ligne précédente du registre | Remplacement sans retour à la ligne | Registre corrigé | Gabarit `new-film` corrigé |
| 2026-10-09 | Textes d'écran d'app porteurs d'un fait (formats acceptés, « Partagé à », états) illisibles à 360 px, trois passes de suite (CoffreFort) | Les textes d'écran n'étaient jamais mesurés par le capteur | Tailles portées à 24–26 px | Marqueur `data-qa="ui"` (≥ 24 px en 1080) mesuré par `texteTropPetit` |
| 2026-10-09 | Forme vide, puis double exposition pendant les échanges de contenu (CoffreFort) | Sortie et entrée trop espacées, puis trop superposées | Sortie à +1 frame, entrée à +3 | Règle de timing documentée dans `swap()` (Morph.tsx) ; pas de capteur (opacités < 0,6 non mesurées) : à surveiller par la critique |
| 2026-10-09 | Validation finale de 15 à 25 min par format | `renderStill` relançait un navigateur pour chaque image | — | QA rendue avec `renderFrames` dans un seul navigateur, plusieurs onglets (`--jobs`) : 50 s pour 420 frames ; CI limitée aux films touchés, légère sur les PR en brouillon |
| 2026-10-09 | Job `visual` rouge en CI (0,4 à 1,1 % de pixels) sans régression : 0 % dans l'environnement d'origine | Références rendues par le Chromium Playwright d'un conteneur cloud, CI rendue par le Chrome de Remotion | — | Références régénérées par la CI (`visual-references.yml`) ; règle dans AGENTS.md |
