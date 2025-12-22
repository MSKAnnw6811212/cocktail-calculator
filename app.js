/* app.js - Pixel & Pour Cocktail Calculator (v16.0 - Universal Translation Fix) */

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// -- DOM Elements --
const q = $('#q');
const clearSearchBtn = $('#clearSearch');
const recipeList = $('#recipeList');
const base = $('#base');
const units = $('#units');
const langSelect = $('#langSelect'); 
const pantryBox = $('#pantry');
const clearPantryBtn = $('#clearPantry');
const results = $('#results');
const scaleMode = $('#scaleMode');
const scaleValue = $('#scaleValue');
const scaleLabel = $('#scaleLabel');
const themeToggle = $('#themeToggle');
const bbTable = $('#bbTable tbody');
const bbList = $('#bbList');
const includeGarnish = $('#includeGarnish');
const roundBottles = $('#roundBottles');
const printBtn = $('#printSheet'); 

// -- State --
let RECIPES = [];
let SUBS = {};
let GENERICS = {};
const selected = new Set();
const barBack = new Map();
let CURRENT_LANG = 'en';

// -- SOURCE DATA CONSTANTS (Must match your JSON source exactly) --
// Your ingredients are in German, so these must be German to work as filters.
const ESSENTIALS = ["Eiswürfel", "Zucker", "Salz", "Limette", "Zitrone", "Orange", "Minze", "Oliven", "Kirsche"];
const HIDDEN_SPECIFICS = [
    "Bourbon Whiskey", "Rye Whiskey", "Canadian Whisky", "Scotch Whisky",
    "Weißer Rum", "Dunkler Rum", "Brauner Rum", "Aged Rum",
    "Vermouth Rosso", "Vermouth Dry", "Triple Sec", "Cointreau"
];

