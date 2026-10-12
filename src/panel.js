import { ALL_ITEMS } from './data/index.js';
import { CATEGORIES, CONTEXTS, CONTEXT_IDS, contextLabel } from './contexts.js';
import { search } from './search.js';
import { insertText, copyText } from './insert.js';
import { loadPrefs, savePrefs } from './storage.js';
import { t } from './i18n.js';

const MAX_HISTORY = 8;
const MAX_RESULTS = 60;
const ITEM_BY_ID = new Map(ALL_ITEMS.map(item => [item.id, item]));

export function createComponent() {
	return {
		name: 'panel-mo-help',
		data() {
			return {
				prefs: loadPrefs(),
				query: '',
				detected: 'help',
				open: {},   // item id -> "Why this?" expanded
			};
		},
		computed: {
			context() {
				return this.prefs.contextMode === 'auto' ? this.detected : this.prefs.contextMode;
			},
			contexts() {
				return CONTEXT_IDS.map(id => ({ id, label: contextLabel(id) }));
			},
			defaultCats() {
				return CONTEXTS[this.context].categories;
			},
			activeCats() {
				return this.prefs.catSets[this.context] || this.defaultCats;
			},
			catChips() {
				return Object.keys(CATEGORIES).map(id => ({
					id, label: CATEGORIES[id].label, icon: CATEGORIES[id].icon,
					active: this.activeCats.includes(id),
				}));
			},
			catsModified() {
				const a = this.activeCats, d = this.defaultCats;
				return a.length !== d.length || a.some(c => !d.includes(c));
			},
			visibleItems() {
				const ctx = this.context, cats = this.activeCats;
				return ALL_ITEMS.filter(item => this.inContext(item, ctx, cats));
			},
			groups() {
				const map = {};
				for (const item of this.visibleItems) (map[item.category] = map[item.category] || []).push(item);
				return Object.keys(CATEGORIES).filter(id => map[id]).map(id => ({
					id, label: CATEGORIES[id].label, icon: CATEGORIES[id].icon, items: map[id],
				}));
			},
			results() {
				if (!this.query.trim()) return [];
				const ctx = this.context, cats = this.activeCats;
				return search(this.query, ALL_ITEMS)
					.map(r => {
						const inside = this.inContext(r.item, ctx, cats);
						return { item: r.item, outside: !inside, score: inside ? r.score : r.score * 0.5 };
					})
					.sort((a, b) => b.score - a.score)
					.slice(0, MAX_RESULTS);
			},
			recent() {
				return this.prefs.history.map(id => ITEM_BY_ID.get(id)).filter(Boolean);
			},
			searching() { return !!this.query.trim(); },
		},
		watch: {
			prefs: { deep: true, handler(value) { savePrefs(value); } },
		},
		methods: {
			t,
			inContext(item, ctx, cats) {
				if (!cats.includes(item.category)) return false;
				if (ctx === 'help') return true;
				return !item.contexts || item.contexts.includes(ctx);
			},
			tooltip(item) {
				if (!this.prefs.learn) return '';
				return [item.description, item.why, item.example ? t('example') + ': ' + item.example : ''].filter(Boolean).join('\n');
			},
			insert(item, text) {
				text = text ?? item.snippet;
				const done = insertText(text);
				if (done) {
					Blockbench.showQuickMessage(t('inserted') + text.replace(/\s*\n\s*/g, ' '), 1200);
				} else {
					copyText(text);
					Blockbench.showQuickMessage(t('copied') + text.replace(/\s*\n\s*/g, ' '), 1800);
				}
				const history = this.prefs.history.filter(id => id !== item.id);
				history.unshift(item.id);
				this.prefs.history = history.slice(0, MAX_HISTORY);
			},
			toggleCat(id) {
				const next = this.activeCats.slice();
				const index = next.indexOf(id);
				if (index >= 0) next.splice(index, 1); else next.push(id);
				this.$set(this.prefs.catSets, this.context, next);
			},
			resetCats() { this.$delete(this.prefs.catSets, this.context); },
			allCats() { this.$set(this.prefs.catSets, this.context, Object.keys(CATEGORIES)); },
			toggleCollapse(id) { this.$set(this.prefs.collapsed, id, !this.prefs.collapsed[id]); },
			toggleWhy(id) { this.$set(this.open, id, !this.open[id]); },
			showWhy(item) { return this.prefs.learn ? !!(item.why || item.example) : !!this.open[item.id]; },
			categoryLabel(id) { return CATEGORIES[id] ? CATEGORIES[id].label : id; },
			clearSearch() { this.query = ''; },
		},
		template: `
			<div class="mo_help">
				<div class="mo_help_bar">
					<select class="dark_bordered" v-model="prefs.contextMode">
						<option value="auto">{{ t('auto') }} · {{ contexts.find(c => c.id === detected).label }}</option>
						<option v-for="c in contexts" :key="c.id" :value="c.id">{{ c.label }}</option>
					</select>
					<div class="tool" :class="{enabled: prefs.learn}" :title="t('learn')" @mousedown.prevent @click="prefs.learn = !prefs.learn">
						<i class="material-icons">school</i>
					</div>
					<div class="tool" :class="{enabled: prefs.pinned}" :title="t('pin')" @mousedown.prevent @click="prefs.pinned = !prefs.pinned">
						<i class="material-icons">push_pin</i>
					</div>
				</div>
				<input type="text" class="dark_bordered mo_help_search" v-model="query" :placeholder="t('search')" @keydown.esc.stop="query ? clearSearch() : null">
				<div class="mo_help_chips" @mousedown.prevent>
					<span v-for="chip in catChips" :key="chip.id" class="mo_help_chip" :class="{active: chip.active}" @click="toggleCat(chip.id)">
						<i class="material-icons">{{ chip.icon }}</i>{{ chip.label }}
					</span>
					<span v-if="catsModified" class="mo_help_chip plain" :title="t('reset')" @click="resetCats()"><i class="material-icons">restart_alt</i></span>
					<span class="mo_help_chip plain" :title="t('all')" @click="allCats()"><i class="material-icons">lock_open</i></span>
				</div>
				<div class="mo_help_scroll">
					<template v-if="searching">
						<ul style="padding:0;margin:0">
							<li v-for="r in results" :key="r.item.id" class="mo_help_item" :class="{outside: r.outside}" :title="tooltip(r.item)" @mousedown.prevent @click="insert(r.item)">
								<div class="mo_help_item_head">
									<code>{{ r.item.label }}</code>
									<span class="mo_help_badge">{{ categoryLabel(r.item.category) }}<template v-if="r.outside"> · {{ t('outside') }}</template></span>
								</div>
								<div class="mo_help_desc">{{ r.item.description }}</div>
							</li>
						</ul>
						<div v-if="!results.length" class="mo_help_empty">{{ t('no_results') }}</div>
					</template>
					<template v-else>
						<template v-if="recent.length">
							<div class="mo_help_section_title" style="cursor:default"><i class="material-icons" style="font-size:15px">history</i>{{ t('recent') }}</div>
							<div class="mo_help_chips" style="padding:0 0 4px 0" @mousedown.prevent>
								<span v-for="item in recent" :key="item.id" class="mo_help_chip plain" :title="item.description" @click="insert(item)"><code style="font-family:var(--font-code)">{{ item.label.length > 26 ? item.label.slice(0, 24) + '…' : item.label }}</code></span>
							</div>
						</template>
						<div v-for="group in groups" :key="group.id">
							<div class="mo_help_section_title" @mousedown.prevent @click="toggleCollapse(group.id)">
								<i class="material-icons" style="font-size:16px">{{ prefs.collapsed[group.id] ? 'chevron_right' : 'expand_more' }}</i>
								<i class="material-icons" style="font-size:15px">{{ group.icon }}</i>{{ group.label }}
								<span class="count">{{ group.items.length }}</span>
							</div>
							<ul v-if="!prefs.collapsed[group.id]" style="padding:0;margin:0">
								<li v-for="item in group.items" :key="item.id" class="mo_help_item" :title="tooltip(item)" @mousedown.prevent @click="insert(item)">
									<div class="mo_help_item_head">
										<code>{{ item.label }}</code>
										<i v-if="(item.why || item.example) && !prefs.learn" class="material-icons mo_help_why_btn" :title="t('why')" @mousedown.prevent @click.stop="toggleWhy(item.id)">help_outline</i>
									</div>
									<div class="mo_help_desc">{{ item.description }}</div>
									<div v-if="showWhy(item)" class="mo_help_learn" @click.stop>
										<div v-if="item.why">{{ item.why }}</div>
										<code v-if="item.example" class="mo_help_example" :title="t('example')" @mousedown.prevent @click.stop="insert(item, item.example)">{{ item.example }}</code>
									</div>
								</li>
							</ul>
						</div>
						<div v-if="!groups.length" class="mo_help_empty">{{ t('no_results') }}</div>
					</template>
				</div>
			</div>
		`,
	};
}
