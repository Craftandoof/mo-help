// Only Blockbench theme variables are used, so every theme (dark, light,
// contrast, community themes such as MM3 You) is followed automatically.
export const CSS = `
/* Stacking is done with !important classes because Blockbench rewrites the inline
   z-index of floating panels every time one is clicked. */
.panel_container.floating.mo_help_pinned { z-index: 19 !important; }
.panel_container.floating.mo_help_raised { z-index: 30 !important; }
#panel_mo_help .mo_help {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	font-size: 0.92em;
}
#panel_mo_help .mo_help_bar {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 6px 6px 0 6px;
}
#panel_mo_help .mo_help_bar select {
	flex: 1;
	min-width: 0;
}
#panel_mo_help .mo_help_bar .tool {
	flex: 0 0 auto;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}
#panel_mo_help .mo_help_search {
	margin: 6px;
	width: calc(100% - 12px);
	box-sizing: border-box;
}
#panel_mo_help .mo_help_chips {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	padding: 0 6px 6px 6px;
}
#panel_mo_help .mo_help_chip {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	padding: 1px 9px 1px 6px;
	border-radius: 20px;
	cursor: pointer;
	user-select: none;
	background-color: var(--color-button);
	color: var(--color-subtle_text);
	border: 1px solid var(--color-border);
}
#panel_mo_help .mo_help_chip i {
	font-size: 15px;
	width: 15px;
	height: 15px;
}
#panel_mo_help .mo_help_chip:hover {
	color: var(--color-light);
}
#panel_mo_help .mo_help_chip.active {
	background-color: var(--color-accent);
	color: var(--color-accent_text);
	border-color: var(--color-accent);
}
#panel_mo_help .mo_help_chip.plain {
	padding-left: 9px;
}
#panel_mo_help .mo_help_scroll {
	flex: 1 1 auto;
	min-height: 0;
	overflow-y: auto;
	padding: 0 6px 8px 6px;
}
#panel_mo_help .mo_help_section_title {
	display: flex;
	align-items: center;
	gap: 4px;
	margin: 8px 0 3px 0;
	padding: 2px 2px;
	color: var(--color-subtle_text);
	text-transform: uppercase;
	font-size: 0.8em;
	letter-spacing: 0.04em;
	cursor: pointer;
	user-select: none;
}
#panel_mo_help .mo_help_section_title:hover {
	color: var(--color-light);
}
#panel_mo_help .mo_help_section_title .count {
	margin-left: auto;
}
#panel_mo_help .mo_help_item {
	list-style: none;
	padding: 4px 6px;
	margin-bottom: 2px;
	border-radius: 3px;
	cursor: pointer;
	background-color: var(--color-back);
	border: 1px solid transparent;
}
#panel_mo_help .mo_help_item:hover {
	background-color: var(--color-selected);
	border-color: var(--color-accent);
}
#panel_mo_help .mo_help_item.outside {
	opacity: 0.6;
}
#panel_mo_help .mo_help_item_head {
	display: flex;
	align-items: center;
	gap: 6px;
}
#panel_mo_help .mo_help_item code,
#panel_mo_help .mo_help_example {
	font-family: var(--font-code);
	color: var(--color-light);
	background: none;
	padding: 0;
	word-break: break-all;
}
#panel_mo_help .mo_help_item_head code {
	flex: 1;
	min-width: 0;
}
#panel_mo_help .mo_help_badge {
	flex: 0 0 auto;
	font-size: 0.8em;
	color: var(--color-subtle_text);
}
#panel_mo_help .mo_help_why_btn {
	flex: 0 0 auto;
	font-size: 17px;
	width: 17px;
	height: 17px;
	color: var(--color-subtle_text);
}
#panel_mo_help .mo_help_why_btn:hover {
	color: var(--color-accent);
}
#panel_mo_help .mo_help_desc {
	color: var(--color-subtle_text);
	margin-top: 1px;
}
#panel_mo_help .mo_help_learn {
	margin-top: 4px;
	padding: 4px 6px;
	border-left: 3px solid var(--color-accent);
	background-color: var(--color-ui);
	cursor: default;
}
#panel_mo_help .mo_help_learn .mo_help_example {
	display: block;
	margin-top: 3px;
	padding: 3px 5px;
	cursor: pointer;
	border-radius: 3px;
	background-color: var(--color-dark);
}
#panel_mo_help .mo_help_learn .mo_help_example:hover {
	outline: 1px solid var(--color-accent);
}
#panel_mo_help .mo_help_empty {
	padding: 16px 6px;
	text-align: center;
	color: var(--color-subtle_text);
}
`;

export const ASSIST_CSS = `
.mo_help_assist {
	position: fixed;
	z-index: 40;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	background-color: var(--color-ui);
	color: var(--color-text);
	border: 1px solid var(--color-accent);
	border-radius: 4px;
	box-shadow: 0 0 10px rgb(0 0 0 / 40%);
	font-size: 0.92em;
	overflow: hidden;
}
.mo_help_assist_head {
	display: flex;
	align-items: center;
	gap: 6px;
	flex: 0 0 auto;
	padding: 2px 4px 2px 8px;
	background-color: var(--color-back);
	border-bottom: 1px solid var(--color-border);
	user-select: none;
}
.mo_help_assist.below .mo_help_assist_head { order: 2; border-bottom: 0; border-top: 1px solid var(--color-border); }
.mo_help_assist_title {
	color: var(--color-subtle_text);
	text-transform: uppercase;
	font-size: 0.8em;
	letter-spacing: 0.04em;
}
.mo_help_assist_crumb {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-family: var(--font-code);
	color: var(--color-light);
}
.mo_help_assist_btn {
	flex: 0 0 auto;
	font-size: 16px;
	width: 18px;
	height: 18px;
	cursor: pointer;
	color: var(--color-subtle_text);
}
.mo_help_assist_btn:hover { color: var(--color-light); }
.mo_help_assist_btn.on { color: var(--color-accent); }
.mo_help_assist_list {
	flex: 1 1 auto;
	margin: 0;
	padding: 2px;
	overflow-y: auto;
	list-style: none;
}
.mo_help_assist_list li {
	display: grid;
	grid-template-columns: 1fr auto;
	column-gap: 8px;
	padding: 2px 6px;
	border-left: 3px solid transparent;
	border-radius: 2px;
	cursor: pointer;
}
.mo_help_assist_list li.selected {
	background-color: var(--color-selected);
	border-left-color: var(--color-accent);
}
.mo_help_assist_list li.selected .desc { display: block; }
.mo_help_assist_list code {
	font-family: var(--font-code);
	color: var(--color-light);
	background: none;
	padding: 0;
	word-break: break-all;
}
.mo_help_assist_list code b { color: var(--color-accent); }
.mo_help_assist_list .tag {
	align-self: center;
	font-size: 0.78em;
	color: var(--color-subtle_text);
}
.mo_help_assist_list .tag_project { color: var(--color-accent); }
.mo_help_assist_list .desc {
	display: none;
	grid-column: 1 / -1;
	color: var(--color-subtle_text);
	font-size: 0.9em;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
`;
