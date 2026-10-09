// Capteurs automatiques : le film ne sort que si tous les compteurs sont à zéro.
//   npm run qa -- PremierJour                 → 3 formats
//   npm run qa -- PremierJour 9x16 --step=3   → un format, une frame sur 3 (défaut : 5)
//   npm run qa -- MonFilm --loop              → ajoute le test de boucle (frame 0 = dernière + 1)
// Écrit reviews/<Film>-<format>/qa.json et qa.md. Code de sortie 1 si un compteur n'est pas à zéro.
import {renderStill} from '@remotion/renderer';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {browserExecutable, FORMATS, ffmpeg, ffprobe, getComposition, parseArgs} from './lib.mjs';

const {flags, rest} = parseArgs();
const [film = 'PremierJour', ...only] = rest;
const formats = only.length ? only : FORMATS;
const step = Number(flags.step ?? 5);

// Chaque compteur, avec la consigne de correction donnée à l'agent.
const COUNTERS = {
	erreurs: 'Erreur JavaScript pendant le rendu : lire le message, corriger le composant concerné.',
	texteHorsCadre: "Un texte important sort de l'image : revoir la table LAYOUT du format (position, largeur, taille).",
	texteHorsZoneSure: "Un texte important est sous l'interface des réseaux (9:16 : 220 px en haut, 420 px en bas, 150 px à droite) ou trop près du bord : le déplacer dans LAYOUT.",
	texteTropPetit: 'Texte illisible sur téléphone : sous-titres ≥ 58 px, autres textes ≥ 30 px (en 1080).',
	chevauchement: "Deux textes visibles se superposent : décaler les timings d'entrée/sortie (timeline.ts) ou les positions.",
	couleurHorsCharte: 'Couleur absente de brand/brand.json : utiliser C.<couleur> (src/lib/brand.ts), jamais une couleur en dur.',
	tempsMort: "Image figée plus de 4 s : ajouter un événement (règle : un événement toutes les 2 à 4 s).",
	nonDeterministe: "La même frame rendue deux fois diffère : chercher Math.random, Date, état React, transition CSS.",
	boucle: "La dernière image ne rejoint pas la première : aligner l'état final sur l'état initial.",
	fichierVideo: 'Le MP4 ne respecte pas la fiche technique : relancer npm run render (H.264, yuv420p bt709, AAC, durée exacte).',
	loudness: 'Son hors cible (-14 LUFS ±1, crête ≤ -1 dBTP) : relancer npm run render, vérifier les volumes dans timeline.ts.',
};

