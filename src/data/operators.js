import { makeCategory } from './_make.js';
const o = makeCategory('operators');

export default [
	o('+', 'Adds two values. In a keyframe field it adds to the current value.', { id: 'op.add', snippet: ' + ', example: 'variable.a + variable.b', tags: ['arithmetic'] }),
	o('-', 'Subtracts two values.', { id: 'op.sub', snippet: ' - ', example: 'variable.a - 1', tags: ['arithmetic'] }),
	o('*', 'Multiplies two values.', { id: 'op.mul', snippet: ' * ', example: 'query.anim_time * 360', tags: ['arithmetic'] }),
	o('/', 'Divides two values.', { id: 'op.div', snippet: ' / ', example: 'query.health / query.max_health', tags: ['arithmetic'] }),
	o('( )', 'Groups an expression to control evaluation order.', { id: 'op.group', snippet: '()', example: '(variable.a + variable.b) * 2', tags: ['syntax'] }),
	o('? :', 'Ternary: condition ? value_if_true : value_if_false.', { id: 'op.ternary', snippet: ' ? 1 : 0', example: 'query.is_moving ? 25 : 0', tags: ['conditional', 'syntax'] }),
	o('??', 'Null coalescing: uses the right side when the left side is unset.', { id: 'op.coalesce', snippet: ' ?? 0', example: 'variable.speed ?? 0', tags: ['conditional', 'syntax'] }),
	o(';', 'Ends a statement. Use it to chain several statements.', { id: 'op.semicolon', snippet: ';', example: 'variable.t = query.anim_time; return variable.t * 2;', tags: ['syntax'] }),
	o('return', 'Returns a value from a multi-statement expression.', { id: 'op.return', snippet: 'return ', example: 'variable.t = 2; return variable.t;', tags: ['syntax'] }),
	o('temp.name = value', 'Temporary variable that exists only for the current expression.', { id: 'op.temp', snippet: 'temp.value = ', example: 'temp.s = math.sin(query.anim_time * 360); return temp.s * 20;', tags: ['syntax', 'variable'] }),

	// Relative operators for keyframe fields
	o('val', 'Keyframe field: the previous value of the field.', {
		id: 'rel.val', snippet: 'val', example: 'val * 2', tags: ['relative', 'keyframe'], contexts: ['keyframe', 'help'],
		why: 'Select several keyframes, type an expression using val and every field is changed relative to itself.',
	}),
	o('n', 'Keyframe field: index of the element in a multi-selection.', {
		id: 'rel.n', snippet: 'n', example: 'val + n * 5', tags: ['relative', 'keyframe'], contexts: ['keyframe', 'help'],
	}),
	o('+= (relative add)', 'Keyframe field: type "+5" to add 5 to every selected value.', {
		id: 'rel.add', snippet: '+5', tags: ['relative', 'keyframe'], contexts: ['keyframe', 'help'],
	}),
	o('*= (relative multiply)', 'Keyframe field: type "*2" to double every selected value.', {
		id: 'rel.mul', snippet: '*2', tags: ['relative', 'keyframe'], contexts: ['keyframe', 'help'],
	}),
	o('/= (relative divide)', 'Keyframe field: type "/2" to halve every selected value.', {
		id: 'rel.div', snippet: '/2', tags: ['relative', 'keyframe'], contexts: ['keyframe', 'help'],
	}),
	o('+- (relative subtract)', 'Keyframe field: "+-5" subtracts 5, because a lone "-" means a negative number.', {
		id: 'rel.sub', snippet: '+-5', tags: ['relative', 'keyframe'], contexts: ['keyframe', 'help'],
	}),
];
