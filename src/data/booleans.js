import { makeCategory } from './_make.js';
const b = makeCategory('booleans');

export default [
	b('true', 'Boolean true (1.0).', { snippet: 'true', tags: ['literal'] }),
	b('false', 'Boolean false (0.0).', { snippet: 'false', tags: ['literal'] }),
	b('&&', 'Logical AND: true when both sides are true.', { id: 'bool.and', snippet: ' && ', example: 'query.is_moving && query.is_on_ground', tags: ['logic'] }),
	b('||', 'Logical OR: true when at least one side is true.', { id: 'bool.or', snippet: ' || ', example: 'query.is_in_water || query.is_in_lava', tags: ['logic'] }),
	b('!', 'Logical NOT: inverts a value.', { id: 'bool.not', snippet: '!', example: '!query.is_moving', tags: ['logic'] }),
	b('==', 'Equal to.', { id: 'bool.eq', snippet: ' == ', example: 'query.block_face == 1', tags: ['compare'] }),
	b('!=', 'Not equal to.', { id: 'bool.neq', snippet: ' != ', tags: ['compare'] }),
	b('<', 'Less than.', { id: 'bool.lt', snippet: ' < ', example: 'query.health < 10', tags: ['compare'] }),
	b('<=', 'Less than or equal to.', { id: 'bool.lte', snippet: ' <= ', tags: ['compare'] }),
	b('>', 'Greater than.', { id: 'bool.gt', snippet: ' > ', example: 'query.ground_speed > 0.1', tags: ['compare'] }),
	b('>=', 'Greater than or equal to.', { id: 'bool.gte', snippet: ' >= ', tags: ['compare'] }),
];
