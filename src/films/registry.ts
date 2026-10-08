import type React from 'react';
import type {z} from 'zod';
import {PremierJour} from './premier-jour/PremierJour';
import {defaultPremierJour, premierJourSchema} from './premier-jour/schema';
import {DURATION as PJ_DURATION, FPS as PJ_FPS} from './premier-jour/timeline';
// Registre des films. `npm run new-film -- <slug>` ajoute une entrée ici automatiquement.
// Chaque film est décliné en 9:16, 1:1 et 16:9 (ids : <id>-9x16, <id>-1x1, <id>-16x9).
export type FilmEntry = {
	id: string;
	component: React.FC<any>;
	schema: z.ZodObject<any>;
	defaultProps: Record<string, unknown>;
	durationInFrames: number;
	fps: number;
};

export const FILMS: FilmEntry[] = [
	{id: 'PremierJour', component: PremierJour, schema: premierJourSchema, defaultProps: defaultPremierJour, durationInFrames: PJ_DURATION, fps: PJ_FPS},
	// <new-film>
];
