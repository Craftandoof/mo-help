import { OWN_PANEL_SELECTOR } from './contexts.js';

const TEXT_TYPES = ['text', 'search', 'url', 'tel', '', null];

export function isPrismCode(el) {
	return !!el && el.tagName === 'PRE' && el.classList.contains('prism-editor__code');
}
export function isTextInput(el) {
	return !!el && el.tagName === 'INPUT' && TEXT_TYPES.includes(el.getAttribute('type')) && !el.readOnly && !el.disabled;
}

/**
 * Works out what a focused element is for. Returns `{ kind, label }` or null
 * when Mo'Help should stay out of the way. `kind` selects a profile in
 * profiles.js. Detection is structural (DOM position / classes), never based on
 * translated label text, so it works in every Blockbench language.
 */
export function describeField(el, inheritedKind) {
	if (!el || !el.closest) return null;
	if (el.closest(OWN_PANEL_SELECTOR) || el.closest('.mo_help_assist')) return null;
	const prism = isPrismCode(el);
	const input = isTextInput(el);
	if (!prism && !input) return null;

	// Animation properties dialog: the Molang fields are listed in a fixed order.
	const props = el.closest('#animation_properties_vue');
	if (props) {
		if (!prism) return null;
		const bars = [...props.querySelectorAll('.dialog_bar')];
		const index = bars.indexOf(el.closest('.dialog_bar'));
		const kind = ['anim_time_update', 'blend_weight', 'start_delay', 'loop_delay'][index] || 'molang';
		return { kind };
	}

	// Animation controller panel.
	if (el.closest('#panel_animation_controllers')) {
		const li = el.closest('li.controller_animation, li.controller_transition, li.controller_particle, li.controller_sound');
		if (li) {
			if (li.classList.contains('controller_animation')) return { kind: prism ? 'ctrl_animation_condition' : 'ctrl_animation_name' };
			if (li.classList.contains('controller_transition')) return prism ? { kind: 'ctrl_transition' } : null;
			if (li.classList.contains('controller_sound')) return input ? { kind: 'ctrl_sound_effect' } : null;
			if (li.classList.contains('controller_particle')) {
				if (prism) return { kind: 'ctrl_script' };
				const bars = [...li.querySelectorAll('.bar')];
				const index = bars.indexOf(el.closest('.bar'));
				return { kind: index === 1 ? 'ctrl_locator' : 'ctrl_particle_effect' };
			}
		}
		// On Entry / On Exit editors sit directly in the state.
		return prism ? { kind: 'ctrl_script' } : null;
	}

	// Keyframe panel.
	if (el.closest('#panel_keyframe')) {
		const bar = el.closest('[id^="keyframe_bar_"]');
		const id = bar ? bar.id.replace('keyframe_bar_', '') : '';
		if (id === 'effect' && input) {
			let channel = '';
			try { channel = Keyframe.selected[0].channel; } catch (err) { /* ignore */ }
			return { kind: channel === 'sound' ? 'kf_effect_sound' : 'kf_effect_particle' };
		}
		if (id === 'locator' && input) return { kind: 'kf_locator' };
		if (id === 'script' && prism) return { kind: 'ctrl_script' };
		return prism ? { kind: 'keyframe' } : null;
	}

	if (el.closest('#panel_variable_placeholders')) return prism ? { kind: 'placeholders' } : null;

	// The expression editor dialog inherits the kind of the field it was opened from.
	if (el.closest('#expression_editor')) return prism ? { kind: inheritedKind || 'molang' } : null;

	// Rename prompt of a controller state.
	if (input && el.closest('dialog#text_input')) {
		try {
			if (AnimationController.selected && AnimationController.selected.states.some(s => s.name === el.value)) return { kind: 'ctrl_state_name' };
		} catch (err) { /* ignore */ }
		return null;
	}

	return prism ? { kind: 'molang' } : null;
}
