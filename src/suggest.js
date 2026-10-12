// Pure suggestion engine (no DOM, no Blockbench globals) so it can be unit-tested.
//
//   suggest({ text, caret, kind, project }) -> { token, items, title? }
//
// * namespace-aware: once the user types `q.` / `v.` / `math.` the list stays
//   inside that namespace;
// * field-aware: `kind` selects a profile (see profiles.js) that decides which
//   entries come first;
// * project-aware: `project` carries variables, animations, bones, ... found in
//   the open model (see project.js).
import { ALL_ITEMS } from './data/index.js';
import { PROFILES, DEFAULT_PROFILE, PLAIN_KINDS, BOOLEAN_QUERIES, COMPARISONS, COMMON_MATH } from './profiles.js';
import { scoreItem } from './search.js';

export const ALIASES = { q: 'query', query: 'query', v: 'variable', variable: 'variable', math: 'math' };
const NAMESPACES = [
	{ ns: 'query', short: 'q', desc: 'Entity and world state' },
	{ ns: 'variable', short: 'v', desc: 'Model and plugin variables' },
	{ ns: 'math', short: null, desc: 'Math functions and constants' },
];
const MAX_ITEMS = 60;

// ---- Catalog built from src/data -------------------------------------------
function buildCatalog() {
	const catalog = { query: [], variable: [], math: [] };
	const seen = new Set();
	for (const item of ALL_ITEMS) {
		const m = /^(query|math|variable)\.(\w+)/i.exec(item.label);
		if (!m) continue;
		const ns = m[1].toLowerCase();
		const name = `${ns}.${m[2].toLowerCase()}`;
		if (seen.has(name)) continue;
		seen.add(name);
		catalog[ns].push({
			ns, name, short: m[2].toLowerCase(), label: name,
			insert: ns === 'math' ? item.snippet : name,
			desc: item.description,
			bool: item.tags.includes('boolean'),
		});
	}
	return catalog;
}
export const CATALOG = buildCatalog();
const BY_NAME = new Map(Object.values(CATALOG).flat().map(e => [e.name, e]));

