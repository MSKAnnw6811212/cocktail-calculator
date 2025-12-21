/* app.js - Pixel & Pour Cocktail Calculator (v14.0 - Total Translation Fix) */

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

const ESSENTIALS = ["Eiswürfel", "Zucker", "Salz", "Limette", "Zitrone", "Orange", "Minze", "Oliven", "Kirsche"];
const HIDDEN_SPECIFICS = [
    "Bourbon Whiskey", "Rye Whiskey", "Canadian Whisky", "Scotch Whisky",
    "Weißer Rum", "Dunkler Rum", "Brauner Rum", "Aged Rum",
    "Vermouth Rosso", "Vermouth Dry", "Triple Sec", "Cointreau"
];

// -- THE DICTIONARY --
const DICT = {
    ui: {
        en: { 
            // Static UI Labels (Top Controls)
            lbl_lang: "Language", lbl_search: "Find Recipe", lbl_base: "Base Spirit", lbl_units: "Units",
            lbl_pantry_head: "Pantry — Filter by what you have", lbl_pantry_sub: "Select ingredients to see what you can make.",
            lbl_scale: "Scale by", lbl_shop_head: "Shopping List", lbl_shop_sub: "Add recipes above to see total ingredients needed here.",
            lbl_garnish: "Include garnish", lbl_round: "Round to 750ml bottles",
            btn_clear: "❌ Clear Selection", btn_print: "Print",
            opt_all: "All", opt_servings: "Servings", opt_target: "Target ml (Total)",
            th_ing: "Ingredient", th_qty: "Total Qty",

            // Dynamic UI Labels (Recipe Cards)
            lbl_method: "Method", lbl_glass: "Glass", 
            lbl_missing: "Missing:", lbl_makeable: "You have everything!",
            lbl_item_s: "item(s)", 
            btn_add_sheet: "+ Shopping List",

            // Dynamic Text
            search_ph: "Type to search or browse...", 
            welcome_head: "Welcome to Pixel & Pour",
            welcome_text: "Select a Base Spirit, Search for a drink, or filter by your Pantry ingredients to get started.",
            qty_count: "Count / As needed", 
            
            // Pantry Categories
            cat_essentials: "Essentials", cat_spirit: "Spirits", cat_liqueur: "Liqueurs", cat_wine_bubbly: "Wine & Bubbly", cat_mixer_na: "Mixers / Other",
            
            // Scale Labels
            servings_label: "Servings", target_label: "Target ml"
        },
        de: { 
            // Static UI Labels
            lbl_lang: "Sprache", lbl_search: "Rezept suchen", lbl_base: "Basis-Spirituose", lbl_units: "Einheit",
            lbl_pantry_head: "Vorratsschrank — Was hast du da?", lbl_pantry_sub: "Wähle Zutaten, um passende Drinks zu finden.",
            lbl_scale: "Skalieren", lbl_shop_head: "Einkaufsliste", lbl_shop_sub: "Füge oben Rezepte hinzu, um hier die Summen zu sehen.",
            lbl_garnish: "Garnitur einrechnen", lbl_round: "Auf 750ml Flaschen runden",
            btn_clear: "❌ Auswahl löschen", btn_print: "Drucken",
            opt_all: "Alle", opt_servings: "Portionen", opt_target: "Zielmenge (ml)",
            th_ing: "Zutat", th_qty: "Menge",

            // Dynamic UI Labels
            lbl_method: "Zubereitung", lbl_glass: "Glas", 
            lbl_missing: "Fehlt:", lbl_makeable: "Alles da!",
            lbl_item_s: "Zutat(en)", 
            btn_add_sheet: "+ Einkaufsliste",

            // Dynamic Text
            search_ph: "Tippen zum Suchen...", 
            welcome_head: "Willkommen bei Pixel & Pour",
            welcome_text: "Wähle eine Basis, suche einen Drink oder filtere nach deinen Zutaten.",
            qty_count: "Stück / Nach Bedarf", 
            
            // Pantry Categories
            cat_essentials: "Basics", cat_spirit: "Spirituosen", cat_liqueur: "Liköre", cat_wine_bubbly: "Wein & Sekt", cat_mixer_na: "Mixer / Sonstiges",
            
            // Scale Labels
            servings_label: "Portionen", target_label: "Zielmenge"
        }
    },
    ing: {
        // --- 1. Methods & Glasses ---
        "Stir": "Rühren", "Shake": "Schütteln", "Build": "Bauen", "Muddle": "Zerstoßen", 
        "Shake + top": "Schütteln + Auffüllen", "Blend/Shake": "Mixen/Schütteln", "Roll/Stir": "Rollen/Rühren", "Blend": "Mixen",
        "Tumbler": "Tumbler", "Martini": "Martini-Glas", "Coupe": "Schale", "Highball": "Highball-Glas",
        "Longdrink": "Longdrink-Glas", "Mule Mug": "Kupferbecher", "Wine Glass": "Weinglas", "Flute": "Sektflöte", "Julep Cup": "Julep-Becher",
        "Großes Glas": "Großes Glas", "Glas": "Glas",

        // --- 2. Ingredients ---
        "Eiswürfel": "Ice Cubes", "Crushed Ice": "Crushed Ice", "Zucker": "Sugar", "Salz": "Salt", "Pfeffer": "Pepper",
        "Limette": "Lime", "Zitrone": "Lemon", "Orange": "Orange", "Minze": "Mint", "Oliven": "Olives", "Kirsche": "Cherry", "Erdbeeren": "Strawberries", "Vanilleeis": "Vanilla Ice Cream",
        "Gin": "Gin", "Rum (any)": "Rum (Alle)", "Whiskey (any)": "Whiskey (Alle)", "Vodka": "Vodka", "Tequila": "Tequila",
        "Cachaça": "Cachaça", "Cognac": "Cognac", "Brandy": "Brandy",
        "Kaffeelikör": "Coffee Liqueur", "Campari": "Campari", "Aperol": "Aperol", "Amaretto": "Amaretto",
        "Maraschino": "Maraschino", "Cream Liqueur": "Cream Liqueur",
        "Prosecco": "Prosecco", "Champagner": "Champagne", "Rotwein": "Red Wine", "Weißwein": "White Wine", 
        "Wermut": "Vermouth", "Sherry": "Sherry", "Portwein": "Port",
        "Zitronensaft": "Lemon Juice", "Limettensaft": "Lime Juice", "Orangensaft": "Orange Juice",
        "Ananassaft": "Pineapple Juice", "Cranberrysaft": "Cranberry Juice", "Tomatensaft": "Tomato Juice",
        "Grapefruit Soda": "Grapefruit Soda", "Cola": "Cola", "Sodawasser": "Soda Water", "Tonic Water": "Tonic Water",
        "Ingwerbier": "Ginger Beer", "Ginger Ale": "Ginger Ale",
        "Zuckersirup": "Sugar Syrup", "Mandelsirup": "Orgeat", "Grenadine": "Grenadine", "Honigsirup": "Honey Syrup",
        "Sahne": "Cream", "Milch": "Milk", "Kokosnusscreme": "Coconut Cream",
        "Eiweiß": "Egg White", "Worcestershiresauce": "Worcestershire Sauce", "Angostura Bitters": "Angostura Bitters",
        "Pfirsichpüree": "Peach Puree",

        // --- 3. Instructions (Refined) ---
        "Stir ingredients with ice. Strain over fresh ice. Garnish with orange.": "Auf Eis rühren. Auf frisches Eis abseihen. Mit Orange garnieren.",
        "Stir with ice. Strain into chilled glass. Garnish with olive.": "Auf Eis rühren. In gekühltes Glas abseihen. Mit Olive garnieren.",
        "Shake with ice. Fine strain.": "Mit Eis schütteln. Fein abseihen.",
        "Shake with ice. Strain into salt-rimmed glass.": "Mit Eis schütteln. In Glas mit Salzrand abseihen.",
        "Build over ice. Float cream.": "Auf Eis bauen. Sahne vorsichtig darüberschichten (floaten).",
        "Build in glass over ice. Stir.": "Im Glas auf Eis bauen. Umrühren.",
        "Shake hard. Strain.": "Kräftig schütteln. Abseihen.",
        "Muddle mint. Add ingredients/ice. Top with soda.": "Minze andrücken. Zutaten & Eis dazu. Mit Soda toppen.",
        "Build in mug over ice.": "Im Becher auf Eis bauen.",
        "Build over ice.": "Direkt auf Eis bauen.",
        "Stir with ice. Garnish with celery.": "Auf Eis rühren. Mit Sellerie garnieren.",
        "Shake with ice. Strain.": "Mit Eis schütteln. Abseihen.",
        "Shake (no soda). Top with soda.": "Schütteln (ohne Soda). Mit Soda toppen.",
        "Shake hard. Pour unstrained.": "Kräftig schütteln. Ungeseiht (mit Eis) ins Glas gießen.",
        "Shake or blend.": "Schütteln oder im Mixer blenden.",
        "Build in glass over ice.": "Im Glas auf Eis bauen.",
        "Muddle lime/sugar. Add ice/cachaça.": "Limette & Zucker zerstoßen. Eis & Cachaça dazu.",
        "Shake. Strain. Top with soda.": "Schütteln. Abseihen. Mit Soda toppen.",
        "Pour puree. Top gently.": "Püree in das Glas geben. Vorsichtig mit Schaumwein auffüllen.",
        "Shake. Strain into flute. Top.": "Schütteln. In Flöte abseihen. Auffüllen.",
        "Build in glass.": "Im Glas bauen.",
        "Muddle mint. Add ice/bourbon. Stir until frosted.": "Minze andrücken. Eis/Bourbon dazu. Rühren bis das Glas beschlägt.",
        "Build. Sink grenadine.": "Bauen. Grenadine am Rand hineinsinken lassen.",
        "Shake all spirits/sour. Strain. Top with Cola.": "Spirituosen & Sours schütteln. Abseihen. Mit Cola toppen.",
        "Im Becher über Eis bauen; Limette.": "Build in mug over ice. Add lime.",
        "Alles im Mixer pürieren; hohes Glas.": "Blend everything. Pour into tall glass.",
        "Im Glas bauen; umrühren.": "Build in glass. Stir."
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
    if (CURRENT_LANG === 'de') return DICT[type].de[key] || key;
    if (type === 'ing') {
        if (CURRENT_LANG === 'en') return DICT.ing[key] || key;
        return key; 
    }
    return DICT.ui.en[key] || key; 
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
  if(ESSENTIALS.includes(name)) return 'Essentials';
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
  // Correctly mapping internal keys to UI dictionary keys
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
    
    // UPDATED: Using dynamic 'lbl_missing' and 'lbl_makeable' from dictionary
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

    // UPDATED: Using 'lbl_method', 'lbl_glass', and 'btn_add_sheet' from dictionary
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