// -- THE UNIVERSAL DICTIONARY --
// Structure: Key (Source Text from JSON) -> { en: "English Output", de: "German Output" }
const DATA_DICT = {
    // --- INGREDIENTS (Source is German) ---
    "Eiswürfel": { en: "Ice Cubes", de: "Eiswürfel" },
    "Crushed Ice": { en: "Crushed Ice", de: "Crushed Ice" },
    "Zucker": { en: "Sugar", de: "Zucker" },
    "Salz": { en: "Salt", de: "Salz" },
    "Pfeffer": { en: "Pepper", de: "Pfeffer" },
    "Limette": { en: "Lime", de: "Limette" },
    "Zitrone": { en: "Lemon", de: "Zitrone" },
    "Orange": { en: "Orange", de: "Orange" },
    "Minze": { en: "Mint", de: "Minze" },
    "Oliven": { en: "Olives", de: "Oliven" },
    "Kirsche": { en: "Cherry", de: "Kirsche" },
    "Erdbeeren": { en: "Strawberries", de: "Erdbeeren" },
    "Vanilleeis": { en: "Vanilla Ice Cream", de: "Vanilleeis" },
    
    "Gin": { en: "Gin", de: "Gin" },
    "Rum (any)": { en: "Rum (Any)", de: "Rum (Alle)" },
    "Whiskey (any)": { en: "Whiskey (Any)", de: "Whiskey (Alle)" },
    "Vodka": { en: "Vodka", de: "Wodka" },
    "Tequila": { en: "Tequila", de: "Tequila" },
    "Cachaça": { en: "Cachaça", de: "Cachaça" },
    "Cognac": { en: "Cognac", de: "Cognac" },
    "Brandy": { en: "Brandy", de: "Brandy" },
    
    "Kaffeelikör": { en: "Coffee Liqueur", de: "Kaffeelikör" },
    "Campari": { en: "Campari", de: "Campari" },
    "Aperol": { en: "Aperol", de: "Aperol" },
    "Amaretto": { en: "Amaretto", de: "Amaretto" },
    "Maraschino": { en: "Maraschino", de: "Maraschino" },
    "Cream Liqueur": { en: "Cream Liqueur", de: "Sahnelikör" },
    "Triple Sec": { en: "Triple Sec", de: "Triple Sec" },
    
    "Prosecco": { en: "Prosecco", de: "Prosecco" },
    "Champagner": { en: "Champagne", de: "Champagner" },
    "Rotwein": { en: "Red Wine", de: "Rotwein" },
    "Weißwein": { en: "White Wine", de: "Weißwein" },
    "Wermut": { en: "Vermouth", de: "Wermut" },
    "Sherry": { en: "Sherry", de: "Sherry" },
    "Portwein": { en: "Port", de: "Portwein" },
    
    "Zitronensaft": { en: "Lemon Juice", de: "Zitronensaft" },
    "Limettensaft": { en: "Lime Juice", de: "Limettensaft" },
    "Orangensaft": { en: "Orange Juice", de: "Orangensaft" },
    "Ananassaft": { en: "Pineapple Juice", de: "Ananassaft" },
    "Cranberrysaft": { en: "Cranberry Juice", de: "Cranberrysaft" },
    "Tomatensaft": { en: "Tomato Juice", de: "Tomatensaft" },
    "Grapefruit Soda": { en: "Grapefruit Soda", de: "Grapefruit Soda" },
    "Cola": { en: "Cola", de: "Cola" },
    "Sodawasser": { en: "Soda Water", de: "Sodawasser" },
    "Tonic Water": { en: "Tonic Water", de: "Tonic Water" },
    "Ingwerbier": { en: "Ginger Beer", de: "Ingwerbier" },
    "Ginger Ale": { en: "Ginger Ale", de: "Ginger Ale" },
    "Zuckersirup": { en: "Sugar Syrup", de: "Zuckersirup" },
    "Mandelsirup": { en: "Orgeat", de: "Mandelsirup" },
    "Grenadine": { en: "Grenadine", de: "Grenadine" },
    "Honigsirup": { en: "Honey Syrup", de: "Honigsirup" },
    "Sahne": { en: "Cream", de: "Sahne" },
    "Milch": { en: "Milk", de: "Milch" },
    "Kokosnusscreme": { en: "Coconut Cream", de: "Kokosnusscreme" },
    "Eiweiß": { en: "Egg White", de: "Eiweiß" },
    "Worcestershiresauce": { en: "Worcestershire Sauce", de: "Worcestershiresauce" },
    "Angostura Bitters": { en: "Angostura Bitters", de: "Angostura Bitters" },
    "Pfirsichpüree": { en: "Peach Puree", de: "Pfirsichpüree" },
    
    // Sub-Varieties (that appear in Pantry/Recipe)
    "Bourbon Whiskey": { en: "Bourbon Whiskey", de: "Bourbon Whiskey" },
    "Rye Whiskey": { en: "Rye Whiskey", de: "Rye Whiskey" },
    "Weißer Rum": { en: "White Rum", de: "Weißer Rum" },
    "Dunkler Rum": { en: "Dark Rum", de: "Dunkler Rum" },
    "Brauner Rum": { en: "Aged Rum", de: "Brauner Rum" },
    "Vermouth Dry": { en: "Dry Vermouth", de: "Wermut Trocken" },
    "Vermouth Rosso": { en: "Sweet Vermouth", de: "Wermut Rot" },
    "Weißer Rohrzucker": { en: "White Cane Sugar", de: "Weißer Rohrzucker" },

    // --- METHODS & GLASS (Source is English) ---
    "Stir": { en: "Stir", de: "Rühren" },
    "Shake": { en: "Shake", de: "Schütteln" },
    "Build": { en: "Build", de: "Bauen" },
    "Muddle": { en: "Muddle", de: "Zerstoßen" },
    "Shake + top": { en: "Shake + top", de: "Schütteln + Auffüllen" },
    "Blend/Shake": { en: "Blend/Shake", de: "Mixen/Schütteln" },
    "Roll/Stir": { en: "Roll/Stir", de: "Rollen/Rühren" },
    "Blend": { en: "Blend", de: "Mixen" },
    
    "Tumbler": { en: "Tumbler", de: "Tumbler" },
    "Martini": { en: "Martini", de: "Martini-Glas" },
    "Coupe": { en: "Coupe", de: "Schale" },
    "Highball": { en: "Highball", de: "Highball-Glas" },
    "Longdrink": { en: "Longdrink", de: "Longdrink-Glas" },
    "Mule Mug": { en: "Mule Mug", de: "Kupferbecher" },
    "Wine Glass": { en: "Wine Glass", de: "Weinglas" },
    "Flute": { en: "Flute", de: "Sektflöte" },
    "Julep Cup": { en: "Julep Cup", de: "Julep-Becher" },

    // --- INSTRUCTIONS (Source is English) ---
    "Stir ingredients with ice. Strain over fresh ice. Garnish with orange.": { en: "Stir ingredients with ice. Strain over fresh ice. Garnish with orange.", de: "Auf Eis rühren. Auf frisches Eis abseihen. Mit Orange garnieren." },
    "Stir with ice. Strain into chilled glass. Garnish with olive.": { en: "Stir with ice. Strain into chilled glass. Garnish with olive.", de: "Auf Eis rühren. In gekühltes Glas abseihen. Mit Olive garnieren." },
    "Shake with ice. Fine strain.": { en: "Shake with ice. Fine strain.", de: "Mit Eis schütteln. Fein abseihen." },
    "Shake with ice. Strain into salt-rimmed glass.": { en: "Shake with ice. Strain into salt-rimmed glass.", de: "Mit Eis schütteln. In Glas mit Salzrand abseihen." },
    "Build over ice. Float cream.": { en: "Build over ice. Float cream.", de: "Auf Eis bauen. Sahne vorsichtig darüberschichten (floaten)." },
    "Build in glass over ice. Stir.": { en: "Build in glass over ice. Stir.", de: "Im Glas auf Eis bauen. Umrühren." },
    "Shake hard. Strain.": { en: "Shake hard. Strain.", de: "Kräftig schütteln. Abseihen." },
    "Muddle mint. Add ingredients/ice. Top with soda.": { en: "Muddle mint. Add ingredients/ice. Top with soda.", de: "Minze andrücken. Zutaten & Eis dazu. Mit Soda toppen." },
    "Build in mug over ice.": { en: "Build in mug over ice.", de: "Im Becher auf Eis bauen." },
    "Build over ice.": { en: "Build over ice.", de: "Direkt auf Eis bauen." },
    "Stir with ice. Garnish with celery.": { en: "Stir with ice. Garnish with celery.", de: "Auf Eis rühren. Mit Sellerie garnieren." },
    "Shake with ice. Strain.": { en: "Shake with ice. Strain.", de: "Mit Eis schütteln. Abseihen." },
    "Shake (no soda). Top with soda.": { en: "Shake (no soda). Top with soda.", de: "Schütteln (ohne Soda). Mit Soda toppen." },
    "Shake hard. Pour unstrained.": { en: "Shake hard. Pour unstrained.", de: "Kräftig schütteln. Ungeseiht (mit Eis) ins Glas gießen." },
    "Shake or blend.": { en: "Shake or blend.", de: "Schütteln oder im Mixer blenden." },
    "Build in glass over ice.": { en: "Build in glass over ice.", de: "Im Glas auf Eis bauen." },
    "Muddle lime/sugar. Add ice/cachaça.": { en: "Muddle lime/sugar. Add ice/cachaça.", de: "Limette & Zucker zerstoßen. Eis & Cachaça dazu." },
    "Shake. Strain. Top with soda.": { en: "Shake. Strain. Top with soda.", de: "Schütteln. Abseihen. Mit Soda toppen." },
    "Pour puree. Top gently.": { en: "Pour puree. Top gently.", de: "Püree in das Glas geben. Vorsichtig mit Schaumwein auffüllen." },
    "Shake. Strain into flute. Top.": { en: "Shake. Strain into flute. Top.", de: "Schütteln. In Flöte abseihen. Auffüllen." },
    "Build in glass.": { en: "Build in glass.", de: "Im Glas bauen." },
    "Muddle mint. Add ice/bourbon. Stir until frosted.": { en: "Muddle mint. Add ice/bourbon. Stir until frosted.", de: "Minze andrücken. Eis/Bourbon dazu. Rühren bis das Glas beschlägt." },
    "Build. Sink grenadine.": { en: "Build. Sink grenadine.", de: "Bauen. Grenadine am Rand hineinsinken lassen." },
    "Shake all spirits/sour. Strain. Top with Cola.": { en: "Shake all spirits/sour. Strain. Top with Cola.", de: "Spirituosen & Sours schütteln. Abseihen. Mit Cola toppen." }
};

