import {z} from 'zod';

// Paramètres modifiables en direct dans Remotion Studio (panneau « Props »).
export const premierJourSchema = z.object({
	prenom: z.string(),
	accroche: z.tuple([z.string(), z.string(), z.string()]),
	promesse: z.string(),
	parcours: z.string(),
	copilote: z.string(),
	chiffre: z.number().int().min(0),
	chiffreLegende: z.string(),
	signature: z.tuple([z.string(), z.string()]),
	ressort: z.enum(['snappy', 'default', 'heavy', 'playful']),
	musique: z.boolean(),
	zonesSures: z.boolean(),
});
export type PremierJourProps = z.infer<typeof premierJourSchema>;

export const defaultPremierJour: PremierJourProps = {
	prenom: 'Camille',
	accroche: ['Premier jour.', '3 mails. 2 PDF.', '« Tu verras lundi. »'],
	promesse: 'Avant même son arrivée, tout est prêt.',
	parcours: 'Un parcours clair, étape par étape.',
	copilote: 'Une question ? Réponse immédiate.',
	chiffre: 100000,
	chiffreLegende: 'collaborateurs déjà accompagnés',
	signature: ['Pas encore arrivé.', 'Déjà plus perdu.'],
	ressort: 'default',
	musique: true,
	zonesSures: false,
};
