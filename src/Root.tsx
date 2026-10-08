import React from 'react';
import {Composition, Folder} from 'remotion';
import './lib/fonts';
import {FILMS} from './films/registry';

// Un film = un dossier dans le Studio, décliné en 3 formats recomposés depuis la même timeline.
export const FORMATS = [
	{id: '9x16', width: 1080, height: 1920},
	{id: '1x1', width: 1080, height: 1080},
	{id: '16x9', width: 1920, height: 1080},
] as const;

export const Root: React.FC = () => (
	<>
		{FILMS.map((film) => (
			<Folder key={film.id} name={film.id}>
				{FORMATS.map((f) => (
					<Composition
						key={f.id}
						id={`${film.id}-${f.id}`}
						component={film.component}
						schema={film.schema}
						defaultProps={film.defaultProps}
						durationInFrames={film.durationInFrames}
						fps={film.fps}
						width={f.width}
						height={f.height}
					/>
				))}
			</Folder>
		))}
	</>
);