// -- UI LABELS (Separate Dictionary) --
const UI_DICT = {
    en: { 
        lbl_lang: "Language", lbl_search: "Find Recipe", lbl_base: "Base Spirit", lbl_units: "Units",
        lbl_pantry_head: "Pantry — Filter by what you have", lbl_pantry_sub: "Select ingredients to see what you can make.",
        lbl_scale: "Scale by", lbl_shop_head: "Shopping List", lbl_shop_sub: "Add recipes above to see total ingredients needed here.",
        lbl_garnish: "Include garnish", lbl_round: "Round to 750ml bottles",
        btn_clear: "❌ Clear Selection", btn_print: "Print",
        opt_all: "All", opt_servings: "Servings", opt_target: "Target ml (Total)",
        th_ing: "Ingredient", th_qty: "Total Qty",
        lbl_method: "Method", lbl_glass: "Glass", 
        lbl_missing: "Missing:", lbl_makeable: "You have everything!",
        lbl_item_s: "item(s)", btn_add_sheet: "+ Shopping List",
        search_ph: "Type to search or browse...", 
        welcome_head: "Welcome to Pixel & Pour",
        welcome_text: "Select a Base Spirit, Search for a drink, or filter by your Pantry ingredients to get started.",
        qty_count: "Count / As needed", 
        cat_essentials: "Essentials", cat_spirit: "Spirits", cat_liqueur: "Liqueurs", cat_wine_bubbly: "Wine & Bubbly", cat_mixer_na: "Mixers / Other",
        servings_label: "Servings", target_label: "Target ml"
    },
    de: { 
        lbl_lang: "Sprache", lbl_search: "Rezept suchen", lbl_base: "Basis-Spirituose", lbl_units: "Einheit",
        lbl_pantry_head: "Vorratsschrank — Was hast du da?", lbl_pantry_sub: "Wähle Zutaten, um passende Drinks zu finden.",
        lbl_scale: "Skalieren", lbl_shop_head: "Einkaufsliste", lbl_shop_sub: "Füge oben Rezepte hinzu, um hier die Summen zu sehen.",
        lbl_garnish: "Garnitur einrechnen", lbl_round: "Auf 750ml Flaschen runden",
        btn_clear: "❌ Auswahl löschen", btn_print: "Drucken",
        opt_all: "Alle", opt_servings: "Portionen", opt_target: "Zielmenge (ml)",
        th_ing: "Zutat", th_qty: "Menge",
        lbl_method: "Zubereitung", lbl_glass: "Glas", 
        lbl_missing: "Fehlt:", lbl_makeable: "Alles da!",
        lbl_item_s: "Zutat(en)", btn_add_sheet: "+ Einkaufsliste",
        search_ph: "Tippen zum Suchen...", 
        welcome_head: "Willkommen bei Pixel & Pour",
        welcome_text: "Wähle eine Basis, suche einen Drink oder filtere nach deinen Zutaten.",
        qty_count: "Stück / Nach Bedarf", 
        cat_essentials: "Basics", cat_spirit: "Spirituosen", cat_liqueur: "Liköre", cat_wine_bubbly: "Wein & Sekt", cat_mixer_na: "Mixer / Sonstiges",
        servings_label: "Portionen", target_label: "Zielmenge"
    }
};

