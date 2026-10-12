import { loadPrefs, savePrefs } from './storage.js';

// One reactive preferences object shared by the floating panel, the anchored
// assistant and the menu, persisted on every change.
let vm = null;
export function getState() {
	if (!vm) {
		vm = new Vue({ data: { prefs: loadPrefs() } });
		vm.$watch('prefs', value => savePrefs(value), { deep: true });
	}
	return vm.prefs;
}
export function resetState() { vm = null; }
