// Rendu des 3 formats depuis la même timeline, puis normalisation du son à -14 LUFS.
// node scripts/render-all.mjs [Film] [formats...]   ex. : node scripts/render-all.mjs PremierJour 9x16
import {renderMedia} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, renameSync} from 'node:fs';
import {browserExecutable, FORMATS, getComposition} from './lib.mjs';

const [film = 'PremierJour', ...only] = process.argv.slice(2);
const formats = only.length ? only : FORMATS;
mkdirSync('out', {recursive: true});

for (const format of formats) {
	const id = `${film}-${format}`;
	const {serveUrl, composition} = await getComposition(id);
	const raw = `out/.${id}.raw.mp4`;
	const final = `out/${id}.mp4`;
	let last = -1;
	await renderMedia({
		serveUrl, composition, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', outputLocation: raw, browserExecutable,
		onProgress: ({progress}) => {
			const pct = Math.floor(progress * 10) * 10;
			if (pct !== last) process.stdout.write(`${id} ${(last = pct)}%\n`);
		},
	});
	// Loudness réseaux sociaux : -14 LUFS intégrés, crête vraie -1 dBTP. La vidéo n'est pas réencodée.
	execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', final]);
	renameSync(raw, `out/.${id}.last-raw.mp4`);
	console.log(`✓ ${final}`);
}