const savedTheme = localStorage.getItem('pp_theme');
if(savedTheme === 'dark') document.body.classList.add('dark');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('pp_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

async function initData() {
  try {
    const [rRes, sRes] = await Promise.all([ fetch('./data/cocktails.json'), fetch('./data/substitutions.json') ]);
    if(!rRes.ok || !sRes.ok) throw new Error("Failed");
    const rData = await rRes.json();
    const sData = await sRes.json();
    RECIPES = rData.recipes; SUBS = sData.substitutions; GENERICS = sData.generic_families;
    
    updateStaticLabels();
    populateDatalist(); renderPantry(); render(); renderBarBack();
  } catch (err) { results.innerHTML = `<div class="card" style="color:var(--fail); padding:20px;">Error Loading Data.</div>`; }
}

function t(key, type='ui') {
    // 1. DATA TRANSLATION (Ingredients, Methods, Glass, Instructions)
    if (type === 'ing') {
        const entry = DATA_DICT[key];
        // If entry exists, return appropriate lang. If not, return original key.
        if (entry) return entry[CURRENT_LANG] || key;
        return key;
    }

    // 2. UI LABELS
    if (UI_DICT[CURRENT_LANG] && UI_DICT[CURRENT_LANG][key]) {
        return UI_DICT[CURRENT_LANG][key];
    }
    return UI_DICT.en[key] || key;
}

function updateStaticLabels() {
    $$('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key, 'ui');
    });
    q.placeholder = t('search_ph', 'ui');
    scaleLabel.textContent = scaleMode.value === 'servings' ? t('servings_label') : t('target_label');
}

