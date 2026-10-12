**Mo'Help** is a contextual Molang assistant. Instead of a static wiki, it watches where you are working in Blockbench and shows only the variables, queries, math functions, operators and ready-made snippets that make sense there.

## How to use

* Open it from **Help → Toggle Mo'Help** (default `Ctrl+Shift+H`, rebindable in Keybindings). It is a floating panel: drag, resize, fold or dock it like any Blockbench panel.
* Click into a field (keyframe, Animation Controller, Variable Placeholders, Molang editor). The panel switches context automatically — or pick one manually from the dropdown.
* **Click any entry** to insert it at the cursor of the field you were editing. If no field is available the text is copied instead.
* Search is fuzzy: `qmv` finds `query.is_moving`. Category chips unlock extra categories; 🔓 shows everything.
* 🎓 **Learn mode** adds tooltips and "Why this?" explanations with clickable examples. 📌 keeps the panel above dialogs.

| Context | Default categories |
| :-- | :-- |
| Help / nothing focused | Everything |
| Variable Placeholders | Booleans, Math, Operators, Variables |
| Animation Controller | Booleans, Operators, Math, Queries, Snippets |
| Keyframe / Timeline | Math, Operators, Easing, Snippets |
| Molang Editor | Variables, Queries, Math, Operators, Snippets |

It only uses Blockbench theme colors, so it follows any theme.
