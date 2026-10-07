// Images fixes de contrôle (étape « stills » avant tout rendu vidéo).
// node scripts/stills.mjs [Film] [format] [frames...]   ex. : node scripts/stills.mjs PremierJour 9x16 0 90 200
import {renderStill} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {browserExecutable, getComposition} from './lib.mjs';

const [film = 'PremierJour', format = '9x16', ...rest] = process.argv.slice(2);
const frames = rest.length ? rest.map(Number) : [20, 70, 110, 140, 210, 240, 300, 325, 360, 420, 449];
const id = `${film}-${format}`;
const dir = `reviews/${film}/${format}/stills`;
mkdirSync(dir, {recursive: true});

const {serveUrl, composition} = await getComposition(id);
for (const frame of frames) {
	const output = `${dir}/f${String(frame).padStart(3, '0')}.jpg`;
	await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 90, browserExecutable});
	console.log(output);
}
