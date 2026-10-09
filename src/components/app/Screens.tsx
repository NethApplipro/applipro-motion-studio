import React from 'react';
import {C, SANS} from '../../lib/brand';
import {Button, Progress, TabBar, TopBar} from './Chrome';
import {Icon, IconName} from './Icons';

// Écrans redessinés d'après references/applipro-ui (FO_01, FO_51, FO_03). Coordonnées : iPhone 390 × 844.
const screen: React.CSSProperties = {position: 'absolute', inset: 0, background: C.white, fontFamily: SANS, color: C.black, overflow: 'hidden'};
const card: React.CSSProperties = {background: '#FFFFFF', borderRadius: 16, boxShadow: '0 1px 3px rgba(10,20,50,.06), 0 6px 18px rgba(10,20,50,.05)'};

export const HomeScreen: React.FC<{name: string; reveal: number; pressed?: number}> = ({name, reveal, pressed = 0}) => {
	// reveal 0→1 : les blocs montent l'un après l'autre.
	const rise = (i: number) => {
		const r = Math.min(1, Math.max(0, reveal * 3 - i * 0.6));
		return {opacity: r, transform: `translateY(${(1 - r) * 18}px)`};
	};
	return (
		<div style={screen}>
			<TopBar />
			<div style={{position: 'absolute', top: 112, left: 20, right: 20}}>
				<div style={{...rise(0), fontSize: 32, fontWeight: 700, letterSpacing: -1.1}}>Bonjour {name}</div>
				<div style={{...rise(0), fontSize: 14, color: C.grey60, marginTop: 6}}>Bienvenue sur le livret digital Applipro</div>
				<div style={{...rise(1), ...card, marginTop: 22, padding: 18}}>
					<div style={{fontSize: 10.5, fontWeight: 700, color: C.blue, letterSpacing: 0.6}}>PRÉBOARDING</div>
					<div style={{fontSize: 17, fontWeight: 700, letterSpacing: -0.4, marginTop: 6, lineHeight: 1.25}}>Les essentiels avant votre arrivée</div>
					<div style={{marginTop: 16}}><Progress value={0.06} /></div>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16}}>
						<span style={{fontSize: 12.5, color: C.grey60}}>4 tâches à faire</span>
						<Button pressed={pressed}>Continuer</Button>
					</div>
				</div>
				<div style={{...rise(2), fontSize: 16, fontWeight: 700, marginTop: 26, display: 'flex', alignItems: 'center', gap: 8}}>
					<span style={{width: 7, height: 7, borderRadius: 9, background: C.blue}} />À traiter
				</div>
				{[
					['Signature de votre contrat', 'Une action à réaliser', 0],
					['Premiers jours', '2 actions à réaliser', 2],
					['Bienvenue', '4 actions à réaliser', 4],
				].map(([t, s, n], i) => (
					<div key={t as string} style={{...rise(2 + i * 0.4), ...card, marginTop: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12}}>
						<div style={{width: 34, height: 34, borderRadius: 9, background: C.blue05, color: C.blue, display: 'grid', placeItems: 'center'}}><Icon name="doc" size={18} /></div>
						<div style={{flex: 1}}>
							<div style={{fontSize: 14, fontWeight: 600}}>{t}</div>
							<div style={{fontSize: 12, color: C.grey60, marginTop: 2}}>{s}</div>
						</div>
						{n ? <div style={{width: 22, height: 22, borderRadius: 99, background: C.blue, color: '#FFFFFF', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center'}}>{n}</div> : null}
					</div>
				))}
			</div>
			<TabBar active="Accueil" />
		</div>
	);
};

const TASKS: {title: string; link: string; icon: IconName}[] = [
	{title: 'Faire parvenir mes documents', link: 'Remplir le formulaire', icon: 'doc'},
	{title: 'Signez votre contrat de travail', link: 'Signer le document', icon: 'pen'},
	{title: 'Signez la charte sécurité', link: 'Signer le document', icon: 'pen'},
	{title: 'Visitez notre blog', link: 'Accéder à la ressource', icon: 'link'},
];

/** done[i] ∈ [0,1] : progression de la coche de la tâche i. */
export const OnboardingScreen: React.FC<{done: number[]; progress: number}> = ({done, progress}) => {
	const todo = TASKS.length - done.filter((d) => d > 0.5).length;
	return (
		<div style={screen}>
			<TopBar />
			<div style={{position: 'absolute', top: 104, left: 20, right: 20}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 4, color: C.blue, fontSize: 13, fontWeight: 600}}><Icon name="back" size={18} />Mes onboarding</div>
				<div style={{fontSize: 26, fontWeight: 700, letterSpacing: -0.8, marginTop: 8}}>Bienvenue</div>
				<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 16}}>
					<span style={{color: C.grey60, fontWeight: 500}}>Progression</span>
					<span style={{color: C.blue, fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>{Math.round(progress * 100)} %</span>
				</div>
				<div style={{marginTop: 8}}><Progress value={progress} /></div>
				<div style={{display: 'flex', background: C.grey05, borderRadius: 12, padding: 4, marginTop: 18, fontSize: 13, fontWeight: 600}}>
					<div style={{flex: 1, textAlign: 'center', padding: '8px 0', background: '#FFFFFF', borderRadius: 9, color: C.blue}}>À faire {todo}</div>
					<div style={{flex: 1, textAlign: 'center', padding: '8px 0', color: C.grey60}}>À venir 13</div>
					<div style={{flex: 1, textAlign: 'center', padding: '8px 0', color: C.grey60}}>Terminé {1 + TASKS.length - todo}</div>
				</div>
				<div style={{fontSize: 10.5, fontWeight: 700, color: C.grey60, letterSpacing: 0.6, marginTop: 20}}>ÉTAPE 01 : LES ESSENTIELS AVANT VOTRE ARRIVÉE</div>
				{TASKS.map(({title, link, icon}, i) => {
					const d = done[i] ?? 0;
					return (
						<div key={title} style={{...card, marginTop: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12}}>
							<div style={{position: 'relative', width: 34, height: 34}}>
								<div style={{position: 'absolute', inset: 0, borderRadius: 9, background: C.blue05, color: C.blue, display: 'grid', placeItems: 'center', opacity: 1 - d}}><Icon name={icon} size={18} /></div>
								<div style={{position: 'absolute', inset: 0, borderRadius: 9, background: C.blue, color: '#FFFFFF', display: 'grid', placeItems: 'center', opacity: d, transform: `scale(${0.6 + 0.4 * d})`}}><Icon name="check" size={20} /></div>
							</div>
							<div style={{flex: 1}}>
								<div style={{fontSize: 14, fontWeight: 600, color: d > 0.5 ? C.grey60 : C.black}}>{title}</div>
								<div style={{fontSize: 12.5, color: C.blue, fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, opacity: 1 - d * 0.6}}>
									{d > 0.5 ? 'Terminé' : link} {d > 0.5 ? null : <Icon name="arrow" size={14} />}
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<TabBar active="Outils" />
		</div>
	);
};

const ANSWER = 'Les salaires sont généralement versés le 28 de chaque mois, en accord avec votre contrat de travail.';

/** ask 0→1 : la question apparaît ; typing 0→1 : la réponse s'écrit ; chip 0→1 : lien vers la page Paie. */
export const CopilotScreen: React.FC<{ask: number; thinking: number; typing: number; chip: number}> = ({ask, thinking, typing, chip}) => {
	const shown = ANSWER.slice(0, Math.round(ANSWER.length * typing));
	return (
		<div style={screen}>
			<div style={{position: 'absolute', top: 58, left: 22, color: C.blue}}><Icon name="spark" size={34} /></div>
			<div style={{position: 'absolute', top: 104, left: 22, right: 22}}>
				<div style={{fontSize: 26, fontWeight: 700, letterSpacing: -0.8, textAlign: 'center'}}>Votre copilote RH</div>
				<div style={{fontSize: 14, color: C.grey60, marginTop: 10, lineHeight: 1.45, textAlign: 'center'}}>Je cherche pour vous dans le livret d'accueil de votre entreprise. Une question ? Tapez-la juste ici.</div>
				<div style={{fontSize: 12, color: C.grey60, marginTop: 22, opacity: 1 - ask}}>Suggestions</div>
				{['Où sont les bureaux ?', 'Qui est mon référent RH ?', 'Quand est versé mon salaire ?'].map((s, i) => (
					<div key={s} style={{fontSize: 14.5, marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', opacity: i === 2 ? 1 - ask : (1 - ask) * 0.9}}>
						<span style={{color: C.blue}}>•</span>{s}
					</div>
				))}
				<div style={{position: 'absolute', top: 170, right: 0, opacity: ask, transform: `translateY(${(1 - ask) * 40}px)`, background: C.blue05, color: C.black, borderRadius: 16, padding: '10px 14px', fontSize: 14.5, fontWeight: 500}}>
					Quand est versé mon salaire ?
				</div>
				<div style={{position: 'absolute', top: 236, left: 0, right: 0}}>
					<div style={{display: 'flex', gap: 5, opacity: thinking * (1 - Math.min(1, typing * 8))}}>
						{[0, 1, 2].map((i) => <span key={i} style={{width: 7, height: 7, borderRadius: 9, background: C.blue, opacity: 0.35 + 0.65 * Math.abs(Math.sin(thinking * 9 + i))}} />)}
					</div>
					<div style={{fontSize: 16, lineHeight: 1.5, marginTop: -6}}>{shown}</div>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, background: C.blue05, color: C.blue, fontSize: 12.5, fontWeight: 600, borderRadius: 99, padding: '5px 12px', opacity: chip, transform: `scale(${0.9 + 0.1 * chip})`}}>
						se rendre à la page : Paie <Icon name="arrow" size={13} />
					</div>
				</div>
			</div>
			<TabBar active="Livret" />
		</div>
	);
};

const TOOLS: {title: string; icon: IconName; badge?: number}[] = [
	{title: 'Onboarding', icon: 'onboarding', badge: 4},
	{title: 'Coffre-fort', icon: 'lock'},
	{title: 'Entretien individuel', icon: 'interview'},
	{title: 'Formulaire', icon: 'form'},
	{title: 'Annuaire', icon: 'contacts'},
];

/** Outils (FO_40). `pressed` : index de la tuile pressée (-1 : aucune), `press` 0→1 : enfoncement. */
export const ToolsScreen: React.FC<{pressed?: number; press?: number}> = ({pressed = -1, press = 0}) => (
	<div style={screen}>
		<TopBar />
		<div style={{position: 'absolute', top: 104, left: 20, right: 20}}>
			<div style={{fontSize: 32, fontWeight: 700, letterSpacing: -1.1}}>Outils.</div>
			<div style={{fontSize: 14, color: C.grey60, marginTop: 6}}>Vos services et démarches en un seul endroit.</div>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22}}>
				{TOOLS.map(({title, icon, badge}, i) => (
					<div key={title} style={{...card, padding: 16, minHeight: 128, position: 'relative', transform: `scale(${i === pressed ? 1 - press * 0.05 : 1})`, background: i === pressed ? `rgba(51,116,255,${press * 0.06})` : '#FFFFFF'}}>
						<div style={{width: 40, height: 40, borderRadius: 10, background: C.blue05, color: C.blue, display: 'grid', placeItems: 'center'}}><Icon name={icon} size={20} /></div>
						{badge ? <div style={{position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: 99, background: C.blue, color: '#FFFFFF', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center'}}>{badge}</div> : null}
						<div style={{fontSize: 15, fontWeight: 700, marginTop: 14, lineHeight: 1.2}}>{title}</div>
						<div style={{fontSize: 12, color: C.grey60, marginTop: 4}}>Disponible</div>
					</div>
				))}
			</div>
		</div>
		<TabBar active="Outils" />
	</div>
);
