// Bundles src/ into a single, readable (non-minified) plugin file: dist/mo_help.js
// Usage: node build.mjs [--watch]
import { build, context } from 'esbuild';
import { readFileSync, copyFileSync, mkdirSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const options = {
	entryPoints: ['src/index.js'],
	outfile: 'dist/mo_help.js',
	bundle: true,
	format: 'iife',
	platform: 'browser',
	target: 'es2019',
	minify: false,      // blockbench-plugins requires human-readable bundles
	legalComments: 'none',
	banner: { js: `/// Mo'Help v${pkg.version} – built from src/ (see repository). Do not edit by hand.` },
};

mkdirSync('dist', { recursive: true });
for (const file of ['icon.png', 'about.md', 'members.yml', 'LICENSE.MD']) {
	try { copyFileSync(file, `dist/${file}`); } catch (err) { /* optional */ }
}

if (process.argv.includes('--watch')) {
	const ctx = await context(options);
	await ctx.watch();
	console.log('Watching…');
} else {
	await build(options);
	console.log('Built dist/mo_help.js');
}
