import React from 'react';
import {Composition, Folder} from 'remotion';
import './lib/fonts';
import {PremierJour} from './films/premier-jour/PremierJour';
import {defaultPremierJour, premierJourSchema} from './films/premier-jour/schema';
import {DURATION, FPS} from './films/premier-jour/timeline';

// Un film = un dossier, décliné en 3 formats recomposés depuis la même timeline.
const FORMATS = [
	{id: '9x16', width: 1080, height: 1920},
	{id: '1x1', width: 1080, height: 1080},
	{id: '16x9', width: 1920, height: 1080},
] as const;

export const Root: React.FC = () => (
	<Folder name="premier-jour">
		{FORMATS.map((f) => (
			<Composition
				key={f.id}
				id={`PremierJour-${f.id}`}
				component={PremierJour}
				schema={premierJourSchema}
				defaultProps={defaultPremierJour}
				durationInFrames={DURATION}
				fps={FPS}
				width={f.width}
				height={f.height}
			/>
		))}
	</Folder>
);
