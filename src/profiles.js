// Field profiles: what each kind of field needs first.
//   root     recipe used when the field is empty (see expandRoot in suggest.js)
//   priority explicit names that always come first inside any list
//   varBoost project variables whose name matches are ranked ahead of the rest
//
// Add a profile here to teach Mo'Help about a new field; fields.js decides
// which `kind` a focused element has.

export const BOOLEAN_QUERIES = [
	'query.is_moving', 'query.is_on_ground', 'query.is_in_water', 'query.is_riding', 'query.is_baby',
	'query.is_alive', 'query.is_jumping', 'query.is_in_lava', 'query.is_gliding', 'query.blocking',
];
export const COMPARISONS = [
	{ text: 'query.health < 10', desc: 'Low health condition' },
	{ text: '!query.is_moving', desc: 'Standing still' },
	{ text: 'query.ground_speed > 0.1', desc: 'Moving faster than a crawl' },
	{ text: 'query.is_moving && query.is_on_ground', desc: 'Walking on the ground' },
];
export const COMMON_MATH = ['math.lerp', 'math.clamp', 'math.hermite_blend', 'math.sin', 'math.cos', 'math.min', 'math.max', 'math.mod', 'math.abs'];

const GENERIC = ['@namespaces', '@vars'];

export const PROFILES = {
	anim_time_update: {
		title: 'Anim Time Update',
		// query.anim_time is the baseline of this field: always first.
		priority: ['query.anim_time', 'query.delta_time', 'query.ground_speed', 'query.modified_move_speed'],
		root: ['query.anim_time', 'query.delta_time', 'query.ground_speed', 'query.modified_move_speed', '@vars', '@math', '@namespaces'],
	},
	blend_weight: {
		title: 'Blend Weight',
		varBoost: /queda|forc|weight|strength|blend|fall|power|mass|amount|factor|intensity|mix|smooth/i,
		priority: ['math.lerp', 'math.clamp', 'math.hermite_blend'],
		root: ['@boostvars', '@vars', 'math.lerp', 'math.clamp', 'math.hermite_blend', '@namespaces'],
	},
	start_delay: {
		title: 'Start Delay',
		priority: ['math.random', 'query.anim_time'],
		root: ['math.random', 'query.anim_time', 'query.life_time', '@vars', '@namespaces'],
	},
	loop_delay: {
		title: 'Loop Delay',
		priority: ['math.random', 'query.anim_time'],
		root: ['math.random', 'query.anim_time', 'query.life_time', '@vars', '@namespaces'],
	},
	ctrl_animation_condition: {
		title: 'Condition',
		priority: BOOLEAN_QUERIES,
		root: ['@bools', '@namespaces'],
	},
	ctrl_transition: {
		title: 'Transition condition',
		priority: BOOLEAN_QUERIES,
		root: ['@bools', '@vars', '@namespaces'],
	},
	ctrl_script: {
		title: 'Script',
		root: ['@vars', '@namespaces'],
	},
	keyframe: {
		title: 'Keyframe',
		priority: ['query.anim_time', 'math.sin', 'math.cos'],
		root: ['query.anim_time', 'math.sin', 'math.cos', 'math.lerp', '@vars', '@namespaces'],
	},
	placeholders: {
		title: 'Variable Placeholders',
		root: ['@namespaces', '@vars', '@helpers'],
	},
	molang: { title: 'Molang', root: GENERIC },
};
export const DEFAULT_PROFILE = PROFILES.molang;

// Non-Molang fields that expect a reference to something in the project.
export const PLAIN_KINDS = {
	ctrl_animation_name: [{ key: 'animations', tag: 'animation', desc: 'Animation in this project' }],
	ctrl_particle_effect: [{ key: 'particles', tag: 'particle', desc: 'Particle effect used in this project' }],
	ctrl_locator: [{ key: 'locators', tag: 'locator', desc: 'Locator' }, { key: 'bones', tag: 'bone', desc: 'Bone' }],
	ctrl_sound_effect: [{ key: 'sounds', tag: 'sound', desc: 'Sound effect used in this project' }],
	ctrl_state_name: [{ key: 'states', tag: 'state', desc: 'State in this controller' }, { key: 'animations', tag: 'animation', desc: 'Animation in this project' }],
	kf_effect_particle: [{ key: 'particles', tag: 'particle', desc: 'Particle effect used in this project' }],
	kf_effect_sound: [{ key: 'sounds', tag: 'sound', desc: 'Sound effect used in this project' }],
	kf_locator: [{ key: 'locators', tag: 'locator', desc: 'Locator' }, { key: 'bones', tag: 'bone', desc: 'Bone' }],
};
for (const [kind, title] of [['ctrl_animation_name', 'Animation'], ['ctrl_particle_effect', 'Particle effect'], ['ctrl_locator', 'Locator'], ['ctrl_sound_effect', 'Sound'], ['ctrl_state_name', 'State name'], ['kf_effect_particle', 'Particle effect'], ['kf_effect_sound', 'Sound effect'], ['kf_locator', 'Locator']]) {
	PROFILES[kind] = { title, root: [] };
}
