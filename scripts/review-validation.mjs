// Règles de verdict, partagées par scripts/verdict.mjs et les tests. Fonctions pures, sans accès disque.
// Le verdict est calculé, jamais écrit à la main : le critique note, le script décide.

export const CRITERES = {
	clarte: 'Clarté du message',
	hierarchie: 'Hiérarchie',
	rythme: 'Rythme',
	mouvement: 'Qualité du mouvement',
	lisibilite: 'Lisibilité (360 px)',
	marque: 'Fidélité à la marque',
	finition: 'Finition',
};

// Seuils. LIVRABLE autorise la diffusion publique ; PILOTE INTERNE seulement un usage interne.
export const SEUILS = {livrable: {moyenne: 8, min: 7}, pilote: {moyenne: 7.5, min: 7}};
export const CIBLES = ['public', 'interne'];

/** Contrôle la forme d'un review.json et renvoie la liste des erreurs (vide si valide). */
export function reviewErrors(r) {
	const e = [];
	if (!r || typeof r !== 'object') return ['review.json absent ou illisible.'];
	if (!/^[A-Z][A-Za-z0-9]*-(9x16|1x1|16x9)$/.test(r.id ?? '')) e.push(`id invalide : ${r.id}`);
	if (!CIBLES.includes(r.cible)) e.push(`cible doit valoir ${CIBLES.join(' ou ')} (reçu : ${r.cible}).`);
	if (!Number.isInteger(r.passe) || r.passe < 1) e.push('passe doit être un entier ≥ 1.');
	if (!r.critique || typeof r.critique !== 'string') e.push('critique : qui a noté (ex. « motion-critic », « Codex », « Nathi »).');
	for (const k of Object.keys(CRITERES)) {
		const v = r.notes?.[k];
		if (!Number.isInteger(v) || v < 1 || v > 10) e.push(`notes.${k} doit être un entier de 1 à 10 (reçu : ${v}).`);
	}
	for (const k of Object.keys(r.notes ?? {})) if (!(k in CRITERES)) e.push(`notes.${k} : critère inconnu.`);
	if (!Array.isArray(r.defauts)) e.push('defauts doit être une liste (les 3 pires défauts, vide seulement si aucun).');
	else r.defauts.forEach((d, i) => {
		if (!Array.isArray(d.t) || d.t.length !== 2 || !d.t.every(Number.isFinite)) e.push(`defauts[${i}].t doit valoir [début, fin] en secondes.`);
		if (!d.preuve) e.push(`defauts[${i}].preuve manquante.`);
		if (!d.correctif) e.push(`defauts[${i}].correctif manquant (fichier et valeur).`);
	});
	return e;
}

export const moyenne = (notes) => {
	const v = Object.keys(CRITERES).map((k) => notes[k]);
	return v.reduce((a, b) => a + b, 0) / v.length;
};

/**
 * Verdict d'un rendu : technique d'abord (qa final), puis notes.
 * qa : contenu de reviews/<id>/qa.json (ou null s'il manque).
 */
export function verdict(review, qa) {
	const raisons = [];
	if (!qa) raisons.push('Validation technique absente : lancer npm run render puis npm run qa (sans --preflight).');
	else if (qa.mode !== 'final') raisons.push('Seul un précontrôle a été exécuté : il ne valide jamais une livraison.');
	else if (!qa.technicalPassed) raisons.push(`Validation technique en échec : ${Object.entries(qa.counts).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ')}.`);
	const m = moyenne(review.notes);
	const min = Math.min(...Object.keys(CRITERES).map((k) => review.notes[k]));
	const note = m >= SEUILS.livrable.moyenne && min >= SEUILS.livrable.min ? 'LIVRABLE' : m >= SEUILS.pilote.moyenne && min >= SEUILS.pilote.min ? 'PILOTE INTERNE' : 'À REPRENDRE';
	if (note === 'À REPRENDRE') raisons.push(`Note insuffisante : moyenne ${m.toFixed(2)}, minimum ${min} (pilote : ≥ ${SEUILS.pilote.moyenne} et aucun < ${SEUILS.pilote.min}).`);
	if (note === 'PILOTE INTERNE' && review.cible === 'public') raisons.push(`Diffusion publique : moyenne ${m.toFixed(2)} < ${SEUILS.livrable.moyenne} ou un critère < ${SEUILS.livrable.min}.`);
	const statut = raisons.length ? 'À REPRENDRE' : note;
	return {statut, note, moyenne: Math.round(m * 100) / 100, min, cible: review.cible, accepte: raisons.length === 0, raisons};
}

/** review.md lisible, généré depuis review.json (seule source). */
export function reviewMarkdown(review, v) {
	const rows = Object.entries(CRITERES).map(([k, label]) => `| ${label} | ${review.notes[k]} | ${review.commentaires?.[k] ?? ''} |`).join('\n');
	const fmt = ([a, b]) => `${a.toFixed(1).replace('.', ',')}–${b.toFixed(1).replace('.', ',')} s`;
	const defauts = review.defauts.length ? review.defauts.map((d, i) => `${i + 1}. ${fmt(d.t)} : ${d.preuve} → ${d.correctif}`).join('\n') : 'Aucun.';
	const corriges = review.corriges?.length ? `\n## Corrigé depuis la passe précédente\n${review.corriges.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n` : '';
	const humains = review.commentairesHumains?.length ? `\n## Commentaires de visionnage\n${review.commentairesHumains.map((c) => `- ${c.t.toFixed(1).replace('.', ',')} s (${c.auteur ?? 'relecteur'}) : ${c.texte}`).join('\n')}\n` : '';
	return `<!-- Généré par npm run verdict depuis review.json : modifier le JSON, pas ce fichier. -->
# Critique — ${review.id} (passe ${review.passe})

Critique : ${review.critique}${review.date ? ` · ${review.date}` : ''} · cible : **${review.cible}**

| Critère | Note | Commentaire |
|---|---|---|
${rows}
| **Moyenne** | **${v.moyenne.toFixed(2).replace('.', ',')}** | minimum ${v.min} |
${corriges}
## Défauts restants
${defauts}
${humains}
## Verdict : **${v.statut}**
${v.raisons.length ? v.raisons.map((r) => `- ${r}`).join('\n') : `- Note : ${v.note}. Validation technique finale réussie.`}
${review.controles ? `\nContrôles : ${review.controles}\n` : ''}`;
}
