// Helper used by every data file.
// Each item follows the shape documented in the README:
// { id, category, label, description, snippet, example, tags, contexts }
// `contexts` is optional – when omitted, the item shows in every context whose
// category filter (see src/contexts.js) includes the item's category.
export function makeCategory(category) {
	return function item(label, description, extra = {}) {
		return {
			id: extra.id || label,
			category,
			label,
			description,
			snippet: extra.snippet ?? label,
			example: extra.example ?? '',
			tags: extra.tags ?? [],
			contexts: extra.contexts, // undefined = follow category matrix
			why: extra.why ?? '',
		};
	};
}
