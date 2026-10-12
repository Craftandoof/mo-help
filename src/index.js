import { CSS } from './style.js';
import { createComponent } from './panel.js';
import { detectContext, OWN_PANEL_SELECTOR } from './contexts.js';
import { rememberTarget, forgetTarget } from './insert.js';
import { t } from './i18n.js';

(function () {
	let panel, action, style, listeners = [], poll = null;
	const PLUGIN_ID = 'mo_help';

	function addDocListener(type, fn, options) {
		document.addEventListener(type, fn, options);
		listeners.push(() => document.removeEventListener(type, fn, options));
	}
	function addBBListener(event, fn) {
		const handle = Blockbench.on(event, fn);
		listeners.push(() => { if (handle && handle.delete) handle.delete(); else Blockbench.removeListener(event, fn); });
	}

	function vue() { return panel && panel.inside_vue; }
	function isHidden() { return !panel || panel.slot === 'hidden'; }

	// ---- Context detection -------------------------------------------------
	function refreshContext() {
		const v = vue();
		if (!v || isHidden()) return;
		const ctx = detectContext();
		if (ctx && ctx !== v.detected) v.detected = ctx;
		applyStacking();
	}
	const refreshSoon = () => setTimeout(refreshContext, 0);

	// ---- Stacking: pinned panels (and the Molang editor dialog context) stay
	// above Blockbench dialogs so the panel remains clickable. -----------------
	function applyStacking() {
		const v = vue();
		if (!panel || !v) return;
		const blackout = document.getElementById('blackout');
		const dialogOpen = !!blackout && getComputedStyle(blackout).display !== 'none';
		const floating = panel.slot === 'float';
		panel.container.classList.toggle('mo_help_pinned', floating && !!v.prefs.pinned);
		panel.container.classList.toggle('mo_help_raised', floating && dialogOpen && (!!v.prefs.pinned || v.context === 'molang_editor'));
	}

	{
		BBPlugin.register(PLUGIN_ID, {
			title: 'Mo\'Help',
			icon: 'icon.png',
			author: 'Craftandoof',
			description: 'Contextual Molang assistant: shows only the variables, queries, math and snippets relevant to the panel you are working in, and inserts them with one click.',
			tags: ['Animation', 'Molang', 'Utility'],
			version: '0.5.0',
			min_version: '4.9.0',
			variant: 'both',
			onload() {
				style = Blockbench.addCSS(CSS);

				// Default spot: floating over the 3D viewport, left of the right sidebar,
				// so it does not cover the animation / keyframe panels on the left.
				const width = 360;
				const height = Math.max(300, Math.min(520, window.innerHeight - 220));
				const left = Math.max(380, window.innerWidth - 320 - width - 24);

				panel = new Panel(PLUGIN_ID, {
					name: t('panel_name'),
					icon: 'live_help',
					growable: true,
					resizable: true,
					expand_button: false,
					default_position: {
						slot: Blockbench.isMobile ? 'right_bar' : 'float',
						float_position: [left, 100],
						float_size: [width, height],
						height,
						folded: false,
						sidebar_index: 20,
					},
					component: createComponent(),
				});

				action = new Action('mo_help_toggle', {
					name: t('toggle_action'),
					description: t('toggle_desc'),
					icon: 'live_help',
					category: 'view',
					keybind: new Keybind({ key: 'h', ctrl: true, shift: true }),
					click() {
						if (isHidden()) {
							panel.moveTo(Blockbench.isMobile ? 'right_bar' : 'float');
							refreshContext();
						} else {
							panel.moveTo('hidden');
						}
					},
				});
				MenuBar.addAction(action, 'help');

				// Remember which text field the user was editing, and re-detect
				// the context whenever focus or the active panel changes.
				addDocListener('focusin', e => { rememberTarget(e); refreshSoon(); }, true);
				addDocListener('mousedown', refreshSoon, true);
				addDocListener('keydown', e => {
					if (e.key !== 'Escape' || isHidden()) return;
					const el = document.activeElement;
					if (el && el.closest && el.closest(OWN_PANEL_SELECTOR) && !(el.tagName === 'INPUT' && el.value)) {
						panel.moveTo('hidden');
						e.stopPropagation();
					}
				}, true);
				['select_animation', 'select_animation_controller_state', 'update_keyframe_selection', 'select_mode', 'select_project', 'unselect_all']
					.forEach(name => addBBListener(name, refreshSoon));

				// Dialogs (e.g. the Molang editor) open without focus events we can rely on.
				poll = setInterval(refreshContext, 500);

				// Re-apply the pinned stacking when the user's own preference changes.
				vue().$watch(() => vue().prefs.pinned, applyStacking);
				refreshContext();
			},
			onunload() {
				listeners.forEach(remove => remove());
				listeners = [];
				if (poll) clearInterval(poll);
				forgetTarget();
				if (action) action.delete();
				if (panel) {
					panel.container.classList.remove('mo_help_pinned', 'mo_help_raised');
					panel.delete();
				}
				if (style) style.delete();
				panel = action = style = poll = null;
			},
		});
	}
})();
