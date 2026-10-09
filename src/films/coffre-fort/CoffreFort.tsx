import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, C, GRADIENT, SANS} from '../../lib/brand';
import {ease, sp} from '../../lib/motion';
import {FormatKind, useFormat} from '../../lib/format';
import {Logo} from '../../components/Logo';
import {Icon} from '../../components/app/Icons';
import {Cursor, cursorAt, MorphShape, shapeAt, ShapeState, splitSpring, swap} from '../../components/style/Morph';
import {KineticText} from '../../components/style/Kinetic';
import {CoffreFortProps} from './schema';
import {DURATION, SFX, T} from './timeline';

// Style morph-continu : une seule forme blanche qui ne coupe jamais (films/coffre-fort/style-guide.md).
// Toutes les mesures de la scène sont en unités de scène (1 unité = 1 px en 1:1), converties par S.

// Mise en page recomposée par format : scène (centre, échelle) et sous-titres.
const LAYOUT: Record<FormatKind, {stage: {cx: number; cy: number; scale: number}; cap: {x: number; y: number; w: number; size: number; align: 'left' | 'center'}; close: {w: number; h: number}}> = {
	square: {stage: {cx: 540, cy: 610, scale: 1}, cap: {x: 80, y: 90, w: 920, size: 58, align: 'left'}, close: {w: 900, h: 600}},
	vertical: {stage: {cx: 540, cy: 1010, scale: 1.3}, cap: {x: 90, y: 250, w: 820, size: 76, align: 'left'}, close: {w: 760, h: 760}},
	landscape: {stage: {cx: 1280, cy: 560, scale: 1.25}, cap: {x: 120, y: 400, w: 560, size: 74, align: 'left'}, close: {w: 980, h: 640}},
};

// États de la forme (unités de scène, centre de la scène = 0,0).
const TILE: ShapeState = {x: 0, y: 0, w: 300, h: 300, r: 44};
const PANEL: ShapeState = {x: 0, y: 0, w: 640, h: 560, r: 36};
const DROP: ShapeState = {x: 0, y: -20, w: 680, h: 380, r: 32};
const ROW: ShapeState = {x: 0, y: 0, w: 760, h: 140, r: 26};

const FOLDERS = ['Contrat', 'Fiche de paie', 'Mes Documents', 'Onboarding', 'Perso'];
const rowTop = (i: number) => -280 + 104 + i * 80; // haut de la ligne i dans le panneau (unités de scène)

// Position du curseur aux points clés (unités de scène).
const HOME = {x: 360, y: 340};
const CHIP = {x: 250, y: 300};

