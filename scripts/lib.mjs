import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';
import {existsSync} from 'node:fs';
import path from 'node:path';

// Chrome headless : variable REMOTION_BROWSER, sinon binaire Playwright s'il existe, sinon téléchargement par Remotion.
const CANDIDATES = [process.env.REMOTION_BROWSER, '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'];
export const browserExecutable = CANDIDATES.find((p) => p && existsSync(p)) ?? null;

let served;
export const getBundle = async () => (served ??= await bundle({entryPoint: path.resolve('src/index.ts')}));

export const getComposition = async (id, inputProps = {}) => {
	const serveUrl = await getBundle();
	const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
	return {serveUrl, composition};
};

export const FORMATS = ['9x16', '1x1', '16x9'];
