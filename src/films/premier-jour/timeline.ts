import {beat} from '../../lib/motion';

// Toute la chronologie du film en un seul endroit (30 fps, 120 BPM → 1 temps = 15 frames).
// Modifier un chiffre ici décale l'image ET le son associé.
export const FPS = 30;
export const DURATION = 450; // 15 s

export const T = {
	// 0–3 s : accroche, le chaos du premier jour
	chaos: [beat(1), beat(1) + 7, beat(2), beat(3), beat(3) + 7, beat(4)],
	cap1: 0,
	cap2: beat(2),
	cap3: beat(4),
	collapse: 80,
	// 3–5,5 s : l'app apparaît, tout est prêt
	phoneIn: 84,
	homeReveal: 88,
	cap4: beat(6) + 6,
	tapContinue: 146,
	toOnboarding: 156,
	// 5,5–8,5 s : parcours d'onboarding qui se coche
	cap5: beat(11),
	taps: [beat(12) + 10, beat(13) + 10, beat(14) + 10],
	checks: [beat(13), beat(14), beat(15)],
	// 8,5–11 s : copilote RH
	toCopilot: beat(16) + 5,
	cap6: beat(17),
	tapSuggestion: beat(17) + 4,
	ask: beat(17) + 9,
	thinking: [beat(18) + 2, beat(19) + 2] as const,
	typing: [beat(19) + 2, beat(21)] as const,
	chip: beat(21) + 4,
	// 11–12,5 s : la preuve chiffrée
	phoneOut: beat(22),
	metric: beat(22) + 4,
	// 12,5–15 s : clôture
	end: beat(25),
	logo: beat(26) + 5,
	url: beat(27) + 5,
} as const;

export const SFX: {at: number; file: string; volume: number}[] = [
	...T.chaos.map((at, i) => ({at, file: i % 2 ? 'pop-2.wav' : 'pop.wav', volume: 0.5})),
	{at: T.collapse - 4, file: 'whoosh.wav', volume: 0.6},
	{at: T.phoneIn + 10, file: 'thump.wav', volume: 0.7},
	{at: T.tapContinue, file: 'click.wav', volume: 0.6},
	{at: T.toOnboarding, file: 'swish.wav', volume: 0.35},
	...T.checks.map((at, i) => ({at, file: `tick-${i + 1}.wav`, volume: 0.55})),
	{at: T.toCopilot, file: 'swish.wav', volume: 0.35},
	{at: T.tapSuggestion, file: 'click.wav', volume: 0.6},
	{at: T.chip, file: 'pop.wav', volume: 0.4},
	{at: T.phoneOut, file: 'whoosh.wav', volume: 0.5},
	{at: T.end, file: 'thump.wav', volume: 0.6},
	{at: T.logo, file: 'chime.wav', volume: 0.6},
];
