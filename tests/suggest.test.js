import test from 'node:test';
import assert from 'node:assert/strict';
import { suggest, extractToken } from '../src/suggest.js';

const project = { variables: ['queda', 'smooth_speed', 'attack_time', 'bob'], animations: ['animation.a.walk', 'animation.a.idle'], states: ['default', 'walk'], locators: ['hand'], bones: ['arm'] };
const run = (text, kind = 'molang', p = project) => suggest({ text, caret: text.length, kind, project: p });
const labels = r => r.items.map(i => i.label);

test('empty field offers root namespaces and model variables', () => {
	const l = labels(run(''));
	assert.ok(['query', 'variable', 'math'].every(n => l.includes(n)));
	assert.ok(l.includes('variable.queda') && !l.some(x => x.startsWith('v.')));
});

test('"q" offers query, q. and variables containing q — not the whole query list', () => {
	const l = labels(run('q'));
	assert.ok(l.includes('query') && l.includes('q.') && l.includes('v.queda'));
	assert.ok(!l.includes('query.is_moving'));
	assert.ok(!l.includes('v.smooth_speed'));
});

test('"q." offers only query.* and never model variables', () => {
	const r = run('q.');
	const l = labels(r);
	assert.ok(l.includes('query.anim_time') && l.includes('query.is_moving') && l.includes('query.health'));
	assert.ok(l.every(x => x.startsWith('query.')));
	assert.equal(r.items.find(i => i.label === 'query.is_moving').insert, 'query.is_moving');
});

test('"v." offers only variables, "v.qu" narrows by prefix', () => {
	const l = labels(run('v.'));
	assert.ok(l.includes('v.queda') && l.includes('v.attack_time') && l.includes('v.smooth_speed'));
	assert.ok(l.every(x => x.startsWith('v.')));
	assert.deepEqual(labels(run('v.qu')), ['v.queda']);
	assert.ok(labels(run('variable.qu')).includes('variable.queda'));
});

test('"math." offers math functions and constants only', () => {
	const l = labels(run('math.'));
	for (const n of ['math.sin', 'math.cos', 'math.lerp', 'math.clamp', 'math.hermite_blend', 'math.pi']) assert.ok(l.includes(n), n);
	assert.ok(l.every(x => x.startsWith('math.')));
});

test('unprefixed fragment matches across namespaces', () => {
	const l = labels(run('anim', 'molang', { variables: ['my_anim_speed'] }));
	assert.ok(l.includes('query.anim_time') && l.includes('variable.my_anim_speed'));
	assert.ok(!l.some(x => x.startsWith('v.')));
});

test('token is taken from the caret, mid-expression', () => {
	const r = suggest({ text: 'math.sin(q.', caret: 11, kind: 'molang', project });
	assert.ok(labels(r).every(x => x.startsWith('query.')));
	assert.equal(r.token.raw, 'q.');
	assert.equal(extractToken('1.5 * v', 7).raw, 'v');
	assert.equal(run("slider('na").items.length, 0);
});

test('Anim Time Update: query.anim_time is always first', () => {
	const rootList = labels(run('', 'anim_time_update', { variables: ['queda', 'zeta'] }));
	assert.deepEqual(rootList.slice(0, 4), ['query.anim_time', 'query.delta_time', 'query.ground_speed', 'query.modified_move_speed']);
	assert.ok(rootList.indexOf('variable.queda') > 3 && rootList.some(x => x.startsWith('math.')));
	assert.equal(labels(run('q.', 'anim_time_update'))[0], 'query.anim_time');
	assert.equal(labels(run('anim', 'anim_time_update'))[0], 'query.anim_time');
});

test('Blend Weight: force/weight style model variables first, then interpolation helpers', () => {
	const l = labels(run('', 'blend_weight', { variables: ['alpha', 'queda', 'zzz'] }));
	assert.equal(l[0], 'variable.queda');
	assert.ok(l.indexOf('variable.alpha') < l.indexOf('math.lerp'));
	assert.ok(l.indexOf('math.lerp') < l.indexOf('math.clamp') && l.indexOf('math.clamp') < l.indexOf('math.hermite_blend'));
	assert.equal(labels(run('v.', 'blend_weight', { variables: ['alpha', 'queda'] }))[0], 'v.queda');
});

test('controller conditions list boolean queries; transitions add model variables', () => {
	const cond = labels(run('', 'ctrl_animation_condition'));
	for (const n of ['query.is_moving', 'query.is_on_ground', 'query.is_in_water', 'query.is_riding', 'query.is_baby', 'query.is_alive', 'query.health < 10']) assert.ok(cond.includes(n), n);
	assert.ok(!cond.includes('v.queda'));
	assert.ok(labels(run('', 'ctrl_transition')).includes('variable.queda'));
});

test('controller references list project content', () => {
	assert.deepEqual(labels(run('', 'ctrl_animation_name')), ['animation.a.walk', 'animation.a.idle']);
	assert.deepEqual(labels(run('wal', 'ctrl_animation_name')), ['animation.a.walk']);
	const st = labels(run('', 'ctrl_state_name'));
	assert.ok(st.includes('default') && st.includes('animation.a.idle'));
	assert.deepEqual(labels(run('', 'ctrl_locator')), ['hand', 'arm']);
});

test('abbreviated forms only for a single typed letter; never mixed with full forms', () => {
	const one = labels(run('v'));
	assert.ok(one.includes('variable') && one.includes('v.'));
	assert.ok(one.filter(x => x.includes('.') && x !== 'v.').every(x => x.startsWith('v.')));
	const two = labels(run('va'));
	assert.ok(!two.includes('v.') && !two.some(x => x.startsWith('v.')));
	assert.ok(labels(run('variable.qu')).every(x => x.startsWith('variable.')));
	// full-form lists never contain an abbreviation
	for (const kind of ['molang', 'anim_time_update', 'blend_weight', 'ctrl_transition', 'placeholders']) {
		assert.ok(!labels(run('', kind)).some(x => /^(v|q)\./.test(x)), kind);
	}
});
