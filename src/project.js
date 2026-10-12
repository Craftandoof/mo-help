// Collects things from the open Blockbench project that suggestions can refer
// to. Everything is wrapped in try/catch: Blockbench's internals differ between
// formats and versions, and the assistant must never break the editor.
const VAR_RE = /\b(?:variable|v)\.([A-Za-z_]\w*)/gi;
let cache = null, cacheTime = 0;

function addMatches(str, counts) {
	if (typeof str !== 'string' || !str) return;
	for (const m of str.matchAll(VAR_RE)) {
		const name = m[1];
		counts.set(name, (counts.get(name) || 0) + 1);
	}
}
function unique(list) { return [...new Set(list.filter(Boolean))]; }

function safe(fn, fallback) { try { const r = fn(); return r === undefined ? fallback : r; } catch (err) { return fallback; } }

export function collectProject(force = false) {
	const now = Date.now();
	if (!force && cache && now - cacheTime < 1000) return cache;

	const counts = new Map();
	const declared = [];

	// 1) Variable Placeholders text: declarations come first.
	const text = safe(() => Interface.Panels.variable_placeholders.inside_vue.text, '');
	for (const m of String(text).matchAll(/^\s*(?:variable|v)\.([A-Za-z_]\w*)\s*=/gim)) declared.push(m[1]);
	addMatches(text, counts);

	// 2) Variables used anywhere in animations and controllers.
	const particles = [], sounds = [];
	safe(() => Animation.all.forEach(anim => {
		['anim_time_update', 'blend_weight', 'start_delay', 'loop_delay'].forEach(k => addMatches(anim[k], counts));
		Object.values(anim.animators || {}).forEach(animator => {
			Object.keys(animator.channels || {}).forEach(channel => {
				const list = animator[channel];
				(Array.isArray(list) ? list : (list && list.keyframes) || []).forEach(kf => {
					(kf.data_points || []).forEach(dp => {
						for (const key of Object.keys(dp)) if (typeof dp[key] === 'string') addMatches(dp[key], counts);
						if (dp.effect) (channel === 'sound' ? sounds : particles).push(dp.effect);
					});
				});
			});
		});
	}));
	safe(() => AnimationController.all.forEach(controller => controller.states.forEach(state => {
		addMatches(state.on_entry, counts); addMatches(state.on_exit, counts);
		state.animations.forEach(a => addMatches(a.blend_value, counts));
		state.transitions.forEach(t => addMatches(t.condition, counts));
		state.particles.forEach(p => { addMatches(p.pre_effect_script, counts); if (p.effect) particles.push(p.effect); });
		state.sounds.forEach(s => { if (s.effect) sounds.push(s.effect); });
	})));

	const used = [...counts.keys()].filter(n => !declared.includes(n)).sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
	const variables = unique(declared.concat(used));

	cache = {
		variables,
		animations: unique(safe(() => Animation.all.map(a => a.name), [])),
		bones: unique(safe(() => Group.all.map(g => g.name), [])),
		locators: unique(safe(() => Locator.all.map(l => l.name), [])),
		states: unique(safe(() => (AnimationController.selected ? AnimationController.selected.states.map(s => s.name) : []), [])),
		particles: unique(particles),
		sounds: unique(sounds),
	};
	cacheTime = now;
	return cache;
}
