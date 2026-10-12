import { t } from './i18n.js';

// Category metadata (label + icon). To add a category create data/<name>.js,
// register it in data/index.js and add an entry here.
export const CATEGORIES = {
	variables: { label: 'Variables', icon: 'data_object' },
	queries:   { label: 'Queries', icon: 'travel_explore' },
	math:      { label: 'Math', icon: 'calculate' },
	easing:    { label: 'Easing', icon: 'show_chart' },
	operators: { label: 'Operators', icon: 'code' },
	booleans:  { label: 'Booleans', icon: 'toggle_on' },
	snippets:  { label: 'Snippets', icon: 'bolt' },
};

// Context -> categories shown by default (the "matrix" of the proposal).
export const CONTEXTS = {
	help:                 { categories: Object.keys(CATEGORIES) },
	placeholders:         { categories: ['booleans', 'math', 'operators', 'variables'] },
	animation_controller: { categories: ['booleans', 'operators', 'math', 'queries', 'snippets'] },
	keyframe:             { categories: ['math', 'operators', 'easing', 'snippets'] },
	molang_editor:        { categories: ['variables', 'queries', 'math', 'operators', 'snippets'] },
};

export const CONTEXT_IDS = Object.keys(CONTEXTS);
export function contextLabel(id) { return t('ctx_' + id); }

// CSS selectors (relative to a focused element) that identify each context.
// Blockbench panels use the id `panel_<panel_id>`; dialogs use `dialog#<id>`.
const SELECTOR_MAP = [
	['#expression_editor', 'molang_editor'],
	['#panel_variable_placeholders', 'placeholders'],
	['#panel_animation_controllers', 'animation_controller'],
	['#panel_keyframe', 'keyframe'],
	['#panel_timeline', 'keyframe'],
];

const PANEL_MAP = {
	variable_placeholders: 'placeholders',
	animation_controllers: 'animation_controller',
	keyframe: 'keyframe',
	timeline: 'keyframe',
};

export const OWN_PANEL_SELECTOR = '#panel_mo_help';

/**
 * Detects the context the user is currently working in.
 * Priority: open Molang editor dialog > focused element > active panel >
 * selection state > help.
 * Returns `null` when the focus sits inside Mo'Help itself, meaning "keep the
 * current context".
 */
export function detectContext() {
	const el = document.activeElement;
	if (el && el.closest && el.closest(OWN_PANEL_SELECTOR)) return null;

	// The Molang editor is a modal dialog: while it is open it wins, even if
	// keyboard focus has not moved into it yet.
	const editor = document.getElementById('expression_editor');
	if (editor && editor.getClientRects().length) return 'molang_editor';

	if (el && el.closest) {
		for (const [selector, ctx] of SELECTOR_MAP) {
			if (el.closest(selector)) return ctx;
		}
	}

	try {
		const active = typeof Prop !== 'undefined' ? Prop.active_panel : null;
		if (active && PANEL_MAP[active]) return PANEL_MAP[active];
	} catch (err) { /* ignore */ }

	try {
		const animating = typeof Format !== 'undefined' && Format && Format.animation_mode;
		if (animating) {
			if (typeof AnimationController !== 'undefined' && AnimationController.selected && AnimationController.selected.selected_state) return 'animation_controller';
			if (typeof Timeline !== 'undefined' && Timeline.selected && Timeline.selected.length) return 'keyframe';
		}
	} catch (err) { /* ignore */ }

	return 'help';
}
