import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_ITEMS } from '../src/data/index.js';
import { CATEGORIES, CONTEXTS } from '../src/contexts.js';
import { search, scoreItem } from '../src/search.js';

test('every item has the documented shape', () => {
	for (const item of ALL_ITEMS) {
		assert.ok(item.id && item.label && item.description, `incomplete item ${JSON.stringify(item)}`);
		assert.ok(item.category in CATEGORIES, `unknown category on ${item.id}`);
		assert.equal(typeof item.snippet, 'string');
		assert.ok(Array.isArray(item.tags));
		if (item.contexts) for (const c of item.contexts) assert.ok(c in CONTEXTS, `unknown context ${c} on ${item.id}`);
	}
});

test('item ids are unique', () => {
	const seen = new Set();
	for (const item of ALL_ITEMS) {
		assert.ok(!seen.has(item.id), `duplicate id ${item.id}`);
		seen.add(item.id);
	}
});

test('every category has content and every context only lists known categories', () => {
	for (const id of Object.keys(CATEGORIES)) assert.ok(ALL_ITEMS.some(i => i.category === id), `empty category ${id}`);
	for (const [ctx, def] of Object.entries(CONTEXTS)) for (const c of def.categories) assert.ok(c in CATEGORIES, `${ctx} -> ${c}`);
});

test('fuzzy search: "qmv" finds query.is_moving first', () => {
	const results = search('qmv', ALL_ITEMS);
	assert.equal(results[0].item.id, 'query.is_moving');
});

test('fuzzy search: exact and partial names rank sensibly', () => {
	assert.equal(search('hermite', ALL_ITEMS)[0].item.id, 'math.hermite_blend(t)');
	assert.ok(search('walk', ALL_ITEMS).some(r => r.item.id === 'snip.walk'));
	assert.equal(search('zzzzzz', ALL_ITEMS).length, 0);
	assert.ok(scoreItem('', ALL_ITEMS[0]) > 0);
});

test('search answers in under 50 ms', () => {
	const start = performance.now();
	for (const q of ['q', 'qmv', 'math.s', 'walk', 'is_', 'transition']) search(q, ALL_ITEMS);
	const per = (performance.now() - start) / 6;
	assert.ok(per < 50, `average ${per.toFixed(2)} ms`);
});

test('context matrix follows the proposal', () => {
	assert.deepEqual([...CONTEXTS.placeholders.categories].sort(), ['booleans', 'math', 'operators', 'variables']);
	assert.ok(CONTEXTS.animation_controller.categories.includes('queries'));
	assert.ok(CONTEXTS.keyframe.categories.includes('easing'));
	assert.equal(CONTEXTS.help.categories.length, Object.keys(CATEGORIES).length);
});
