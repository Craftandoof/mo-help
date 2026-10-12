import { makeCategory } from './_make.js';
const q = makeCategory('queries');
const bool = (name, desc, extra = {}) => q(name, desc, { example: `${name} ? 1 : 0`, ...extra, tags: ['boolean', ...(extra.tags || [])] });

export default [
	bool('query.is_moving', 'Returns 1.0 if the entity is moving horizontally.', { tags: ['state', 'movement'] }),
	bool('query.is_on_ground', 'Returns 1.0 if the entity is standing on solid ground.', { tags: ['state', 'ground'] }),
	bool('query.is_in_water', 'Returns 1.0 if the entity is in water.', { tags: ['state', 'water'] }),
	bool('query.is_in_lava', 'Returns 1.0 if the entity is in lava.', { tags: ['state', 'lava'] }),
	bool('query.is_riding', 'Returns 1.0 if riding another entity or vehicle.', { tags: ['state', 'ride'] }),
	bool('query.is_baby', 'Returns 1.0 if the entity is a baby variant.', { tags: ['state', 'baby'] }),
	bool('query.is_gliding', 'Returns 1.0 while gliding with an Elytra.', { tags: ['state', 'elytra'] }),
	bool('query.is_alive', 'Returns 1.0 if the entity has health above 0.', { tags: ['state', 'health'] }),
	bool('query.is_jumping', 'Returns 1.0 while the entity is jumping.', { tags: ['state', 'jump'] }),
	bool('query.is_eating', 'Returns 1.0 while the entity is eating.', { tags: ['state', 'eat'] }),
	bool('query.blocking', 'Returns 1.0 while blocking with a shield or item.', { tags: ['state', 'shield'] }),
	bool('query.is_enchanted', 'Returns 1.0 if the item or entity is enchanted.', { tags: ['state', 'enchant'] }),
	q('query.health', 'Current health points.', { example: 'query.health < 10', tags: ['health', 'number'] }),
	q('query.max_health', 'Maximum health points.', { example: 'query.health / query.max_health', tags: ['health', 'number'] }),
	q('query.ground_speed', 'Movement speed along the ground, in blocks per second.', { example: 'math.clamp(query.ground_speed * 2, 0, 1)', tags: ['speed', 'movement', 'number'] }),
	q('query.modified_move_speed', 'Walk speed after effects (fire, baby, potions) are applied.', { example: 'query.modified_move_speed * 20', tags: ['speed', 'movement', 'number'] }),
	q('query.time_of_day', 'World time as a value from 0.0 to 1.0.', { tags: ['world', 'time', 'number'] }),
	q('query.all_animations_finished', 'Returns 1.0 once every animation in the current controller state has finished at least once.', {
		example: 'query.all_animations_finished', tags: ['controller', 'transition', 'boolean'], contexts: ['animation_controller', 'molang_editor', 'help'],
	}),
	q('query.any_animation_finished', 'Returns 1.0 once any animation in the current controller state has finished.', {
		example: 'query.any_animation_finished', tags: ['controller', 'transition', 'boolean'], contexts: ['animation_controller', 'molang_editor', 'help'],
	}),
	q('query.above_top_solid', 'Height of the block above the highest solid block at the entity position.', { tags: ['world', 'number'] }),
	q('query.actor_count', 'Number of entities rendered in the last frame.', { tags: ['world', 'number'] }),
	q('query.block_face', 'Face index: Down 0, Up 1, North 2, South 3, West 4, East 5.', { example: 'query.block_face == 1', tags: ['block', 'number'] }),
];
