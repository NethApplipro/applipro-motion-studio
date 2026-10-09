// Capteurs automatiques : le film ne sort que si tous les compteurs sont à zéro.
//   npm run qa -- PremierJour                 → 3 formats
//   npm run qa -- PremierJour 9x16 --preflight --step=3 → précontrôle échantillonné, sans MP4
//   npm run qa -- MonFilm --loop              → ajoute le test de boucle (première = dernière image (test strict))
// Écrit reviews/<Film>-<format>/qa.json et qa.md. Code de sortie 1 si un compteur n'est pas à zéro.
import {renderStill} from '@remotion/renderer';
import {qaOptions, videoIssues, loudnessIssues} from './qa-validation.mjs';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {browserExecutable, FORMATS, ffmpeg, ffprobe, getComposition, parseArgs} from './lib.mjs';

const {flags, rest} = parseArgs();
const [film = 'PremierJour', ...only] = rest;
const formats = only.length ? only : FORMATS;
const {preflight, step} = qaOptions(flags, formats);

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
	if (preflight) { counts.fichierVideo = null; counts.loudness = null; }
	if (!flags.loop) counts.boucle = null;
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
		const report = reports.filter((r) => r.frame === frame).at(-1);
		if (report?.measured) measured++;
		const current = new Map();
		for (const issue of report?.issues ?? []) {
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

	// Plusieurs positions, après parcours du film : contrôle aussi le rendu sans sonde QA.
	for (const index of [...new Set([0, Math.floor(hashes.length / 2), hashes.length - 1])]) {
		const sample = hashes[index];
		try {
			const again = await renderStill({serveUrl, composition, frame: sample.frame, output: null, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable});
			if (!sample.hash || createHash('sha1').update(again.buffer).digest('hex') !== sample.hash) add('nonDeterministe', sample.frame, 'Deux rendus de la même frame diffèrent.');
		} catch (error) { add('erreurs', sample.frame, `Déterminisme : ${error.message}`); }
	}

	// Boucle : test strict d'égalité des images aux extrémités, pas une mesure de fluidité.
	if (flags.loop) {
		const first = hashes[0].hash;
		const last = hashes.at(-1).hash;
		if (!first || !last || last !== first) add('boucle', n - 1, 'Dernière image différente de la première.');
	}

	// Le contrôle de travail ignore explicitement le MP4 ; la validation finale l'exige.
	const video = `out/${id}.mp4`;
	let videoNote = preflight ? 'NON CONTRÔLÉ (précontrôle de travail)' : video;
	if (!preflight) {
		if (!existsSync(video)) {
			add('fichierVideo', null, `MP4 absent : ${video}. Lancer npm run render -- ${film} ${format}.`);
			counts.loudness = null;
			videoNote = 'ABSENT';
		} else {
			try {
				const probe = JSON.parse(ffprobe(['-count_frames', '-show_streams', '-of', 'json', video]));
				for (const detail of videoIssues(probe, composition)) add('fichierVideo', null, detail);
			} catch (error) { add('fichierVideo', null, `Inspection impossible : ${error.message}`); }
			try {
				const log = ffmpeg(['-nostats', '-loglevel', 'info', '-i', video, '-vn', '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-c:a', 'pcm_s16le', '-f', 'null', '-'], {capture: true});
				const measurement = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
				for (const detail of loudnessIssues(measurement)) add('loudness', null, detail);
			} catch (error) { add('loudness', null, `Mesure impossible : ${error.message}`); }
		}
	}

	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	failed ||= total > 0;
	const dir = `reviews/${id}`;
	const reportName = preflight ? 'preflight' : 'qa';
	mkdirSync(dir, {recursive: true});
	writeFileSync(`${dir}/${reportName}.json`, JSON.stringify({id, mode: preflight ? 'preflight' : 'final', technicalPassed: !preflight && total === 0, step, framesChecked: frames.length, counts, details, video: videoNote}, null, 2));
	const table = Object.entries(counts).map(([k, v]) => `| ${v === null ? '—' : v === 0 ? '✅' : '❌'} | ${k} | ${v ?? 'non contrôlé'} |`).join('\n');
	const list = details.map((d) => `- **${d.type}**${d.t === null ? '' : ` à ${d.t} s (frame ${d.frame})`} : ${d.detail}\n  → ${COUNTERS[d.type]}`).join('\n');
	const md = `# QA — ${id}\n\n${preflight ? '**PRÉCONTRÔLE — ne valide pas une livraison.**' : '**VALIDATION TECHNIQUE — critique visuelle et sonore séparée obligatoire.**'}\n\n${total === 0 ? '**Aucun défaut détecté dans les contrôles exécutés.**' : `**${total} défaut(s).** Corriger le plus grave, relancer \`npm run qa -- ${film} ${format}\`.`}\n\n| | Compteur | Valeur |\n|---|---|---|\n${table}\n\nFrames contrôlées : ${frames.length} (une sur ${step}). Fichier vidéo : ${videoNote}.\n${list ? `\n## Détails\n${list}\n` : ''}`;
	writeFileSync(`${dir}/${reportName}.md`, md);
	console.log(`${total === 0 ? '✓' : '✗'} ${id} : ${Object.entries(counts).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ') || (preflight ? 'précontrôle réussi, MP4 non contrôlé' : 'contrôles techniques réussis')} → ${dir}/${reportName}.md`);
}
process.exit(failed ? 1 : 0);
