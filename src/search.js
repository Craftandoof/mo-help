// Fuzzy subsequence scoring. "qmv" matches "query.is_moving".
// Higher is better; 0 means no match.
function scoreSubsequence(query, text) {
	let qi = 0;
	let score = 0;
	let streak = 0;
	let last = -2;
	for (let i = 0; i < text.length && qi < query.length; i++) {
		if (text[i] !== query[qi]) { streak = 0; continue; }
		let points = 1;
		const prev = text[i - 1];
		if (i === 0 || prev === '.' || prev === '_' || prev === ' ' || prev === '(') points += 4; // word start
		if (i === last + 1) { streak++; points += 2 + streak; } else streak = 0;
		score += points;
		last = i;
		qi++;
	}
	return qi === query.length ? score : 0;
}

export function scoreItem(query, item) {
	const q = query.toLowerCase().replace(/\s+/g, '');
	if (!q) return 1;
	const label = item.label.toLowerCase();
	const id = String(item.id).toLowerCase();
	let best = 0;

	if (label.includes(q) || id.includes(q)) {
		best = 200 + (label.startsWith(q) ? 100 : 0) - Math.min(label.length, 60);
	}
	best = Math.max(best, scoreSubsequence(q, label) * 3, scoreSubsequence(q, id) * 3);

	if (item.tags && item.tags.some(tag => tag.includes(q))) best = Math.max(best, 120);
	const desc = item.description.toLowerCase();
	if (desc.includes(q)) best = Math.max(best, 60);
	return best;
}

export function search(query, items) {
	const results = [];
	for (const item of items) {
		const score = scoreItem(query, item);
		if (score > 0) results.push({ item, score });
	}
	results.sort((a, b) => b.score - a.score);
	return results;
}
