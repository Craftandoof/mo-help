// Per-viewer preferences. Everything is wrapped in try/catch because
// localStorage can throw (private windows, blocked storage, thumbnails…).
const KEY = 'mo_help:prefs';

const DEFAULTS = {
	pinned: false,
	learn: false,
	contextMode: 'auto',   // 'auto' or a context id
	collapsed: {},         // category id -> true
	catSets: {},           // context id -> category ids chosen by the user
	history: [],           // last used item ids, newest first
};

export function loadPrefs() {
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
	} catch (err) { /* ignore */ }
	return Object.assign({}, DEFAULTS);
}

export function savePrefs(prefs) {
	try {
		localStorage.setItem(KEY, JSON.stringify(prefs));
	} catch (err) { /* ignore */ }
}
