import { makeCategory } from './_make.js';
const v = makeCategory('variables');

export default [
	v('query.anim_time', 'Elapsed time of the current animation in seconds.', {
		snippet: 'query.anim_time', example: 'math.sin(query.anim_time * 360) * 20',
		tags: ['time', 'animation'], why: 'Drives any oscillation. Multiply by 360 to get one full sine cycle per second.',
	}),
	v('query.delta_time', 'Time in seconds since the last rendered frame. Useful for Anim Time Update.', {
		example: 'variable.t = variable.t + query.delta_time', tags: ['time', 'frame'],
	}),
	v('query.life_time', 'Seconds the entity has existed in the world.', { tags: ['time'] }),
	v('query.distance_from_camera', 'Distance from the camera to the entity.', { example: 'query.distance_from_camera < 16', tags: ['camera', 'distance'] }),
	v('variable.attack_time', 'Progress of an attack swing, from 0.0 to 1.0.', { example: 'variable.attack_time * 90', tags: ['attack', 'vanilla'] }),
	v('variable.is_sneaking', 'Vanilla variable: 1.0 while sneaking.', { tags: ['state', 'vanilla'] }),
	v('variable.is_sprinting', 'Vanilla variable: 1.0 while sprinting.', { tags: ['state', 'vanilla'] }),
	v('variable.is_swimming', 'Vanilla variable: 1.0 while swimming.', { tags: ['state', 'vanilla'] }),
	v('variable.swim_amount', 'Progress of the swimming pose blend (0.0 to 1.0).', { tags: ['swim', 'vanilla'] }),
	v('variable.bob_animation', 'Oscillation value used for walking and idle bobbing.', { tags: ['bob', 'vanilla'] }),
	v('variable.charge_amount', 'Charge built up by bows, tridents and custom items.', { tags: ['charge', 'vanilla'] }),

	// Placeholder helpers (Variable Placeholders panel)
	v("slider('Name', step, min, max)", 'Creates an interactive slider in the preview. Put it after a variable assignment.', {
		id: 'placeholder.slider', snippet: "slider('speed', 0.1, 0, 1)", example: "variable.speed = slider('speed', 0.1, 0, 1)",
		tags: ['placeholder', 'slider', 'preview'], contexts: ['placeholders'],
		why: 'Lets you drive a variable by hand while previewing, without the game.',
	}),
	v("toggle('Name')", 'Creates an on/off switch (0 or 1) in the preview.', {
		id: 'placeholder.toggle', snippet: "toggle('sneaking')", example: "variable.is_sneaking = toggle('sneaking')",
		tags: ['placeholder', 'toggle', 'boolean'], contexts: ['placeholders'],
	}),
	v("impulse('Name', duration)", 'Button that sets the variable to 1 for a short time, then back to 0.', {
		id: 'placeholder.impulse', snippet: "impulse('attack', 0.4)", example: "variable.attack_time = impulse('attack', 0.4)",
		tags: ['placeholder', 'impulse', 'event'], contexts: ['placeholders'],
	}),
	v('variable.name = value', 'Declares a variable that you can use in every expression of the project.', {
		id: 'placeholder.assign', snippet: 'variable.my_value = 0', example: 'variable.my_value = 0.5',
		tags: ['placeholder', 'assign'], contexts: ['placeholders'],
	}),
	v('preview.texture / preview.texture_frame', 'Special preview-only variables that change the displayed texture or its frame.', {
		id: 'preview.texture', snippet: 'preview.texture = 0', example: 'preview.texture_frame = 2',
		tags: ['preview', 'texture'], contexts: ['placeholders'],
	}),
	v('preview.scale', 'Preview-only scale (also preview.scalex / scaley / scalez).', {
		id: 'preview.scale', snippet: 'preview.scale = 1', example: 'preview.scalex = 1.5',
		tags: ['preview', 'scale'], contexts: ['placeholders'],
	}),
];