function getGlassIcon(glassType) {
    const g = (glassType || "").toLowerCase();
    if(g.includes('martini') || g.includes('coupe')) return '🍸';
    if(g.includes('tumbler') || g.includes('rocks')) return '🥃';
    if(g.includes('long') || g.includes('highball') || g.includes('collins')) return '🥤';
    if(g.includes('mule') || g.includes('mug')) return '🍺';
    if(g.includes('flute') || g.includes('sekt')) return '🥂';
    if(g.includes('wine')) return '🍷';
    return '🍹';
}

function typeOf(name) {
  const n = name.toLowerCase();
  // Check against German Source names
  if(ESSENTIALS.map(e=>e.toLowerCase()).includes(n)) return 'Essentials';
  if (/gin|wodka|vodka|rum|whisk|bourbon|rye|tequila|cognac|brandy|cachaça/.test(n)) return 'Spirit';
  if (/vermouth|wermut|sherry|porto|aperitif|campari|amaro|liqueur|likör|sec|cointreau|kahlua/.test(n)) return 'Liqueur';
  if (/wine|wein|champagner|sekt|prosecco/.test(n)) return 'Wine/Bubbly';
  return 'Mixer/NA';
}

function convertQty(qtyMl) {
  const u = units.value;
  if (u === 'ml') return [Math.round(qtyMl), 'ml'];
  if (u === 'cl') return [parseFloat((qtyMl / 10).toFixed(1)), 'cl']; 
  const oz = qtyMl / 29.57;
  return [parseFloat(oz.toFixed(2)), 'oz'];
}

function scaledMl(ml) { return ml * Math.max(0.1, Number(scaleValue.value || 1)); }

function matchesSelection(ingName, subset = selected) {
  if (subset.has(ingName)) return true;
  const sub = SUBS[ingName];
  if (sub && sub.some(s => subset.has(s))) return true;
  for (const [label, pattern] of Object.entries(GENERICS)) {
    if (!subset.has(label)) continue;
    try { if (new RegExp(pattern, 'i').test(ingName)) return true; } catch (e) { }
  }
  return false;
}

function getMissingIngredients(r) {
    if (selected.size === 0) return [];
    return r.ingredients.filter(i => !i.optional && !matchesSelection(i.name));
}

function populateDatalist() {
    const bv = base.value;
    const filteredRecipes = RECIPES.filter(r => bv === 'All' || (r.base && r.base.includes(bv)));
    const opts = filteredRecipes.map(r => `<option value="${r.name}"></option>`).sort();
    recipeList.innerHTML = opts.join('');
}

