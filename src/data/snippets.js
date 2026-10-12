import { makeCategory } from './_make.js';
const s = makeCategory('snippets');

const KEYFRAME = ['keyframe', 'molang_editor', 'help'];
const CONTROLLER = ['animation_controller', 'molang_editor', 'help'];

export default [
	// Keyframe / oscillation
	s('Walk cycle rotation', 'Swings a limb back and forth once per second.', {
		id: 'snip.walk', snippet: 'math.sin(query.anim_time * 360) * 25', tags: ['walk', 'rotation', 'oscillation'], contexts: KEYFRAME,
		why: 'sin() returns -1..1, so multiplying by 25 gives a swing of ±25°.',
	}),
	s('Opposite limb', 'Same swing in the opposite phase for the other leg or arm.', {
		id: 'snip.walk_opposite', snippet: '-math.sin(query.anim_time * 360) * 25', tags: ['walk', 'rotation'], contexts: KEYFRAME,
	}),
	s('Bob animation', 'Small vertical bob at double speed.', {
		id: 'snip.bob', snippet: 'math.cos(query.anim_time * 720) * 2', tags: ['bob', 'position', 'oscillation'], contexts: KEYFRAME,
	}),
	s('Idle breathing', 'Very slow, subtle scale/position pulse.', {
		id: 'snip.breathe', snippet: 'math.sin(query.anim_time * 90) * 0.5', tags: ['idle', 'breathing'], contexts: KEYFRAME,
	}),
	s('Speed-scaled walk', 'Walk swing whose amplitude follows the ground speed.', {
		id: 'snip.speed_walk', snippet: 'math.sin(query.anim_time * 360) * 30 * math.clamp(query.ground_speed * 2, 0, 1)', tags: ['walk', 'speed'], contexts: KEYFRAME,
	}),
	s('Attack swing', 'Raises the arm in proportion to the attack progress.', {
		id: 'snip.attack', snippet: 'variable.attack_time * 90', tags: ['attack', 'rotation'], contexts: KEYFRAME,
	}),
	s('Ease-in-out blend', 'Smooths a 0..1 progress with hermite blending.', {
		id: 'snip.ease_blend', snippet: 'math.hermite_blend(query.anim_time)', tags: ['easing', 'smooth'], contexts: KEYFRAME,
	}),
	s('Eased attack', 'Attack swing with ease-in-out.', {
		id: 'snip.eased_attack', snippet: 'math.lerp(0, 90, math.hermite_blend(variable.attack_time))', tags: ['attack', 'easing'], contexts: KEYFRAME,
	}),
	s('Random shake', 'Jitter of ±1 unit, good for hit reactions.', {
		id: 'snip.shake', snippet: 'math.random(-1, 1)', tags: ['random', 'shake'], contexts: KEYFRAME,
	}),

	// Controller transitions
	s('Idle → Walk', 'Transition when the entity starts moving.', {
		id: 'snip.t_idle_walk', snippet: 'query.is_moving', tags: ['transition', 'walk'], contexts: CONTROLLER,
	}),
	s('Walk → Idle', 'Transition when the entity stops.', {
		id: 'snip.t_walk_idle', snippet: '!query.is_moving', tags: ['transition', 'idle'], contexts: CONTROLLER,
	}),
	s('Health-based transition', 'Moves on when the entity is hurt and still moving.', {
		id: 'snip.t_health', snippet: 'query.health < 10 && query.is_moving', tags: ['transition', 'health'], contexts: CONTROLLER,
	}),
	s('Wait for animation end', 'Leaves the state once every animation has played once.', {
		id: 'snip.t_finished', snippet: 'query.all_animations_finished', tags: ['transition', 'finished'], contexts: CONTROLLER,
	}),
	s('Swim transition', 'Enter swimming only when in water and moving.', {
		id: 'snip.t_swim', snippet: 'query.is_in_water && query.is_moving', tags: ['transition', 'swim'], contexts: CONTROLLER,
	}),
	s('Airborne transition', 'Detect jumping or falling.', {
		id: 'snip.t_air', snippet: '!query.is_on_ground && !query.is_in_water', tags: ['transition', 'jump'], contexts: CONTROLLER,
	}),
	s('Blend in (state blend)', 'Blend-out expression: eases over 0.2 seconds.', {
		id: 'snip.blend', snippet: 'math.clamp(query.anim_time / 0.2, 0, 1)', tags: ['transition', 'blend'], contexts: CONTROLLER,
	}),

	// Molang editor
	s('Multi-statement template', 'Temp variable + return, ready for the Molang editor.', {
		id: 'snip.multi', snippet: 'temp.wave = math.sin(query.anim_time * 360);\nreturn temp.wave * 25;', tags: ['template'], contexts: ['molang_editor', 'help'],
	}),
	s('Conditional amplitude', 'Different amplitude when sneaking.', {
		id: 'snip.sneak_amp', snippet: 'math.sin(query.anim_time * 360) * (variable.is_sneaking ? 10 : 25)', tags: ['sneak', 'conditional'], contexts: ['molang_editor', 'keyframe', 'help'],
	}),
];
