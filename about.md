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

## Smart assistant (anchored to the field)

Click into a Molang field (keyframe, Variable Placeholders, Animation Controller, animation properties, Molang editor) and a helper row appears **directly above the field** (below only when there is no room above). It cannot be dragged and disappears when the field loses focus, unless pinned.

* **Namespace-aware:** `q.` → only `query.*`, `v.` → model/plugin variables, `math.` → math functions, `v.qu` → `v.queda`. A single typed letter may show the short form (`q.`, `v.`); two or more letters always show the full form.
* **Field-aware priority:** *Anim Time Update* always starts with `query.anim_time`, `query.delta_time`…; *Blend Weight* starts with force/weight-like model variables, then `math.lerp`/`clamp`/`hermite_blend`; controller conditions and transitions list boolean queries (transitions also model variables).
* **Project references:** animation, state, bone/locator, particle and sound names found in the open model.
* Keys: ↑/↓ move, Enter/Tab insert, Esc closes (re-open by refocusing the field or with Ctrl+Space).
* While active it replaces Blockbench's own Molang autocomplete popup for that field.

## Mo'Help menu

* **Floating Information** – shows/hides the floating guide.
* **Disable Smart Assistant** – no analysis; the guide switches from *Auto* to *Everything*.
* **Disable Smart Overlay** – never places suggestions above the field you edit.
