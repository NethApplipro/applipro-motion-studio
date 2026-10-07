import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, GRADIENT, SANS, BRAND} from '../../lib/brand';
import {ease, mulberry32, sp, track} from '../../lib/motion';
import {FormatKind, useFormat} from '../../lib/format';
import {Captions, Cue} from '../../components/Caption';
import {CHAOS_ITEMS, ChaosCard} from '../../components/Chaos';
import {Phone, PHONE_W, Tap} from '../../components/Phone';
import {Logo} from '../../components/Logo';
import {CopilotScreen, HomeScreen, OnboardingScreen} from '../../components/app/Screens';
import {PremierJourProps} from './schema';
import {DURATION, SFX, T} from './timeline';

// Mise en page recomposée par format (jamais un simple recadrage).
const LAYOUT: Record<FormatKind, {cap: {x: number; y: number; w: number; size: number}; phone: {cx: number; cy: number; scale: number}; chaos: {x0: number; x1: number; y0: number; y1: number; card: number}; metric: number; logo: number}> = {
	vertical: {cap: {x: 90, y: 250, w: 900, size: 76}, phone: {cx: 540, cy: 1450, scale: 1.95}, chaos: {x0: 430, x1: 690, y0: 640, y1: 1700, card: 1.5}, metric: 190, logo: 96},
	square: {cap: {x: 80, y: 80, w: 920, size: 58}, phone: {cx: 540, cy: 770, scale: 1.15}, chaos: {x0: 380, x1: 700, y0: 330, y1: 1010, card: 1.05}, metric: 170, logo: 80},
	landscape: {cap: {x: 140, y: 380, w: 760, size: 74}, phone: {cx: 1400, cy: 640, scale: 1.35}, chaos: {x0: 1150, x1: 1600, y0: 160, y1: 960, card: 1.2}, metric: 210, logo: 90},
};

