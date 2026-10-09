// Verdict de livraison calculé (et non déclaré) à partir de qa.json (technique) et review.json (critique).
//   npm run verdict -- PremierJour            → 3 formats
//   npm run verdict -- PremierJour 9x16       → un format (utilisé en CI, un job par format)
// Régénère reviews/<id>/review.md depuis review.json. Code de sortie 1 si un format n'est pas livrable pour sa cible.
// Règles : scripts/review-validation.mjs. Cible « public » → chaque format doit être visionné et LIVRABLE.
// Cible « interne » → au moins un format visionné (PILOTE INTERNE accepté), les autres doivent passer la QA finale.
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {FORMATS, parseArgs} from './lib.mjs';
import {reviewErrors, reviewMarkdown, verdict} from './review-validation.mjs';

const {rest} = parseArgs();
const [film, ...only] = rest;
if (!film) throw new Error('Usage : npm run verdict -- <Film> [formats…]');
const formats = only.length ? only : FORMATS;
const read = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

const reviews = Object.fromEntries(FORMATS.map((f) => [f, read(`reviews/${film}-${f}/review.json`)]).filter(([, r]) => r));
let failed = false;
const fail = (msg) => { failed = true; console.log(`✗ ${msg}`); };

if (!Object.keys(reviews).length) fail(`${film} : aucun review.json. Faire critiquer un rendu (sous-agent motion-critic ou passe dédiée).`);
for (const [f, r] of Object.entries(reviews)) {
	const errors = reviewErrors(r);
	if (r.id !== `${film}-${f}`) errors.push(`id ${r.id} ne correspond pas au dossier ${film}-${f}.`);
	if (errors.length) { fail(`${film}-${f}/review.json invalide :\n  - ${errors.join('\n  - ')}`); delete reviews[f]; }
}
const cible = Object.values(reviews).some((r) => r.cible === 'public') ? 'public' : 'interne';

for (const f of formats) {
	const id = `${film}-${f}`;
	const qa = read(`reviews/${id}/qa.json`);
	const review = reviews[f];
	if (review) {
		const v = verdict(review, qa);
		writeFileSync(`reviews/${id}/review.md`, reviewMarkdown(review, v));
		if (v.accepte) console.log(`✓ ${id} : ${v.statut} (moyenne ${v.moyenne}, cible ${v.cible})`);
		else fail(`${id} : ${v.statut}\n  - ${v.raisons.join('\n  - ')}`);
		continue;
	}
	if (cible === 'public') { fail(`${id} : jamais visionné. Une diffusion publique exige une critique par format.`); continue; }
	if (!qa || qa.mode !== 'final' || !qa.technicalPassed) fail(`${id} : validation technique finale absente ou en échec (npm run qa -- ${film} ${f}).`);
	else console.log(`⚠ ${id} : QA finale réussie, format non visionné (accepté pour un usage interne).`);
}
process.exit(failed ? 1 : 0);
