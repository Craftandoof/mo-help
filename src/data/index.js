import variables from './variables.js';
import queries from './queries.js';
import math from './math.js';
import easing from './easing.js';
import operators from './operators.js';
import booleans from './booleans.js';
import snippets from './snippets.js';

// To add a new category: create a file in this folder, export an array of items
// and add it to the list below (plus a label in src/contexts.js).
export const ALL_ITEMS = [].concat(variables, queries, math, easing, operators, booleans, snippets);