export const PremierJour: React.FC<PremierJourProps> = (p) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {width, height, kind, u} = useFormat();
	const L = LAYOUT[kind];
	const k = (v: number) => v * u;

	// --- Téléphone : une seule forme continue de 2,8 s à 11 s -----------------------------
	const phoneY = track(frame, fps, height, [
		{at: T.phoneIn, to: 0, preset: 'heavy'},
		{at: T.phoneOut, to: height * 1.1, preset: p.ressort},
	]);
	const phoneRot = track(frame, fps, 9, [
		{at: T.phoneIn, to: 0, preset: 'heavy'},
		{at: T.phoneOut, to: -7},
	]);
	const phoneZoom = track(frame, fps, 0.92, [
		{at: T.phoneIn, to: 1, preset: 'heavy'},
		{at: T.cap5, to: 1.035},
		{at: T.toCopilot, to: 1},
	]);
	const screenX = track(frame, fps, 0, [
		{at: T.toOnboarding, to: -PHONE_W, preset: p.ressort},
		{at: T.toCopilot, to: -PHONE_W * 2, preset: p.ressort},
	]);
	const cx = k(L.phone.cx);
	const cy = k(L.phone.cy);

	// --- Chaos : apparitions calées sur les temps, puis aspiration dans le téléphone -------
	const rnd = mulberry32(7);
	const chaos = CHAOS_ITEMS.map((item, i) => {
		const tx = k(L.chaos.x0 + (L.chaos.x1 - L.chaos.x0) * rnd());
		const ty = k(L.chaos.y0 + ((L.chaos.y1 - L.chaos.y0) * (i + rnd() * 0.6)) / CHAOS_ITEMS.length);
		const rot = (rnd() - 0.5) * 14;
		const phase = rnd() * 6;
		const inP = sp(frame, fps, T.chaos[i], 'snappy');
		const out = sp(frame, fps, T.collapse + i * 1.5, 'default');
		const drift = Math.sin(frame / 18 + phase) * k(5);
		const x = tx + (cx - tx) * out;
		const y = ty + drift + (cy - ty) * out;
		const s = (0.86 + 0.14 * inP) * (1 - 0.85 * out);
		return {item, x, y, rot: rot * (1 - out), s, o: inP * (1 - ease(frame, [T.collapse + 6, T.collapse + 16]))};
	});

	// --- Écran d'onboarding : coches et progression --------------------------------------
	const done = T.checks.map((at) => sp(frame, fps, at, 'snappy'));
	const progress = 0.06 + done.reduce((a, d) => a + d * 0.23, 0);

	// --- Preuve chiffrée -----------------------------------------------------------------
	const metricIn = sp(frame, fps, T.metric, 'snappy');
	const metricOut = sp(frame, fps, T.end - 4, 'snappy');
	const counted = Math.round(p.chiffre * ease(frame, [T.metric, T.metric + 20]));
	const metricText = `${counted.toLocaleString('fr-FR').replace(/\s/g, ' ')}${frame >= T.metric + 20 ? '+' : ''}`;

	// --- Clôture sur le dégradé de marque ------------------------------------------------
	const wipe = sp(frame, fps, T.end, 'heavy');
	const radius = Math.hypot(width, height) * wipe;
	const line1 = sp(frame, fps, T.end + 6, 'snappy');
	const line2 = sp(frame, fps, T.end + 14, 'snappy');
	const logoDraw = ease(frame, [T.logo, T.logo + 22]);
	const logoWord = ease(frame, [T.logo + 10, T.logo + 26]);
	const urlIn = sp(frame, fps, T.url, 'snappy');

	const cues: Cue[] = [
		{at: T.cap1, text: p.accroche[0]},
		{at: T.cap2, text: p.accroche[1]},
		{at: T.cap3, text: p.accroche[2]},
		{at: T.cap4, text: p.promesse},
		{at: T.cap5, text: p.parcours},
		{at: T.cap6, text: p.copilote},
	];

	const tapP = (at: number) => (frame - at) / 14;
	const tapY = [318, 390, 462];

	return (
		<AbsoluteFill style={{background: C.white, fontFamily: SANS}}>
			<Captions cues={cues} until={T.phoneOut} x={k(L.cap.x)} y={k(L.cap.y)} width={k(L.cap.w)} size={k(L.cap.size)} />

			{chaos.map(({item, x, y, rot, s, o}, i) =>
				o <= 0.001 ? null : (
					<div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, opacity: o}}>
						<ChaosCard item={item} u={u * L.chaos.card} />
					</div>
				),
			)}

			{phoneY < height * 1.05 ? (
				<Phone scale={L.phone.scale * u * phoneZoom} style={{left: cx, top: cy, transform: `translateY(${phoneY}px) rotate(${phoneRot}deg)`}}>
					<div style={{position: 'absolute', inset: 0, width: PHONE_W * 3, display: 'flex', transform: `translateX(${screenX}px)`}}>
						<div style={{position: 'relative', width: PHONE_W, height: '100%'}}>
							<HomeScreen name={p.prenom} reveal={ease(frame, [T.homeReveal, T.homeReveal + 30])} pressed={Math.max(0, 1 - Math.abs(frame - T.tapContinue - 3) / 5)} />
						</div>
						<div style={{position: 'relative', width: PHONE_W, height: '100%'}}>
							<OnboardingScreen done={done} progress={progress} />
						</div>
						<div style={{position: 'relative', width: PHONE_W, height: '100%'}}>
							<CopilotScreen
								ask={sp(frame, fps, T.ask, 'snappy')}
								thinking={interpolate(frame, [...T.thinking], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
								typing={interpolate(frame, [...T.typing], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
								chip={sp(frame, fps, T.chip, 'snappy')}
							/>
						</div>
					</div>
					<Tap x={305} y={338} p={tapP(T.tapContinue - 4)} />
					{T.taps.map((at, i) => <Tap key={at} x={300} y={tapY[i]} p={tapP(at)} />)}
					<Tap x={190} y={327} p={tapP(T.tapSuggestion)} />
				</Phone>
			) : null}

			{frame >= T.metric - 2 && frame < T.end + 20 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: height / 2 - k(L.metric) * 0.75, textAlign: 'center', opacity: metricIn * (1 - metricOut), transform: `translateY(${(1 - metricIn) * k(40) - metricOut * k(60)}px)`}}>
					<div style={{fontSize: k(L.metric), fontWeight: 700, color: C.blue, letterSpacing: -k(L.metric) * 0.04, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{metricText}</div>
					<div style={{fontSize: k(L.metric * 0.24), fontWeight: 500, color: C.dark, marginTop: k(18)}}>{p.chiffreLegende}</div>
				</div>
			) : null}

			{wipe > 0.001 ? (
				<AbsoluteFill style={{clipPath: `circle(${radius}px at 50% 60%)`, background: GRADIENT}}>
					{[0, 1, 2, 3, 4].map((i) => {
						const r = k(420 + i * 260) * (0.85 + 0.15 * sp(frame, fps, T.end + i * 3, 'heavy'));
						return <div key={i} style={{position: 'absolute', left: '82%', top: '18%', width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, borderRadius: '50%', background: `rgba(255,255,255,${0.035 + i * 0.008})`}} />;
					})}
					<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: k(kind === 'vertical' ? 120 : 70), color: '#FFFFFF', textAlign: 'center'}}>
						<div style={{fontSize: k(kind === 'square' ? 66 : 82), fontWeight: 600, letterSpacing: -k(3), lineHeight: 1.1}}>
							<div style={{opacity: line1 * 0.72, transform: `translateY(${(1 - line1) * k(30)}px)`}}>{p.signature[0]}</div>
							<div style={{opacity: line2, transform: `translateY(${(1 - line2) * k(30)}px)`}}>{p.signature[1]}</div>
						</div>
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: k(22)}}>
							<div style={{opacity: logoDraw > 0 ? 1 : 0}}><Logo size={k(L.logo)} draw={logoDraw} word={logoWord} /></div>
							<div style={{fontSize: k(L.logo * 0.33), fontWeight: 500, opacity: urlIn * 0.85, transform: `translateY(${(1 - urlIn) * k(14)}px)`}}>
								{BRAND.baseline} · {BRAND.url}
							</div>
						</div>
					</div>
				</AbsoluteFill>
			) : null}

			{p.musique ? <Audio src={staticFile('audio/bed.wav')} volume={(f) => interpolate(f, [0, 6, DURATION - 20, DURATION], [0, 0.55, 0.55, 0], {extrapolateRight: 'clamp'})} /> : null}
			{SFX.map((s, i) => (
				<Sequence key={i} from={s.at} durationInFrames={45} layout="none">
					<Audio src={staticFile(`audio/${s.file}`)} volume={s.volume} />
				</Sequence>
			))}

			{p.zonesSures && kind === 'vertical' ? (
				<>
					<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: k(220), background: 'rgba(204,41,54,.25)'}} />
					<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: k(420), background: 'rgba(204,41,54,.25)'}} />
					<div style={{position: 'absolute', right: 0, top: k(220), bottom: k(420), width: k(150), background: 'rgba(204,41,54,.18)'}} />
				</>
			) : null}
		</AbsoluteFill>
	);
};
