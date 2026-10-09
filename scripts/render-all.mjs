// Rendu d'un film dans ses 3 formats, puis normalisation du son (-14 LUFS, crête -1 dBTP).
//   npm run render -- PremierJour            → les 3 formats
//   npm run render -- PremierJour 9x16       → un seul format
//   npm run render -- PremierJour --draft    → aperçu rapide (moitié de la résolution, CRF 28)
import {renderMedia} from '@remotion/renderer';
import {mkdirSync, renameSync, rmSync} from 'node:fs';
import {browserExecutable, ffmpeg, FORMATS, getComposition, parseArgs} from './lib.mjs';

const {flags, rest} = parseArgs();
const [film = 'PremierJour', ...only] = rest;
const formats = only.length ? only : FORMATS;
const draft = Boolean(flags.draft);
mkdirSync('out', {recursive: true});

for (const format of formats) {
	const id = `${film}-${format}`;
	const {serveUrl, composition} = await getComposition(id);
	const suffix = draft ? '.draft' : '';
	const raw = `out/.${id}${suffix}.raw.mp4`;
	const tmp = `out/.${id}${suffix}.tmp.mp4`;
	const final = `out/${id}${suffix}.mp4`;
	let last = -1;
	await renderMedia({
		serveUrl, composition, codec: 'h264', crf: draft ? 28 : 16, pixelFormat: 'yuv420p', colorSpace: 'bt709', scale: draft ? 0.5 : 1,
		outputLocation: raw, browserExecutable,
		onProgress: ({progress}) => {
			const pct = Math.floor(progress * 10) * 10;
			if (pct !== last) console.log(`${id} ${(last = pct)}%`);
		},
	});
	// Marge de 0,5 dB avant AAC : éviter le dépassement de -1 dBTP après encodage.
	// Le son est normalisé dans un fichier temporaire : un rendu raté n'écrase jamais une bonne version.
	ffmpeg(['-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', tmp]);
	renameSync(tmp, final);
	rmSync(raw, {force: true});
	console.log(`✓ ${final}`);
}
