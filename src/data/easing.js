import { makeCategory } from './_make.js';
const e = makeCategory('easing');

export default [
	e('math.hermite_blend(t)', 'Smooth S-curve (3t² − 2t³). Maps 0→1 with ease-in and ease-out.', {
		snippet: 'math.hermite_blend(', example: 'math.lerp(0, 90, math.hermite_blend(variable.attack_time))',
		tags: ['easing', 'smooth', 'ease-in-out'], why: 'Wrap a 0..1 progress value to avoid linear, robotic movement.',
	}),
	e('Ease-in (quadratic)', 'Starts slow, ends fast.', { id: 'ease.in', snippet: 'math.pow(variable.t, 2)', example: 'math.lerp(0, 90, math.pow(variable.t, 2))', tags: ['easing', 'ease-in'] }),
	e('Ease-out (quadratic)', 'Starts fast, ends slow.', { id: 'ease.out', snippet: '1 - math.pow(1 - variable.t, 2)', example: 'math.lerp(0, 90, 1 - math.pow(1 - variable.t, 2))', tags: ['easing', 'ease-out'] }),
	e('Normalized loop (0 → 1)', 'Converts anim_time into a repeating 0..1 progress value for a given duration.', {
		id: 'ease.loop', snippet: 'math.mod(query.anim_time, 1)', example: 'math.hermite_blend(math.mod(query.anim_time, 1))', tags: ['easing', 'loop'],
	}),
	e('Ping-pong (0 → 1 → 0)', 'Triangle wave useful as a back-and-forth blend factor.', {
		id: 'ease.pingpong', snippet: 'math.abs(math.mod(query.anim_time, 2) - 1)', tags: ['easing', 'loop', 'wave'],
	}),
	e('Smooth wave (0 → 1 → 0)', 'Sine-based blend that stays between 0 and 1.', {
		id: 'ease.wave', snippet: '(math.sin(query.anim_time * 360) + 1) * 0.5', tags: ['easing', 'wave', 'oscillation'],
	}),
];
