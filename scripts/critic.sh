#!/usr/bin/env bash
# Batterie de contrôles avant livraison d'un rendu.
#   bash scripts/critic.sh out/PremierJour-9x16.mp4 [PremierJour-9x16]
# Produit dans reviews/<id>/ : planche contact, bande de 12 images, test téléphone 360 px,
# test de boucle, mesure de loudness, fiche technique. Puis lire CRITIC.md et noter le film.
set -euo pipefail
VIDEO="$1"
ID="${2:-$(basename "$VIDEO" .mp4)}"
DIR="reviews/$ID"
mkdir -p "$DIR"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
INFO=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name,pix_fmt -of csv=p=0 "$VIDEO")

# 1. Planche contact : une image toutes les 0,5 s.
ffmpeg -loglevel error -y -i "$VIDEO" -vf "fps=2,scale=240:-1,tile=6x5:padding=4:color=#202020" -frames:v 1 "$DIR/contact.jpg"

# 2. Bande de 12 images réparties sur toute la durée (lecture du rythme).
ffmpeg -loglevel error -y -i "$VIDEO" -vf "fps=12/$DUR,scale=200:-1,tile=12x1:padding=4:color=#202020" -frames:v 1 "$DIR/strip.jpg"

# 3. Test téléphone : le film vu à 360 px de large. Tout texte illisible ici est un défaut.
ffmpeg -loglevel error -y -i "$VIDEO" -vf "fps=1,scale=360:-1,tile=5x3:padding=4:color=#202020" -frames:v 1 "$DIR/phone-360.jpg"

# 4. Test de boucle : première et dernière image côte à côte (seulement si le film doit boucler).
ffmpeg -loglevel error -y -i "$VIDEO" -frames:v 1 "$DIR/first.png"
ffmpeg -loglevel error -y -sseof -0.5 -i "$VIDEO" -update 1 "$DIR/last.png"
ffmpeg -loglevel error -y -i "$DIR/first.png" -i "$DIR/last.png" -filter_complex "[0]scale=360:-1[a];[1]scale=360:-1[b];[a][b]hstack" "$DIR/loop.jpg"
rm -f "$DIR/first.png" "$DIR/last.png"

# 5. Loudness (cible -14 LUFS intégrés, crête vraie ≤ -1 dBTP).
LOUD=$(ffmpeg -hide_banner -nostats -i "$VIDEO" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' ' | tr '\n' ' ')

{
	echo "# Fiche technique — $ID"
	echo "- Fichier : $VIDEO"
	echo "- Durée : ${DUR} s"
	echo "- Vidéo (codec, largeur, hauteur, pix_fmt, fps) : $INFO"
	echo "- Loudness : $LOUD"
	echo "- Images : contact.jpg, strip.jpg, phone-360.jpg, loop.jpg"
} > "$DIR/tech.md"
cat "$DIR/tech.md"