export const CoffreFort: React.FC<CoffreFortProps> = (p) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {width, height, kind, u} = useFormat();
	const L = LAYOUT[kind];
	const S = L.stage.scale * u;
	const X = (v: number) => L.stage.cx * u + v * S;
	const Y = (v: number) => L.stage.cy * u + v * S;
	const px = (v: number) => v * S;
	const CLOSE: ShapeState = {x: 0, y: 0, w: L.close.w, h: L.close.h, r: 52};

	// --- La forme ---------------------------------------------------------------------------
	const shape = shapeAt(frame, fps, TILE, [
		{at: T.toPanel, to: PANEL},
		{at: T.toDrop, to: DROP},
		{at: T.toRow, to: ROW},
		{at: T.toClose, to: CLOSE, preset: 'heavy'},
		{at: T.toTile, to: TILE},
	], p.ressort);
	const s = {x: X(shape.x), y: Y(shape.y), w: px(shape.w), h: px(shape.h), r: px(shape.r)};

	// --- Le curseur ----------------------------------------------------------------------------
	const paieY = rowTop(1) + 32;
	const contratY = rowTop(0) + 32;
	const cur = cursorAt(frame, fps, HOME, [
		{at: T.cursorToTile, x: 40, y: 50},
		{at: T.cursorToPaie, x: -90, y: paieY},
		{at: T.cursorToContrat, x: -110, y: contratY},
		{at: T.cursorToChip, x: CHIP.x - 60, y: CHIP.y + 10},
		{at: T.drag, x: 20, y: 30, preset: 'heavy'},
		{at: T.cursorAway, x: 440, y: 420},
		{at: T.cursorHome, x: HOME.x, y: HOME.y},
	], [T.clickTile, T.clickPaie, T.clickContrat, T.grab, T.drop]);

	// --- Contenus échangés dans la forme ---------------------------------------------------------
	const tileC = swap(frame, fps, -30, T.toPanel - 2);
	const tileBack = swap(frame, fps, T.toTile + 6);
	const panelC = swap(frame, fps, T.toPanel + 6, T.toDrop - 2);
	const dropC = swap(frame, fps, T.toDrop + 6, T.toRow - 2);
	const rowC = swap(frame, fps, T.toRow + 6, T.toClose - 2);
	const tilePress = Math.max(0, 1 - Math.abs(frame - T.clickTile - 3) / 6);

	// Sélection de dossier : deux bords, le bord avant mène (splitSpring).
	const [selTop, selBottom] = splitSpring(frame, fps, [rowTop(0), rowTop(0) + 64], [
		{at: T.clickPaie + 2, to: [rowTop(1), rowTop(1) + 64]},
		{at: T.clickContrat + 2, to: [rowTop(0), rowTop(0) + 64]},
	]);

	// Pièce jointe glissée : suit le curseur entre la saisie et le lâcher, puis plonge dans la zone.
	const chipIn = sp(frame, fps, T.chipIn, 'snappy');
	const held = frame >= T.grab && frame < T.drop;
	const dropped = sp(frame, fps, T.drop, 'snappy');
	// Après le lâcher, la pièce suit encore le curseur (qui ralentit en ressort) et rejoint sa pointe : pas d'arrêt sec.
	const grip = frame < T.drop ? 1 : 1 - dropped;
	const chipX = frame < T.grab ? CHIP.x : cur.x + 60 * grip;
	const chipY = frame < T.grab ? CHIP.y : cur.y - 10 * grip;
	const over = frame >= T.drag + 8 && frame < T.toRow;
	const progress = ease(frame, [...T.progress]);
	const signed = sp(frame, fps, T.signed, 'snappy');

	// Clôture.
	const closeIn = sp(frame, fps, T.toClose + 4, 'heavy') - sp(frame, fps, T.toTile - 4, 'snappy');
	const line1 = swap(frame, fps, T.line1, T.toTile - 6);
	const line2 = swap(frame, fps, T.line2, T.toTile - 6);
	const logoDraw = ease(frame, [T.logo, T.logo + 22]) * (1 - sp(frame, fps, T.toTile - 6, 'snappy'));
	const logoWord = ease(frame, [T.logo + 10, T.logo + 26]);
	const urlC = swap(frame, fps, T.url, T.toTile - 6);
	const closeSize = (base: number, min: number) => Math.max(px(base), min * u);

	const content = (state: ShapeState, style: {opacity: number; filter: string; transform: string}, children: React.ReactNode) => (
		<div style={{position: 'absolute', left: '50%', top: '50%', width: px(state.w), height: px(state.h), marginLeft: -px(state.w) / 2, marginTop: -px(state.h) / 2, opacity: style.opacity, filter: style.filter, transform: style.transform}}>
			{children}
		</div>
	);

	const tileContent = (c: ReturnType<typeof swap>) =>
		c.opacity > 0.001
			? content(TILE, c, (
				<>
					<div style={{position: 'absolute', left: px(36), top: px(36), width: px(76), height: px(76), borderRadius: px(18), background: C.blue05, color: C.blue, display: 'grid', placeItems: 'center'}}><Icon name="lock" size={px(38)} /></div>
					<div style={{position: 'absolute', left: px(36), top: px(170), fontSize: px(34), fontWeight: 700, color: C.black, letterSpacing: -px(0.8)}}>Coffre-fort</div>
					<div style={{position: 'absolute', left: px(36), top: px(222), fontSize: px(22), color: C.grey60}}>Disponible</div>
				</>
			))
			: null;

	return (
		<AbsoluteFill style={{background: C.grey05, fontFamily: SANS}}>
			{p.sousTitres.map((text, i) => (
				<div key={i} style={{position: 'absolute', left: L.cap.x * u, top: L.cap.y * u, width: L.cap.w * u}}>
					<KineticText text={text} at={T.caps[i]} outAt={T.capsOut[i]} size={L.cap.size * u} color={C.dark} accent={C.blue} align={L.cap.align} />
				</div>
			))}

			<MorphShape s={s} background={tilePress > 0 ? `rgba(255,255,255,${1 - tilePress * 0.04})` : '#FFFFFF'} shadow={`0 ${px(24)}px ${px(60)}px -${px(30)}px rgba(14,14,82,.28)`}>
				{/* Dégradé de clôture : fondu dans la forme, jamais une coupe. */}
				{closeIn > 0.001 ? <div style={{position: 'absolute', inset: 0, background: GRADIENT, opacity: closeIn}} /> : null}
				{tileContent(tileC)}
				{tileContent(tileBack)}

				{panelC.opacity > 0.001
					? content(PANEL, panelC, (
						<>
							<div style={{position: 'absolute', left: px(40), top: px(36), fontSize: px(34), fontWeight: 700, color: C.black, letterSpacing: -px(0.8)}}>Coffre-fort</div>
							<div style={{position: 'absolute', left: px(40), right: px(40), top: px(92), height: Math.max(1, px(2)), background: C.grey10}} />
							<div style={{position: 'absolute', left: px(28), right: px(28), top: px(280 + selTop), height: px(selBottom - selTop), borderRadius: px(16), background: C.blue}} />
							{FOLDERS.map((name, i) => {
								const r = sp(frame, fps, T.rows[i], 'snappy');
								// Texte blanc dès que la sélection couvre plus de la moitié de la ligne.
								const on = (Math.min(selBottom, rowTop(i) + 64) - Math.max(selTop, rowTop(i))) / 64 > 0.5;
								return (
									<div key={name} style={{position: 'absolute', left: px(52), top: px(280 + rowTop(i)), height: px(64), display: 'flex', alignItems: 'center', gap: px(22), opacity: r, transform: `translateX(${(1 - r) * px(30)}px)`, color: on ? '#FFFFFF' : C.black, fontSize: px(26), fontWeight: 500}}>
										<span style={{color: on ? '#FFFFFF' : C.blue, display: 'grid'}}><Icon name="folder" size={px(32)} /></span>
										{name}
									</div>
								);
							})}
						</>
					))
					: null}

				{dropC.opacity > 0.001
					? content(DROP, dropC, (
						<>
							<div style={{position: 'absolute', inset: px(22), borderRadius: px(20), border: `${Math.max(1.5, px(3))}px dashed ${over ? C.blue : C.grey20}`, background: over ? C.blue05 : 'transparent'}} />
							<div style={{position: 'absolute', left: 0, right: 0, top: px(78), display: 'flex', justifyContent: 'center', color: C.blue}}><Icon name="upload" size={px(64)} /></div>
							<div style={{position: 'absolute', left: px(40), right: px(40), top: px(168), textAlign: 'center', fontSize: px(26), fontWeight: 500, color: C.black}}>Déposer un fichier ou cliquer pour parcourir</div>
							<div style={{position: 'absolute', left: px(40), right: px(40), top: px(214), textAlign: 'center', fontSize: px(19), color: C.grey60}}>PDF, Word, Excel, PowerPoint ou image (max. 5 Mo)</div>
							<div style={{position: 'absolute', left: px(120), right: px(120), top: px(282), height: px(10), borderRadius: px(10), background: C.blue05, overflow: 'hidden', opacity: frame >= T.drop ? 1 : 0}}>
								<div style={{width: `${progress * 100}%`, height: '100%', background: C.blue, borderRadius: px(10)}} />
							</div>
						</>
					))
					: null}

				{rowC.opacity > 0.001
					? content(ROW, rowC, (
						<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: `0 ${px(34)}px`, gap: px(22)}}>
							<div style={{width: px(68), height: px(68), borderRadius: px(16), background: C.blue05, color: C.blue, display: 'grid', placeItems: 'center'}}><Icon name="pdf" size={px(34)} /></div>
							<div style={{flex: 1}}>
								<div style={{fontSize: px(28), fontWeight: 600, color: C.black}}>{p.fichier}</div>
								<div style={{fontSize: px(20), color: C.grey60, marginTop: px(4)}}>Partagé à {p.destinataire}</div>
							</div>
							<div style={{position: 'relative', height: px(48), width: px(300)}}>
								<div style={{position: 'absolute', right: 0, top: 0, height: px(48), display: 'flex', alignItems: 'center', padding: `0 ${px(18)}px`, borderRadius: px(99), background: C.grey05, color: C.grey60, fontSize: px(19), fontWeight: 500, whiteSpace: 'nowrap', opacity: 1 - signed, transform: `translateY(${-signed * px(14)}px)`}}>En attente de signature</div>
								<div style={{position: 'absolute', right: 0, top: 0, height: px(48), display: 'flex', alignItems: 'center', gap: px(6), padding: `0 ${px(18)}px`, borderRadius: px(99), background: C.green20, color: C.green, fontSize: px(21), fontWeight: 600, opacity: signed, transform: `translateY(${(1 - signed) * px(14)}px) scale(${0.9 + 0.1 * signed})`}}><Icon name="check" size={px(24)} />Signé</div>
							</div>
						</div>
					))
					: null}

				{closeIn > 0.001 ? (
					<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: px(kind === 'vertical' ? 90 : 56), color: '#FFFFFF', textAlign: 'center'}}>
						<div style={{fontSize: closeSize(66, 58), fontWeight: 600, letterSpacing: -px(2.5), lineHeight: 1.12}}>
							<div data-qa="caption" style={{opacity: line1.opacity * 0.75, transform: line1.transform, filter: line1.filter}}>{p.signature[0]}</div>
							<div data-qa="caption" style={{opacity: line2.opacity, transform: line2.transform, filter: line2.filter}}>{p.signature[1]}</div>
						</div>
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(18)}}>
							<div style={{opacity: logoDraw > 0 ? 1 : 0}}><Logo size={px(70)} draw={logoDraw} word={logoWord} /></div>
							<div data-qa="text" style={{fontSize: closeSize(30, 30), fontWeight: 500, opacity: urlC.opacity * 0.85, transform: urlC.transform}}>{BRAND.url}</div>
						</div>
					</div>
				) : null}
			</MorphShape>

			{/* Pièce jointe : hors de la forme tant qu'elle n'est pas déposée. */}
			{chipIn > 0.001 && dropped < 0.999 ? (
				<div data-motion="piece-jointe" style={{position: 'absolute', left: X(chipX), top: Y(chipY), transform: `translate(-50%, -50%) scale(${(0.7 + 0.3 * chipIn) * (held ? 1.04 : 1) * (1 - 0.5 * dropped)}) rotate(${held ? -3 : 0}deg)`, opacity: chipIn * (1 - dropped), display: 'flex', alignItems: 'center', gap: px(14), background: '#FFFFFF', borderRadius: px(18), padding: `${px(16)}px ${px(22)}px`, boxShadow: `0 ${px(held ? 26 : 12)}px ${px(held ? 50 : 30)}px -${px(14)}px rgba(14,14,82,${held ? 0.35 : 0.22})`}}>
					<span style={{color: C.blue, display: 'grid'}}><Icon name="pdf" size={px(32)} /></span>
					<span style={{fontSize: px(24), fontWeight: 600, color: C.black, whiteSpace: 'nowrap'}}>{p.fichier}</span>
				</div>
			) : null}

			<Cursor x={X(cur.x)} y={Y(cur.y)} press={cur.press} size={px(46)} color={C.black} outline="#FFFFFF" ring={C.blue} />

			{p.musique ? <Audio src={staticFile('audio/bed.wav')} volume={(f) => interpolate(f, [0, 6, DURATION - 20, DURATION], [0, 0.5, 0.5, 0], {extrapolateRight: "clamp"})} /> : null}
			{SFX.map((sfx, i) => (
				<Sequence key={i} from={sfx.at} layout="none">
					<Audio src={staticFile(`audio/${sfx.file}`)} volume={sfx.volume} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
