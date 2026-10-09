import {beat} from '../../lib/motion';

// Chronologie du film (30 fps, 120 BPM → 1 temps = 15 frames). Une frame = un nombre, ici seulement.
// Style morph-continu : un événement par temps. Shot list : films/coffre-fort/shotlist.md.
export const FPS = 30;
export const DURATION = 420; // 14 s = 28 temps

export const T = {
	// 0–2 s : la tuile Coffre-fort, le curseur arrive et clique
	cursorToTile: beat(0) + 4,
	clickTile: beat(2),
	// 2–5 s : la tuile s'ouvre en panneau de dossiers
	toPanel: beat(2) + 3,
	rows: [beat(3), beat(3) + 4, beat(3) + 8, beat(4), beat(4) + 4],
	cursorToPaie: beat(5),
	clickPaie: beat(6),
	cursorToContrat: beat(7),
	clickContrat: beat(8),
	// 5–7,5 s : zone de dépôt et glisser-déposer
	toDrop: beat(10),
	chipIn: beat(10) + 8,
	cursorToChip: beat(10) + 6,
	grab: beat(11) + 5,
	drag: beat(12),
	drop: beat(13),
	progress: [beat(13) + 2, beat(15) - 2] as const,
	// 7,5–10 s : la ligne du fichier et son état
	toRow: beat(15),
	cursorAway: beat(15) + 4,
	signed: beat(18),
	// 10–13 s : clôture
	toClose: beat(20),
	line1: beat(21),
	line2: beat(22),
	logo: beat(23),
	url: beat(24),
	// 13–14 s : retour à la tuile (boucle)
	toTile: beat(25) + 7,
	cursorHome: beat(25) + 7,
	// Sous-titres (hors de la forme)
	caps: [0, beat(6), beat(11), beat(15)],
	capsOut: [beat(5) + 7, beat(10) + 7, beat(14) + 7, beat(19) + 7],
} as const;

export const SFX: {at: number; file: string; volume: number}[] = [
	{at: T.clickTile, file: 'click.wav', volume: 0.6},
	{at: T.toPanel, file: 'swish.wav', volume: 0.35},
	...T.rows.map((at, i) => ({at, file: i % 2 ? 'pop-2.wav' : 'pop.wav', volume: 0.35})),
	{at: T.clickPaie, file: 'click.wav', volume: 0.6},
	{at: T.clickContrat, file: 'click.wav', volume: 0.6},
	{at: T.toDrop, file: 'swish.wav', volume: 0.35},
	{at: T.chipIn, file: 'pop.wav', volume: 0.4},
	{at: T.drag, file: 'whoosh.wav', volume: 0.4},
	{at: T.drop, file: 'click.wav', volume: 0.6},
	{at: T.progress[1], file: 'tick-1.wav', volume: 0.5},
	{at: T.toRow, file: 'swish.wav', volume: 0.35},
	{at: T.signed, file: 'tick-3.wav', volume: 0.6},
	{at: T.toClose, file: 'thump.wav', volume: 0.6},
	{at: T.logo, file: 'chime.wav', volume: 0.6},
	{at: T.toTile, file: 'swish.wav', volume: 0.35},
];
