// Minimal UI translations. Library content (data/*.js) stays in English because
// it mirrors Molang's own names.
const STRINGS = {
	en: {
		panel_name: 'Mo\'Help',
		search: 'Search…  (e.g. qmv → query.is_moving)',
		auto: 'Auto',
		pin: 'Keep on top',
		learn: 'Learn mode',
		reset: 'Reset categories',
		all: 'Show all categories',
		recent: 'Recent',
		why: 'Why this?',
		example: 'Example',
		no_results: 'Nothing found.',
		outside: 'outside context',
		inserted: 'Inserted: ',
		copied: 'No field focused – copied: ',
		toggle_action: 'Toggle Mo\'Help',
		toggle_desc: 'Show or hide the Mo\'Help contextual assistant',
		ctx_help: 'Help (everything)',
		ctx_placeholders: 'Variable Placeholders',
		ctx_animation_controller: 'Animation Controller',
		ctx_keyframe: 'Keyframe / Timeline',
		ctx_molang_editor: 'Molang Editor',
	},
	pt: {
		panel_name: 'Mo\'Help',
		search: 'Buscar…  (ex.: qmv → query.is_moving)',
		auto: 'Auto',
		pin: 'Manter no topo',
		learn: 'Modo aprender',
		reset: 'Restaurar categorias',
		all: 'Mostrar todas as categorias',
		recent: 'Recentes',
		why: 'Por que isso?',
		example: 'Exemplo',
		no_results: 'Nada encontrado.',
		outside: 'fora do contexto',
		inserted: 'Inserido: ',
		copied: 'Nenhum campo em foco – copiado: ',
		toggle_action: 'Alternar Mo\'Help',
		toggle_desc: 'Mostra ou oculta o assistente contextual Mo\'Help',
		ctx_help: 'Ajuda (tudo)',
		ctx_placeholders: 'Variable Placeholders',
		ctx_animation_controller: 'Animation Controller',
		ctx_keyframe: 'Keyframe / Timeline',
		ctx_molang_editor: 'Editor de Molang',
	},
};

export function t(key) {
	let code = 'en';
	try { code = (typeof Language !== 'undefined' && Language.code) || 'en'; } catch (err) { /* ignore */ }
	const table = code.startsWith('pt') ? STRINGS.pt : STRINGS.en;
	return table[key] ?? STRINGS.en[key] ?? key;
}
