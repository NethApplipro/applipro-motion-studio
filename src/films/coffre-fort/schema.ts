import {z} from 'zod';

// Réglages modifiables en direct dans Remotion Studio (panneau « Props »).
export const coffreFortSchema = z.object({
	sousTitres: z.tuple([z.string(), z.string(), z.string(), z.string()]),
	fichier: z.string(),
	destinataire: z.string(),
	signature: z.tuple([z.string(), z.string()]),
	ressort: z.enum(['snappy', 'default', 'heavy', 'playful']),
	musique: z.boolean(),
});
export type CoffreFortProps = z.infer<typeof coffreFortSchema>;

export const defaultCoffreFort: CoffreFortProps = {
	sousTitres: ['Chaque document **RH**,', 'à sa **place**,', 'déposé en un **geste**,', 'suivi jusqu’à la **signature**.'],
	fichier: 'Contrat_CDI.pdf',
	destinataire: 'Camille',
	signature: ['Tous vos documents RH.', 'Toujours là.'],
	ressort: 'default',
	musique: true,
};