let failed = false;
for (const format of formats) {
	const id = `${film}-${format}`;
	const {serveUrl, composition} = await getComposition(id);
	const {durationInFrames: n, fps} = composition;
	const counts = Object.fromEntries(Object.keys(COUNTERS).map((k) => [k, 0]));
	const details = [];
	const add = (type, frame, detail) => {
		counts[type]++;
		if (details.filter((d) => d.type === type).length < 12) details.push({type, frame, t: frame === null ? null : +(frame / fps).toFixed(2), detail});
	};

	const frames = [];
	for (let f = 0; f < n; f += step) frames.push(f);
	if (frames.at(-1) !== n - 1) frames.push(n - 1);

	const hashes = [];
	let lastIssues = new Map();
	let measured = 0;
	for (const frame of frames) {
		const reports = [];
		const {buffer} = await renderStill({
			serveUrl, composition, frame, output: null, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable, logLevel: 'error',
			envVariables: {REMOTION_QA: '1'},
			onBrowserLog: (log) => {
				if (log.text.startsWith('QA:')) reports.push(JSON.parse(log.text.slice(3)));
				else if (log.type === 'error') add('erreurs', frame, log.text.slice(0, 300));
			},
		}).catch((e) => {
			add('erreurs', frame, String(e.message ?? e).slice(0, 300));
			return {buffer: null};
		});
		hashes.push({frame, hash: buffer ? createHash('sha1').update(buffer).digest('hex') : null});
		// Un même défaut présent sur plusieurs frames consécutives compte une seule fois.
		if (reports.at(-1)?.measured) measured++;
		const current = new Map();
		for (const issue of reports.at(-1)?.issues ?? []) {
			const key = `${issue.type}|${issue.detail.replace(/\d+(\.\d+)? px/g, '')}`;
			current.set(key, issue);
			if (!lastIssues.has(key)) add(issue.type, frame, issue.detail);
		}
		lastIssues = current;
		process.stdout.write(`\r${id} : frame ${frame}/${n - 1}`);
	}
	process.stdout.write('\n');
	// Garde-fou : un capteur qui n'a rien mesuré ne doit jamais afficher « zéro défaut ».
	if (measured < frames.length) add('erreurs', null, `Capteur QA : ${frames.length - measured} frame(s) non mesurée(s) sur ${frames.length}. Vérifier que le film passe par withQA (src/Root.tsx).`);

	// Temps mort : images identiques sur plus de 4 s.
	let runStart = 0;
	for (let i = 1; i <= hashes.length; i++) {
		if (i < hashes.length && hashes[i].hash && hashes[i].hash === hashes[runStart].hash) continue;
		const span = (hashes[i - 1].frame - hashes[runStart].frame) / fps;
		if (span > 4) add('tempsMort', hashes[runStart].frame, `Image identique de ${(hashes[runStart].frame / fps).toFixed(1)} s à ${(hashes[i - 1].frame / fps).toFixed(1)} s (${span.toFixed(1)} s).`);
		runStart = i;
	}

	// Déterminisme : une frame du milieu rendue une seconde fois (après les autres).
	const mid = hashes[Math.floor(hashes.length / 2)];
	const again = await renderStill({serveUrl, composition, frame: mid.frame, output: null, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable});
	if (createHash('sha1').update(again.buffer).digest('hex') !== mid.hash) add('nonDeterministe', mid.frame, 'Deux rendus de la même frame diffèrent.');

	// Boucle (films qui doivent boucler) : la frame après la dernière doit égaler la première.
	if (flags.loop) {
		const first = hashes[0].hash;
		const last = await renderStill({serveUrl, composition, frame: n - 1, output: null, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable});
		if (createHash('sha1').update(last.buffer).digest('hex') !== first) add('boucle', n - 1, 'Dernière image différente de la première.');
	}

	// Fichier vidéo rendu (si présent) : fiche technique et loudness.
	const video = `out/${id}.mp4`;
	let videoNote = 'absent (lancer npm run render pour contrôler le fichier final)';
	if (existsSync(video)) {
		videoNote = video;
		const [codec, w, h, pix, range, space, rate, nb] = ffprobe(['-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=codec_name,width,height,pix_fmt,color_range,color_space,r_frame_rate,nb_read_packets', '-of', 'csv=p=0', video]).split(',');
		const audio = ffprobe(['-select_streams', 'a:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', video]);
		const expect = {codec: 'h264', w: String(composition.width), h: String(composition.height), pix: 'yuv420p', range: 'tv', rate: `${fps}/1`, nb: String(n), audio: 'aac'};
		const got = {codec, w, h, pix, range, rate, nb, audio};
		for (const [k, v] of Object.entries(expect)) if (got[k] !== v) add('fichierVideo', null, `${k} = ${got[k] || 'absent'} au lieu de ${v} (${video}).`);
		void space;
		const log = ffmpeg(['-nostats', '-loglevel', 'info', '-i', video, '-vn', '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-c:a', 'pcm_s16le', '-f', 'null', '-'], {capture: true});
		const j = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
		if (Math.abs(Number(j.input_i) + 14) > 1 || Number(j.input_tp) > -0.9) add('loudness', null, `${j.input_i} LUFS, crête ${j.input_tp} dBTP.`);
	}

	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	failed ||= total > 0;
	const dir = `reviews/${id}`;
	mkdirSync(dir, {recursive: true});
	writeFileSync(`${dir}/qa.json`, JSON.stringify({id, step, framesChecked: frames.length, counts, details, video: videoNote}, null, 2));
	const table = Object.entries(counts).map(([k, v]) => `| ${v === 0 ? '✅' : '❌'} | ${k} | ${v} |`).join('\n');
	const list = details.map((d) => `- **${d.type}**${d.t === null ? '' : ` à ${d.t} s (frame ${d.frame})`} : ${d.detail}\n  → ${COUNTERS[d.type]}`).join('\n');
	const md = `# QA — ${id}\n\n${total === 0 ? '**Tous les compteurs sont à zéro.**' : `**${total} défaut(s).** Corriger le plus grave, relancer \`npm run qa -- ${film} ${format}\`.`}\n\n| | Compteur | Valeur |\n|---|---|---|\n${table}\n\nFrames contrôlées : ${frames.length} (une sur ${step}). Fichier vidéo : ${videoNote}.\n${list ? `\n## Détails\n${list}\n` : ''}`;
	writeFileSync(`${dir}/qa.md`, md);
	console.log(`${total === 0 ? '✓' : '✗'} ${id} : ${Object.entries(counts).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ') || 'tous les compteurs à 0'} → ${dir}/qa.md`);
}
process.exit(failed ? 1 : 0);
