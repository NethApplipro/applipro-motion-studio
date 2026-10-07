import React from 'react';
import {SANS} from '../lib/brand';

/**
 * Logo Applipro redessiné d'après la planche DA (deux carrés arrondis qui se chevauchent).
 * À remplacer par le SVG officiel : déposer brand/logo-mark.svg et l'importer ici.
 * draw 0→1 : tracé progressif du symbole.
 */
export const LogoMark: React.FC<{size: number; color?: string; draw?: number}> = ({size, color = 'white', draw = 1}) => {
	const len = 64; // périmètre approx. d'un carré 15×15 arrondi
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinejoin="round">
			<rect x="2" y="7" width="15" height="15" rx="5" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
			<rect x="7" y="2" width="15" height="15" rx="5" strokeDasharray={len} strokeDashoffset={len * (1 - Math.max(0, draw * 1.25 - 0.25))} />
		</svg>
	);
};

export const Logo: React.FC<{size: number; color?: string; draw?: number; word?: number}> = ({size, color = 'white', draw = 1, word = 1}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.28, color, fontFamily: SANS}}>
		<LogoMark size={size} color={color} draw={draw} />
		<div style={{fontSize: size * 0.82, fontWeight: 500, letterSpacing: -size * 0.01, overflow: 'hidden', clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`}}>Applipro</div>
	</div>
);
