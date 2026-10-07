// Test de déterminisme : rend deux fois la même image et compare les empreintes.
// node scripts/determinism.mjs PremierJour-9x16 [frame]
import {renderStill} from '@remotion/renderer';
import {createHash} from 'node:crypto';
import {readFileSync, mkdirSync} from 'node:fs';
import {browserExecutable, getComposition} from './lib.mjs';

const [id = 'PremierJour-9x16', frameArg = '200'] = process.argv.slice(2);
const frame = Number(frameArg);
mkdirSync('out/.determinism', {recursive: true});
const {serveUrl, composition} = await getComposition(id);
const hashes = [];
for (const run of [1, 2]) {
	const output = `out/.determinism/${id}-${frame}-${run}.png`;
	await renderStill({serveUrl, composition, frame, output, imageFormat: 'png', browserExecutable});
	hashes.push(createHash('sha256').update(readFileSync(output)).digest('hex'));
}
const ok = hashes[0] === hashes[1];
console.log(`${id} frame ${frame} : ${ok ? 'DÉTERMINISTE ✓' : 'NON DÉTERMINISTE ✗'}\n${hashes.join('\n')}`);
process.exit(ok ? 0 : 1);
