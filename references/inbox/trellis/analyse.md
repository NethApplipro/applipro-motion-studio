# Analyse de référence — trellis (film produit SaaS, 63 s, 1920×1080, 60 fps)
Source : vidéo fournie le 09/10/2026 (`trellis_v7_1080p.mp4`, non versionnée). Seulement 3 vraies coupes détectées
(0 s, 21,9 s, 56,2 s) : tout le reste est **continu** (transformations, caméra, profondeur).

## Structure en 2 actes + pivot
| Temps | Acte | Ce qui se passe |
|---|---|---|
| 0–21 s | **Problème** (fond vert sombre de marque, fine grille) | « Okay » géant + logos d'apps qui flottent → dock d'apps avec badges rouges → « How many problems do you handle every week as a property manager? » → notifications qui volent en profondeur → compteur 10 → 30 → les cartes tombent dans un dossier, badge rouge 40 → 99 → « And how many actually get… resolved? » → menu contextuel « Delete » cliqué → « Yeah » → réponses qui ne bougent pas (« Pending ») → globe de points avec biens en alerte → « You're not in control anymore / Things are slipping / you don't even see it » |
| 21 s | **Pivot** | « Stop » énorme → coupe → logo sur fond clair |
| 22–56 s | **Solution** (fond gris très clair, typo verte) | « the agent that gets sh*t done » + interface en perspective 3D → schéma agent au centre (Team, Vendor, Guest, Verify, Schedule) → « Plugged into everything you already use » + anneau d'icônes en orbite 3D → « Your guest has **an issue** » (mot géant net/flou) → liste numérotée à gauche + **workflow qui se construit carte par carte** à droite → idem « Damage after **checkout** » → mots géants « messages / tasks / people » avec écrans qui glissent en perspective → « Connected around you » (ordinateur, téléphone, tablette en orbite) |
| 56–63 s | **Clôture** | « Same business. Just… finally running » + 3 puces de résultats (✓) → logo + bouton CTA cliqué par un curseur |

## Grammaire
| Axe | Observation | À reprendre pour Applipro | À ne pas copier |
|---|---|---|---|
| Palette | Acte 1 : vert de marque sombre en fond plein + grille fine ; acte 2 : gris clair neutre, typo verte. **Un seul accent** (le vert) + **rouge réservé aux alertes** (badges) | Acte 1 : `#0E0E52` (bleu foncé) + grille fine ; acte 2 : `#F7F7FF`, typo `#3374FF`/`#0E0E52` ; rouge `#CC2936` uniquement pour les badges | Le vert |
| Typographie | Une sans-serif. Phrases de taille moyenne qui entrent **mot par mot** (chaque mot arrive flou, plus clair, légèrement décalé, puis se pose) ; mots-clés **géants** (« Okay », « Stop », « an issue », « checkout », « messages ») | Poppins ; composant « phrase mot par mot » ; mots géants Poppins 600 | — |
| Ton du texte | Parlé, direct, questions au spectateur (« be honest », « Yeah », « Well… », « Stop ») | Questions aux DRH : « Combien de nouveaux salariés… ? » | L'argot (« sh*t ») |
| Profondeur | **Flou de profondeur** : cartes au premier plan et à l'arrière-plan floues, plan médian net ; parallaxe | Couches à 3 distances avec flou proportionnel | — |
| Mouvement | Cartes et notifications qui volent en 3D ; compteurs qui s'emballent avec traits d'impact ; cartes qui tombent dans un dossier ; anneau d'icônes en orbite ; écrans en perspective qui glissent | Notifications/mails/PDF qui tombent dans un dossier avec badge qui grimpe ; écrans Applipro en perspective | — |
| Flou de mouvement | Présent sur tous les déplacements rapides (chiffres, cartes, icônes) | Rendu avec sous-images (motion blur) | — |
| Caméra | Pousse/recule en continu ; la caméra révèle plutôt que de couper | Caméra globale pilotée par `track` (preset heavy) | — |
| Démonstration | **Liste numérotée à gauche + workflow qui se construit à droite**, synchronisés : chaque étape de la liste fait apparaître sa carte | Parcours d'onboarding : « Le salarié signe… » → cartes du back-office (`BO_03`, `BO_04`, `BO_08`) | — |
| Preuve | 3 puces de résultats avec ✓ autour d'une phrase | Uniquement des chiffres réels (100 000+ collaborateurs) | Les KPI inventés |
| Rythme | Un événement par seconde environ ; texte qui change toutes les 1 à 2 s ; 3 coupes seulement | 30–45 s, un événement par temps (120 BPM) | — |
| Son | Bande son forte (crête 0 dB, moyenne -17,6 dB), musique + effets | Musique sous licence + sons calés ; voix off optionnelle | Le niveau de crête (on vise -1 dBTP) |

## Grammaire en 5 lignes (pour le brief, section <direction>)
1. Deux actes de couleur : problème sur fond de marque sombre, solution sur fond clair ; pivot par un mot géant.
2. Les phrases s'écrivent mot par mot (flou → net) ; les mots-clés deviennent géants.
3. Tout vit en profondeur : 3 plans, flou de profondeur, flou de mouvement, caméra qui pousse.
4. La démonstration se construit : liste numérotée à gauche, workflow qui s'assemble carte par carte à droite.
5. Un seul accent couleur ; le rouge est réservé aux alertes (badges qui grimpent).

Fiche de style créée : `references/styles/recit-cinetique.md`.
