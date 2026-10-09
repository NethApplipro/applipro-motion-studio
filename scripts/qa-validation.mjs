// Pure validation helpers shared by the CLI and regression tests.
export function qaOptions(flags, formats) {
	for (const key of Object.keys(flags)) if (!['step', 'preflight', 'loop'].includes(key)) throw new Error(`Option QA inconnue : --${key}`);
	for (const key of ['preflight', 'loop']) if (flags[key] !== undefined && flags[key] !== true) throw new Error(`--${key} ne prend pas de valeur.`);
	const preflight = flags.preflight === true;
	const step = Number(flags.step ?? (preflight ? 5 : 1));
	if (!Number.isSafeInteger(step) || step < 1) throw new Error('--step doit être un entier positif.');
	if (!preflight && step !== 1) throw new Error('La validation finale contrôle chaque frame. Utiliser --preflight pour échantillonner.');
	if (formats.some((f) => !['9x16', '1x1', '16x9'].includes(f))) throw new Error('Format inconnu : choisir 9x16, 1x1 ou 16x9.');
	return {preflight, step};
}

export function videoIssues(probe, composition) {
	const video = probe.streams?.find((s) => s.codec_type === 'video');
	const audio = probe.streams?.find((s) => s.codec_type === 'audio');
	const expected = {codec_name: 'h264', width: composition.width, height: composition.height,
		pix_fmt: 'yuv420p', color_range: 'tv', color_space: 'bt709', nb_read_frames: String(composition.durationInFrames)};
	const issues = [];
	for (const [key, value] of Object.entries(expected)) if (String(video?.[key]) !== String(value)) issues.push(`${key} = ${video?.[key] ?? 'absent'} au lieu de ${value}.`);
	const [num, den] = String(video?.avg_frame_rate ?? '').split('/').map(Number);
	if (!Number.isFinite(num / den) || Math.abs(num / den - composition.fps) > 0.000001) issues.push(`Cadence invalide : ${video?.avg_frame_rate ?? 'absente'}.`);
	if (audio?.codec_name !== 'aac') issues.push(`Audio = ${audio?.codec_name ?? 'absent'} au lieu de aac.`);
	return issues;
}

export function loudnessIssues(measurement) {
	const valid = (v) => (typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) && Number.isFinite(Number(v));
	if (!valid(measurement.input_i) || !valid(measurement.input_tp)) return ['Mesure loudness absente ou non finie.'];
	return Math.abs(Number(measurement.input_i) + 14) > 1 || Number(measurement.input_tp) > -1
		? [`${measurement.input_i} LUFS, crête ${measurement.input_tp} dBTP.`] : [];
}