function renderPantry() {
  const recipeIngredients = new Set(RECIPES.flatMap(r => r.ingredients.map(i => i.name)));
  ESSENTIALS.forEach(e => recipeIngredients.add(e));
  const allIngredients = Array.from(recipeIngredients).sort();
  const groups = { Essentials:[], Spirit: [], Liqueur: [], 'Wine/Bubbly': [], 'Mixer/NA': [] };
  
  for (const ing of allIngredients) {
    if (HIDDEN_SPECIFICS.includes(ing)) continue;
    const type = typeOf(ing);
    if(groups[type]) groups[type].push(ing); else groups['Mixer/NA'].push(ing);
  }
  for (const label of Object.keys(GENERICS)) {
      const type = typeOf(label);
      if(groups[type]) groups[type].push(label);
  }

  const order = ['Essentials', 'Spirit', 'Liqueur', 'Wine/Bubbly', 'Mixer/NA'];
  const catKeys = { 'Essentials': 'cat_essentials', 'Spirit': 'cat_spirit', 'Liqueur': 'cat_liqueur', 'Wine/Bubbly': 'cat_wine_bubbly', 'Mixer/NA': 'cat_mixer_na' };

  pantryBox.innerHTML = order.map(g => {
    const list = groups[g];
    if(!list || list.length === 0) return '';
    const title = t(catKeys[g], 'ui'); 
    return `<div class="pantry-group"><strong>${title}</strong><div class="pantry-grid">` +
      [...new Set(list)].sort().map(name => {
         const isChecked = selected.has(name) ? 'checked' : '';
         return `<label class="pantry-item"><input type="checkbox" value="${name}" ${isChecked}> ${t(name, 'ing')}</label>`;
      }).join('') + `</div></div>`;
  }).join('');
  
  pantryBox.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      e.target.checked ? selected.add(e.target.value) : selected.delete(e.target.value);
      render();
    }
  });
}

function render() {
  const qv = q.value.trim().toLowerCase();
  const bv = base.value;
  clearSearchBtn.hidden = qv === "";

  const isDefaultFilters = qv === "" && bv === "All" && selected.size === 0;
  if(isDefaultFilters) {
      results.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--muted);">
        <h2 style="color:var(--txt); margin-bottom:10px;">${t('welcome_head')}</h2>
        <p>${t('welcome_text')}</p>
        <div style="font-size:40px; margin-top:20px; opacity:0.3;">🍸 🥃 🍹</div>
      </div>`;
      return;
  }

  const activeFilters = new Set();
  selected.forEach(s => { if (!ESSENTIALS.includes(s)) activeFilters.add(s); });

  let list = RECIPES.filter(r => {
    const matchesBase = bv === 'All' || (r.base && r.base.includes(bv));
    const matchesSearch = qv === '' || r.name.toLowerCase().includes(qv);
    let matchesPantry = true;
    if (activeFilters.size > 0) {
        matchesPantry = r.ingredients.some(ing => matchesSelection(ing.name, activeFilters));
    }
    return matchesBase && matchesSearch && matchesPantry;
  });

  list.sort((a, b) => getMissingIngredients(a).length - getMissingIngredients(b).length);

  if(list.length === 0) {
      results.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--muted);">
        <h3>No matches found</h3>
        <p>Try clearing filters or adding more ingredients.</p>
      </div>`;
      return;
  }

  results.innerHTML = list.map(r => {
    const missing = getMissingIngredients(r);
    const isMakeable = missing.length === 0;
    
    const statusBadge = isMakeable && selected.size > 0
        ? `<div class="status-bar ok">✅ ${t('lbl_makeable')}</div>` 
        : (selected.size > 0 ? `<div class="status-bar missing">${t('lbl_missing')} ${missing.length} ${t('lbl_item_s')}</div>` : '');

    const ings = r.ingredients.map(i => {
      const ml = scaledMl(i.qtyMl || 0);
      const [v, u] = convertQty(ml);
      const label = i.label ? ` <span style="font-size:0.9em;color:var(--muted)">(${i.label})</span>` : '';
      const top = i.top ? ' (top up)' : '';
      const name = t(i.name, 'ing'); 
      const qtyDisplay = i.qtyMl ? `<span class="qty">${v} ${u}</span>` : '—';
      
      const isMissing = selected.size > 0 && !i.optional && !matchesSelection(i.name);
      const isOwned = selected.size > 0 && (i.optional || matchesSelection(i.name));

      let style = ''; let icon = '';
      if (isMissing) { style = 'color:var(--fail); font-weight:700;'; icon = ' 🛒'; } 
      else if (isOwned) { style = 'color:var(--ok); font-weight:600;'; icon = ' ✔'; }

      return `<div style="${style}">${qtyDisplay} ${name}${label}${top}${icon}</div>`;
    }).join('');

    const icon = getGlassIcon(r.glass);

    return `<article class="recipe ${isMakeable ? '' : 'faded'}">
      ${statusBadge}
      <div style="display:flex;justify-content:space-between;align-items:start; padding-top:10px;">
        <h3 style="margin:0;">${icon} ${r.name}</h3>
      </div>
      <div class="meta">${t('lbl_method')}: ${t(r.method, 'ing')} • ${t('lbl_glass')}: ${t(r.glass, 'ing')}</div>
      <div class="ingredients" style="margin:10px 0;padding:12px;background:var(--bg);border-radius:8px;">${ings}</div>
      <div style="font-style:italic;font-size:14px;margin-bottom:10px;line-height:1.5;">${t(r.instructions, 'ing')}</div>
      <div style="margin-top:auto;">
        <button class="primary" data-add="${r.id}">${t('btn_add_sheet')}</button>
      </div>
    </article>`;
  }).join('');

  results.querySelectorAll('button[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const recipe = RECIPES.find(r => r.id === btn.getAttribute('data-add'));
      if (recipe) addToBarBack(recipe);
    });
  });
}

