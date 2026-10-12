import { describeField, isPrismCode } from './fields.js';
import { suggest } from './suggest.js';
import { PROFILES } from './profiles.js';
import { collectProject } from './project.js';
import { replaceRange } from './insert.js';
import { getState } from './state.js';
import { t } from './i18n.js';

/**
 * The anchored assistant: a helper row attached to the field being edited.
 * It is not a window — it cannot be dragged, it sits directly above the field
 * (below only when there is no room above), follows the field while it
 * scrolls/grows, and disappears when the field loses focus unless pinned.
 */
export function createAssistant() {
	const prefs = getState();
	let root, titleEl, crumbEl, listEl, pinBtn;
	let active = null;          // { el, kind }
	let result = null;
	let index = -1;
	let dismissed = false;
	let suppressUntilInput = false;
	let accepting = false;
	let lastMolangKind = null;
	let raf = 0, lastRect = '';
	const cleanups = [];
	const patched = [];

	// A modal dialog opened on top of the field (e.g. the Molang editor opened from
	// it): the field is no longer being edited, so its helper row must go away.
	function coveredByDialog(el) {
		const open = [...document.querySelectorAll('dialog')].filter(d => d.getClientRects().length);
		if (!open.length) return false;
		const z = d => parseInt(getComputedStyle(d).zIndex, 10) || 0;
		const top = open.reduce((a, b) => (z(b) >= z(a) ? b : a));
		return !top.contains(el);
	}
	const enabled = () => prefs.smartAssistant && prefs.smartOverlay;
	const visible = () => !!root && root.style.display !== 'none';

	// ---- DOM -----------------------------------------------------------------
	function build() {
		root = document.createElement('div');
		root.className = 'mo_help_assist';
		root.style.display = 'none';
		root.setAttribute('role', 'listbox');
		root.innerHTML = `
			<div class="mo_help_assist_head">
				<span class="mo_help_assist_title"></span>
				<span class="mo_help_assist_crumb"></span>
				<i class="material-icons mo_help_assist_btn mo_help_assist_pin" title="${t('pin')}">push_pin</i>
				<i class="material-icons mo_help_assist_btn mo_help_assist_close" title="${t('close')}">close</i>
			</div>
			<ul class="mo_help_assist_list"></ul>`;
		document.body.append(root);
		titleEl = root.querySelector('.mo_help_assist_title');
		crumbEl = root.querySelector('.mo_help_assist_crumb');
		listEl = root.querySelector('.mo_help_assist_list');
		pinBtn = root.querySelector('.mo_help_assist_pin');
		// Never steal focus from the field.
		root.addEventListener('mousedown', e => e.preventDefault());
		pinBtn.addEventListener('click', () => { prefs.assistPinned = !prefs.assistPinned; renderHead(); });
		root.querySelector('.mo_help_assist_close').addEventListener('click', () => dismiss());
		listEl.addEventListener('click', e => {
			const li = e.target.closest('li[data-i]');
			if (li) accept(Number(li.dataset.i));
		});
		listEl.addEventListener('mousemove', e => {
			const li = e.target.closest('li[data-i]');
			if (li && Number(li.dataset.i) !== index) { index = Number(li.dataset.i); markSelected(false); }
		});
	}

	function renderHead() {
		titleEl.textContent = result && result.title ? result.title : 'Mo\'Help';
		crumbEl.textContent = result && result.token && result.token.raw ? result.token.raw : '';
		pinBtn.classList.toggle('on', !!prefs.assistPinned);
	}

	function render() {
		renderHead();
		const raw = (result.token.raw || '').toLowerCase();
		listEl.replaceChildren();
		result.items.forEach((item, i) => {
			const li = document.createElement('li');
			li.dataset.i = i;
			li.setAttribute('role', 'option');
			const code = document.createElement('code');
			const label = item.label;
			if (raw && label.toLowerCase().startsWith(raw)) {
				const b = document.createElement('b');
				b.textContent = label.slice(0, raw.length);
				code.append(b, label.slice(raw.length));
			} else code.textContent = label;
			const tag = document.createElement('span');
			tag.className = 'tag tag_' + item.tag;
			tag.textContent = item.tag;
			const desc = document.createElement('div');
			desc.className = 'desc';
			desc.textContent = item.desc || '';
			li.append(code, tag, desc);
			listEl.append(li);
		});
		markSelected(true);
	}

	function markSelected(scroll) {
		[...listEl.children].forEach((li, i) => li.classList.toggle('selected', i === index));
		if (scroll && index >= 0 && listEl.children[index]) listEl.children[index].scrollIntoView({ block: 'nearest' });
	}

	// ---- Reading / writing the field ------------------------------------------
	function readField(el) {
		if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return { text: el.value, caret: el.selectionStart ?? el.value.length };
		const text = el.textContent;
		let caret = text.length;
		const sel = window.getSelection();
		if (sel.rangeCount && el.contains(sel.anchorNode)) {
			const r = document.createRange();
			r.selectNodeContents(el);
			r.setEnd(sel.anchorNode, sel.anchorOffset);
			caret = r.toString().length;
		}
		return { text, caret };
	}

	function accept(i) {
		if (!active || !result || !result.items[i]) return;
		const item = result.items[i];
		const info = readField(active.el);
		let start, end;
		if (result.mode === 'plain') { start = 0; end = info.text.length; }
		else { start = info.caret - result.token.raw.length; end = info.caret; }
		accepting = true;
		try { replaceRange(active.el, start, end, item.insert); } finally { accepting = false; }
		if (item.insert.endsWith('.')) {
			// Namespace chosen: immediately show what lives inside it.
			setTimeout(() => update(), 0);
		} else {
			suppressUntilInput = true;
			hide();
		}
	}

	// ---- State -----------------------------------------------------------------
	function update() {
		if (!active || !enabled() || dismissed || suppressUntilInput) return hide();
		if (!document.contains(active.el) || coveredByDialog(active.el)) return hide();
		const info = readField(active.el);
		const res = suggest({ text: info.text, caret: info.caret, kind: active.kind, project: collectProject(), filterPlain: !!active.edited });
		// Nothing to add when the identifier is already complete.
		res.items = res.items.filter(item => item.insert !== res.token.raw);
		if (!res.items.length) { result = res; return hide(); }
		result = res;
		index = res.token.raw && res.token.raw.trim() ? 0 : -1;
		render();
		root.style.display = '';
		lastRect = '';
		position();
		startFollowing();
	}

	function hide() {
		if (!root) return;
		root.style.display = 'none';
		cancelAnimationFrame(raf);
		raf = 0;
	}

	function dismiss() {
		dismissed = true;
		hide();
	}

	// ---- Positioning: attached to the field ---------------------------------------
	function anchorOf(el) { return el.closest('.prism-editor-component') || el; }

	// Short fields: attach to the whole field. Tall multi-line editors (e.g. the
	// Molang editor dialog): attach to the line being edited, so the helper row
	// never covers the text the user is typing.
	function anchorRect() {
		const r = anchorOf(active.el).getBoundingClientRect();
		if (r.height <= 110 || !active.el.isContentEditable) return r;
		const sel = window.getSelection();
		if (sel.rangeCount && active.el.contains(sel.anchorNode)) {
			const range = sel.getRangeAt(0).cloneRange();
			range.collapse(true);
			const cr = range.getClientRects()[0] || range.getBoundingClientRect();
			if (cr && (cr.width || cr.height)) return { left: r.left, right: r.right, width: r.width, top: cr.top, bottom: cr.bottom, height: cr.height };
		}
		return { left: r.left, right: r.right, width: r.width, top: r.top, bottom: r.top + 22, height: 22 };
	}

	function position() {
		if (!active || !visible()) return;
		const r = anchorRect();
		if (!r.width && !r.height) return hide();
		const key = [r.left, r.top, r.width, r.height, innerWidth, innerHeight, listEl.children.length].join();
		if (key === lastRect) return;
		lastRect = key;

		const vw = window.innerWidth, vh = window.innerHeight, gap = 3, margin = 6;
		const width = Math.min(Math.max(r.width, 280), Math.min(520, vw - margin * 2));
		const left = Math.min(Math.max(margin, r.left), vw - width - margin);
		root.style.width = width + 'px';
		root.style.left = left + 'px';

		const headH = root.querySelector('.mo_help_assist_head').offsetHeight || 26;
		listEl.style.maxHeight = '260px';
		const natural = headH + listEl.scrollHeight;
		const wanted = Math.min(natural, headH + 260);
		const spaceAbove = r.top - gap - margin;
		const spaceBelow = vh - r.bottom - gap - margin;
		// Default: above the field. Below only when there is genuinely no room above.
		const above = spaceAbove >= Math.min(wanted, 120) || spaceAbove >= spaceBelow;
		const space = Math.max(above ? spaceAbove : spaceBelow, headH + 48);
		const height = Math.min(wanted, space);
		listEl.style.maxHeight = Math.max(48, height - headH) + 'px';
		root.classList.toggle('below', !above);
		root.style.top = (above ? r.top - gap - height : r.bottom + gap) + 'px';
	}

	function startFollowing() {
		cancelAnimationFrame(raf);
		const tick = () => {
			if (!visible()) return;
			if (!active || !document.contains(active.el) || coveredByDialog(active.el)) return hide();
			position();
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}

	// ---- Event handling --------------------------------------------------------------
	function onFocusIn(e) {
		if (!enabled()) return;
		const el = e.target;
		if (root.contains(el)) return;
		const d = describeField(el, lastMolangKind);
		if (!d) {
			if (!prefs.assistPinned) hide();
			return;
		}
		if (!el.closest('#expression_editor') && !PLAIN_LIKE.has(d.kind)) lastMolangKind = d.kind;
		active = { el, kind: d.kind, edited: false };
		dismissed = false;       // refocusing the field reopens the assistant
		suppressUntilInput = false;
		update();
	}

	function onFocusOut(e) {
		const el = e.target;
		if (!active || el !== active.el) return;
		setTimeout(() => {
			// Focus may already have moved on to another field that took over.
			if (!active || active.el !== el) return;
			if (document.activeElement === el || root.contains(document.activeElement)) return;
			if (!prefs.assistPinned) hide();
		}, 0);
	}

	function onEdit(e) {
		if (!active || e.target !== active.el || accepting || !enabled()) return;
		if (e.type === 'keyup' && ['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
		if (e.type === 'input' || e.type === 'keyup') { suppressUntilInput = false; active.edited = true; }
		update();
	}

	function onKeyDown(e) {
		if (!active || !enabled() || e.isComposing) return;
		if (e.target !== active.el && !root.contains(e.target)) return;
		// Ctrl+Space reopens a dismissed assistant.
		if (e.key === ' ' && e.ctrlKey && !visible()) {
			e.preventDefault(); e.stopPropagation();
			dismissed = false; suppressUntilInput = false; update();
			return;
		}
		if (!visible()) return;
		const n = result ? result.items.length : 0;
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			if (!n) return;
			e.preventDefault(); e.stopPropagation();
			index = e.key === 'ArrowDown' ? (index + 1) % n : (index <= 0 ? n - 1 : index - 1);
			markSelected(true);
		} else if ((e.key === 'Enter' || e.key === 'Tab') && index >= 0 && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
			e.preventDefault(); e.stopPropagation();
			accept(index);
		} else if (e.key === 'Escape') {
			// Close the assistant only; do not let Esc close the dialog behind it.
			e.preventDefault(); e.stopPropagation();
			dismiss();
		}
	}

	function onMouseDown(e) {
		if (!visible() || prefs.assistPinned) return;
		if (root.contains(e.target) || (active && anchorOf(active.el).contains(e.target))) return;
		hide();
	}

	// ---- Replace Blockbench's own Molang popup while we are active --------------------
	function patchNativeAutocomplete() {
		try {
			MolangAutocomplete.Context.all.forEach(ctx => {
				if (ctx.__mo_help_patched) return;
				const original = ctx.autocomplete;
				ctx.autocomplete = function (...args) {
					if (enabled() && active && document.activeElement === active.el) return [];
					return original.apply(this, args);
				};
				ctx.__mo_help_patched = true;
				patched.push([ctx, original]);
			});
		} catch (err) { /* autocomplete API not available: both popups may show */ }
	}
	function unpatchNativeAutocomplete() {
		patched.forEach(([ctx]) => { delete ctx.autocomplete; delete ctx.__mo_help_patched; });
		patched.length = 0;
	}

	function listen(target, type, fn, capture = true) {
		target.addEventListener(type, fn, capture);
		cleanups.push(() => target.removeEventListener(type, fn, capture));
	}

	return {
		start() {
			build();
			listen(document, 'focusin', onFocusIn);
			listen(document, 'focusout', onFocusOut);
			['input', 'keyup', 'mouseup'].forEach(type => listen(document, type, onEdit));
			listen(document, 'keydown', onKeyDown);
			listen(document, 'mousedown', onMouseDown);
			patchNativeAutocomplete();
		},
		/** Called when a menu toggle changes. */
		refresh() {
			if (!enabled()) { hide(); return; }
			if (active && document.activeElement === active.el) { dismissed = false; update(); }
		},
		stop() {
			cleanups.forEach(fn => fn());
			cleanups.length = 0;
			unpatchNativeAutocomplete();
			cancelAnimationFrame(raf);
			if (root) root.remove();
			root = null; active = null; result = null;
		},
	};
}

// Kinds whose fields are not Molang (no point inheriting them into the expression editor).
const PLAIN_LIKE = new Set(['ctrl_animation_name', 'ctrl_particle_effect', 'ctrl_locator', 'ctrl_sound_effect', 'ctrl_state_name', 'kf_effect_particle', 'kf_effect_sound', 'kf_locator']);
