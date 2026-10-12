import { OWN_PANEL_SELECTOR } from './contexts.js';

const TEXT_INPUT_TYPES = ['text', 'search', 'url', 'tel', '', null];

function isEditable(el) {
	if (!el || el.nodeType !== 1) return false;
	if (el.closest && el.closest(OWN_PANEL_SELECTOR)) return false;
	if (el.tagName === 'TEXTAREA') return !el.readOnly && !el.disabled;
	if (el.tagName === 'INPUT') return TEXT_INPUT_TYPES.includes(el.getAttribute('type')) && !el.readOnly && !el.disabled;
	return el.isContentEditable === true;
}

let lastTarget = null;

export function rememberTarget(event) {
	if (isEditable(event.target)) lastTarget = event.target;
}

export function forgetTarget() { lastTarget = null; }

function openMolangDialog() {
	const dialog = document.getElementById('expression_editor');
	return dialog && dialog.getClientRects().length ? dialog : null;
}

function resolveTarget() {
	// A modal Molang editor owns the keyboard: always write into its editor.
	const dialog = openMolangDialog();
	if (dialog) {
		const active = document.activeElement;
		if (active && dialog.contains(active) && isEditable(active)) return active;
		const editor = dialog.querySelector('[contenteditable="true"], textarea');
		if (editor) return editor;
	}
	const active = document.activeElement;
	if (isEditable(active)) return active;
	if (lastTarget && document.contains(lastTarget) && lastTarget.offsetParent !== null) return lastTarget;
	return null;
}

function placeCaretAtEnd(el) {
	try {
		if (el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
			const range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			const sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (el.setSelectionRange) {
			const end = el.value.length;
			el.setSelectionRange(end, end);
		}
	} catch (err) { /* ignore */ }
}

/**
 * Inserts text at the caret of the field the user was editing.
 * `execCommand('insertText')` keeps the browser's own text undo stack and fires
 * a native `input` event (plus a keyup for prism editors), so Blockbench's own
 * Undo.initEdit/finishEdit handling for keyframe / controller / placeholder
 * fields runs and the edit stays reversible. Falls back to setRangeText + input event.
 * Returns true when text was inserted, false when no field was available.
 */
export function insertText(text) {
	const el = resolveTarget();
	if (!el) return false;

	const single_line = el.tagName === 'INPUT';
	if (single_line) text = text.replace(/\s*\n\s*/g, ' ');

	if (document.activeElement !== el) {
		el.focus();
		// Focus was elsewhere (e.g. the Mo'Help search box): append at the end.
		if (!lastTarget || lastTarget !== el || el.closest('#expression_editor')) placeCaretAtEnd(el);
	}

	let done = false;
	try { done = document.execCommand('insertText', false, text); } catch (err) { done = false; }

	if (!done && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
		const start = el.selectionStart ?? el.value.length;
		const end = el.selectionEnd ?? el.value.length;
		el.setRangeText(text, start, end, 'end');
		el.dispatchEvent(new Event('input', { bubbles: true }));
		done = true;
	}
	// Blockbench's Molang fields are vue-prism-editor instances (a contenteditable
	// <pre>) that only sync their model on `keyup`, not on `input`. Nudge them
	// with a synthetic, non-navigational key so the value reaches Blockbench
	// (and its own Undo handling) exactly as if the user had typed it.
	if (done && el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
		el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Unidentified', keyCode: 229, which: 229 }));
	}
	return done;
}

export function copyText(text) {
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(text);
			return true;
		}
	} catch (err) { /* ignore */ }
	return false;
}

function selectOffsets(el, start, end) {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const range = document.createRange();
	let pos = 0, startSet = false, endSet = false, node, lastNode = null;
	while ((node = walker.nextNode())) {
		const len = node.nodeValue.length;
		lastNode = node;
		if (!startSet && start <= pos + len) { range.setStart(node, start - pos); startSet = true; }
		if (startSet && end <= pos + len) { range.setEnd(node, end - pos); endSet = true; break; }
		pos += len;
	}
	if (!startSet) { range.selectNodeContents(el); range.collapse(false); }
	else if (!endSet && lastNode) range.setEnd(lastNode, lastNode.nodeValue.length);
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

/**
 * Replaces the text between two offsets of a field (input, textarea or the
 * contenteditable <pre> of Blockbench's Molang editors) with `text`, going
 * through the browser's editing pipeline so Blockbench's own input handling and
 * Undo behaviour apply exactly as if the user had typed it.
 */
export function replaceRange(el, start, end, text) {
	const editable = el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA';
	if (document.activeElement !== el) el.focus();
	if (editable) selectOffsets(el, start, end);
	else el.setSelectionRange(start, end);

	let done = false;
	try { done = document.execCommand('insertText', false, text); } catch (err) { done = false; }
	if (!done && !editable) {
		el.setRangeText(text, start, end, 'end');
		el.dispatchEvent(new Event('input', { bubbles: true }));
		done = true;
	}
	if (done && editable) {
		el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Unidentified', keyCode: 229, which: 229 }));
	}
	return done;
}