function addToBarBack(recipe) {
  const defServings = Math.max(1, Number(scaleMode.value === 'servings' ? scaleValue.value : 1));
  const current = barBack.get(recipe.id) || { recipe, servings: 0 };
  current.servings += defServings;
  barBack.set(recipe.id, current);
  renderBarBack();
}
function removeFromBarBack(id) { barBack.delete(id); renderBarBack(); }

function renderBarBack() {
  bbList.innerHTML = Array.from(barBack.values()).map(({ recipe, servings }) => {
    return `<span class="bb-chip">${recipe.name} × ${servings} <button data-rm="${recipe.id}" class="link" style="color:var(--fail);margin-left:5px;">×</button></span>`;
  }).join('');
  
  bbList.querySelectorAll('button[data-rm]').forEach(btn => btn.addEventListener('click', () => removeFromBarBack(btn.getAttribute('data-rm'))));

  const totals = new Map();
  for (const { recipe, servings } of barBack.values()) {
    for (const ing of recipe.ingredients) {
      if (ing.optional && !includeGarnish.checked) continue;
      const totalMl = (ing.qtyMl || 0) * servings;
      if(!totals.has(ing.name)) totals.set(ing.name, { ml:0, count:0 });
      const rec = totals.get(ing.name);
      rec.ml += totalMl;
      rec.count += servings;
    }
  }

  bbTable.innerHTML = "";
  Array.from(totals.entries()).sort().forEach(([name, data]) => {
    let mlDisplay = "";
    if (data.ml > 0) {
        if (roundBottles.checked) {
            const btls = Math.ceil(data.ml / 750);
            mlDisplay = `<strong>${btls}</strong> x 750ml btls`;
        } else {
            mlDisplay = `${Math.round(data.ml)} ml`;
        }
    } else {
        mlDisplay = `<span style="color:var(--muted);">${t('qty_count')}</span>`;
    }
    const cl = data.ml > 0 ? (data.ml / 10).toFixed(1) + ' cl' : '—';
    const oz = data.ml > 0 ? (data.ml / 29.57).toFixed(1) + ' oz' : '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t(name, 'ing')}</td><td>${mlDisplay}</td><td>${cl} / ${oz}</td>`;
    bbTable.appendChild(tr);
  });
}

q.addEventListener('input', render);
base.addEventListener('change', () => { q.value = ""; populateDatalist(); render(); });
units.addEventListener('change', render);
scaleMode.addEventListener('change', render);
scaleValue.addEventListener('input', render);
langSelect.addEventListener('change', () => { 
    CURRENT_LANG = langSelect.value; 
    updateStaticLabels(); 
    renderPantry(); 
    render(); 
    renderBarBack(); 
});
includeGarnish.addEventListener('change', renderBarBack);
roundBottles.addEventListener('change', renderBarBack);
clearPantryBtn.addEventListener('click', () => { selected.clear(); $$('#pantry input[type="checkbox"]').forEach(box => box.checked = false); render(); });
clearSearchBtn.addEventListener('click', () => { q.value = ""; q.focus(); render(); });
if(printBtn) printBtn.addEventListener('click', () => {
    document.getElementById('barback').scrollIntoView({behavior: 'smooth'});
    setTimeout(() => window.print(), 500);
});

initData();