// ---- Token extraction ---------------------------------------------------------
export function extractToken(text, caret) {
	const before = text.slice(0, caret);
	// Inside a quoted string (e.g. slider('na|')) nothing should be suggested.
	const line = before.slice(before.lastIndexOf('\n') + 1);
	const quotes = (line.match(/'/g) || []).length;
	if (quotes % 2 === 1) return { raw: '', start: caret, end: caret, ns: null, rest: '', inString: true };

	const m = /[A-Za-z_]\w*(?:\.\w*)?$/.exec(before);
	if (!m) return { raw: '', start: caret, end: caret, ns: null, rest: '' };
	const raw = m[0];
	const dot = raw.indexOf('.');
	return {
		raw, start: caret - raw.length, end: caret,
		ns: dot >= 0 ? raw.slice(0, dot).toLowerCase() : null,
		rest: (dot >= 0 ? raw.slice(dot + 1) : raw).toLowerCase(),
		hasDot: dot >= 0,
	};
}

// ---- Entry builders --------------------------------------------------------------
function projectVarEntry(name, style, boosted) {
	const prefix = style === 'variable' ? 'variable.' : 'v.';
	return { label: prefix + name, insert: prefix + name, desc: 'Defined in this model', tag: 'project', boosted: !!boosted, name: name.toLowerCase() };
}
function catalogEntry(e) {
	return { label: e.name, insert: e.insert, desc: e.desc, tag: e.ns, name: e.short, bool: e.bool };
}
function namespaceEntries(filter) {
	const out = [];
	for (const n of NAMESPACES) {
		if (!filter || n.ns.startsWith(filter)) out.push({ label: n.ns, insert: n.ns + '.', desc: n.desc, tag: 'namespace', name: n.ns });
		if (n.short && filter && n.short.startsWith(filter)) out.push({ label: n.short + '.', insert: n.short + '.', desc: 'Short form of ' + n.ns, tag: 'namespace', name: n.short });
	}
	return out;
}

// Expands a profile's `root` recipe into a flat list for empty / fresh fields.
function expandRoot(profile, project, style) {
	const out = [];
	const push = e => { if (e && !out.some(o => o.label === e.label)) out.push(e); };
	const vars = project.variables || [];
	for (const step of profile.root) {
		if (step === '@namespaces') namespaceEntries().forEach(push);
		else if (step === '@vars') vars.forEach(v => push(projectVarEntry(v, style, profile.varBoost && profile.varBoost.test(v))));
		else if (step === '@boostvars') vars.filter(v => profile.varBoost && profile.varBoost.test(v)).forEach(v => push(projectVarEntry(v, style, true)));
		else if (step === '@bools') {
			BOOLEAN_QUERIES.forEach(n => push(BY_NAME.has(n) && catalogEntry(BY_NAME.get(n))));
			COMPARISONS.forEach(c => push({ label: c.text, insert: c.text, desc: c.desc, tag: 'condition', name: c.text }));
		}
		else if (step === '@math') COMMON_MATH.forEach(n => push(BY_NAME.has(n) && catalogEntry(BY_NAME.get(n))));
		else if (step === '@helpers') {
			for (const item of ALL_ITEMS) if (item.id.startsWith('placeholder.') && item.contexts) push({ label: item.snippet, insert: item.snippet, desc: item.description, tag: 'placeholder', name: item.snippet });
		}
		else if (BY_NAME.has(step)) push(catalogEntry(BY_NAME.get(step)));
	}
	return out;
}

// Orders a list: profile.priority names first (in the declared order), boosted
// project variables next, then the rest in original order.
function applyPriority(list, profile) {
	const prio = profile.priority || [];
	const score = e => {
		const i = prio.indexOf(e.label);
		if (i >= 0) return i;
		if (e.boosted) return prio.length;
		return prio.length + 1;
	};
	return list.map((e, i) => ({ e, i, s: score(e) })).sort((a, b) => a.s - b.s || a.i - b.i).map(x => x.e);
}

// Filters by the typed fragment: prefix matches first, then contains, then fuzzy.
function filterByFragment(entries, fragment) {
	if (!fragment) return entries;
	const pre = [], inc = [], fuzzy = [];
	for (const e of entries) {
		const n = e.name || e.label.toLowerCase();
		if (n.startsWith(fragment)) pre.push(e);
		else if (n.includes(fragment)) inc.push(e);
		else if (scoreItem(fragment, { label: n, id: n, tags: [], description: '' }) > 0 && fragment.length > 1) fuzzy.push(e);
	}
	return pre.concat(inc, fuzzy);
}

// ---- Plain (non-Molang) fields ------------------------------------------------------
function plainSuggestions(kind, text, project, filter) {
	const sources = PLAIN_KINDS[kind];
	// Until the user edits the value, show every candidate (the field may already hold a valid name).
	const value = filter ? text.trim().toLowerCase() : '';
	const items = [];
	for (const src of sources) {
		for (const name of (project[src.key] || [])) {
			if (!name) continue;
			const n = name.toLowerCase();
			if (value && !n.includes(value)) continue;
			items.push({ label: name, insert: name, desc: src.desc, tag: src.tag, name: n, starts: !value || n.startsWith(value) });
		}
	}
	items.sort((a, b) => (b.starts - a.starts));
	return items;
}

// ---- Main entry -------------------------------------------------------------------------
export function suggest({ text, caret, kind, project = {}, filterPlain = true }) {
	const profile = PROFILES[kind] || DEFAULT_PROFILE;

	if (PLAIN_KINDS[kind]) {
		const items = plainSuggestions(kind, text, project, filterPlain).slice(0, MAX_ITEMS);
		return { mode: 'plain', token: { raw: text, start: 0, end: text.length }, items, title: profile.title };
	}

	const token = extractToken(text, caret);
	if (token.inString) return { mode: 'molang', token, items: [], title: profile.title };
	const vars = project.variables || [];
	// One consistent style per list: the abbreviated form (v.) only while the user
	// has typed a single letter or the short namespace itself ("v."); a longer
	// fragment or an empty field always gets the full form (variable.).
	const style = token.raw && ((token.hasDot && token.ns === 'v') || (!token.hasDot && token.raw.length === 1)) ? 'v' : 'variable';
	let items;

	if (!token.raw) {
		items = expandRoot(profile, project, style);
	} else if (token.hasDot) {
		const ns = ALIASES[token.ns];
		if (!ns) {
			items = [];
		} else if (ns === 'variable') {
			const mine = vars.map(v => projectVarEntry(v, style, profile.varBoost && profile.varBoost.test(v)));
			const builtin = CATALOG.variable.map(catalogEntry).map(e => ({ ...e, label: (style === 'v' ? 'v.' : 'variable.') + e.name, insert: (style === 'v' ? 'v.' : 'variable.') + e.name }));
			const all = mine.concat(builtin.filter(b => !mine.some(m => m.name === b.name)));
			items = applyPriority(filterByFragment(all, token.rest), profile);
		} else {
			items = applyPriority(filterByFragment(CATALOG[ns].map(catalogEntry), token.rest), profile);
		}
	} else {
		const p = token.rest;
		const nsRoots = namespaceEntries(p);
		const myVars = filterByFragment(vars.map(v => projectVarEntry(v, style, profile.varBoost && profile.varBoost.test(v))), p)
			.filter(e => e.name.includes(p));
		if (nsRoots.length) {
			// The user is typing the start of a namespace: offer it plus matching model variables only.
			items = nsRoots.concat(myVars);
		} else {
			const cross = [];
			if (p.length >= 2) {
				for (const ns of ['query', 'math']) {
					for (const e of CATALOG[ns]) if (e.short.includes(p)) cross.push(catalogEntry(e));
				}
			}
			items = applyPriority(filterByFragment(myVars.concat(cross), p), profile);
		}
	}
	return { mode: 'molang', token, items: items.slice(0, MAX_ITEMS), title: profile.title };
}
