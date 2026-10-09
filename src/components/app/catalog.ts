// Catalogue des écrans redessinés : chaque composant d'écran est relié à sa capture réelle et à ses états animables.
// Règle du studio : un écran montré dans un film doit figurer ici (et sa capture dans references/applipro-ui/).
// La composition « Ecrans » (dossier Studio) affiche chaque écran dans chacun de ses états : c'est la planche que
// l'agent regarde avant de choisir un écran, et la base des tests visuels (npm run visual).
// Ajouter un écran : le dessiner dans Screens.tsx d'après la capture, l'ajouter ici avec 2 à 4 états parlants.
import type React from 'react';
import {CopilotScreen, HomeScreen, OnboardingScreen, ToolsScreen} from './Screens';

export type ScreenEntry = {id: string; capture: string; label: string; component: React.FC<any>; states: {label: string; props: Record<string, unknown>}[]};

export const SCREENS: ScreenEntry[] = [
	{id: 'accueil', capture: 'FO_01_accueil.jpg', label: 'Accueil salarié', component: HomeScreen, states: [
		{label: 'apparition', props: {name: 'Camille', reveal: 0.35}},
		{label: 'prêt', props: {name: 'Camille', reveal: 1}},
		{label: 'bouton pressé', props: {name: 'Camille', reveal: 1, pressed: 1}},
	]},
	{id: 'onboarding', capture: 'FO_51_onboarding_parcours.jpg', label: 'Parcours d’onboarding', component: OnboardingScreen, states: [
		{label: 'à faire', props: {done: [0, 0, 0, 0], progress: 0.06}},
		{label: 'en cours', props: {done: [1, 1, 0, 0], progress: 0.52}},
		{label: 'terminé', props: {done: [1, 1, 1, 1], progress: 1}},
	]},
	{id: 'copilote', capture: 'FO_03_copilote_ia.jpg', label: 'Copilote RH', component: CopilotScreen, states: [
		{label: 'suggestions', props: {ask: 0, thinking: 0, typing: 0, chip: 0}},
		{label: 'réflexion', props: {ask: 1, thinking: 0.5, typing: 0, chip: 0}},
		{label: 'réponse', props: {ask: 1, thinking: 1, typing: 1, chip: 1}},
	]},
	{id: 'outils', capture: 'FO_40_outils.jpg', label: 'Outils', component: ToolsScreen, states: [
		{label: 'repos', props: {}},
		{label: 'coffre-fort pressé', props: {pressed: 1, press: 1}},
	]},
];
