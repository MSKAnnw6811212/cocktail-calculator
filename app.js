/* app.js - Pixel & Pour Cocktail Calculator (International) v2.2 */

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// -- DOM Elements --
const q = $('#q'); // Input field
const recipeList = $('#recipeList'); // Datalist
const base = $('#base');
const units = $('#units');
const langSelect = $('#langSelect'); 
const pantryBox = $('#pantry');
const clearPantryBtn = $('#clearPantry'); // NEW
const results = $('#results');
const scaleMode = $('#scaleMode');
const scaleValue = $('#scaleValue');
const scaleLabel = $('#scaleLabel');
const themeToggle = $('#themeToggle');
const bbTable = $('#bbTable tbody');
const bbList = $('#bbList');
const includeGarnish = $('#includeGarnish');
const roundBottles = $('#roundBottles');

// -- State --
let RECIPES = [];
let SUBS = {};
let GENERICS = {};
const selected = new Set();
const barBack = new Map();
let CURRENT_LANG = 'en'; // Default

// -- Dictionary for Translations --
const DICT = {
    ui: {
        en: { 
            servings: "Servings", target_ml: "Target ml (total)", 
            search_ph: "Type to search or browse...", base_all: "All Bases",
            add_sheet: "+ Shopping List", glass: "Glass", method: "Method", ingredients: "Ingredients"
        },
        de: { 
            servings: "Portionen", target_ml: "Zielmenge (ml)", 
            search_ph: "Tippen zum Suchen...", base_all: "Alle Basen",
            add_sheet: "+ Einkaufsliste", glass: "Glas", method: "Methode", ingredients: "Zutaten"
        }
    },
    ing: {
        "Zitronensaft": "Lemon Juice", "Limettensaft": "Lime Juice", "Zuckersirup": "Sugar Syrup",
        "Sodawasser": "Soda Water", "Weißer Rum": "White Rum", "Dunkler Rum": "Dark Rum",
        "Minze": "Mint", "Mandelsirup": "Orgeat", "Cranberrysaft": "Cranberry Juice",
        "Sahne": "Cream", "Milch": "Milk", "Ananassaft": "Pineapple Juice",
        "Kokosnusscreme": "Coconut Cream", "Eiweiß": "Egg White", "Kaffeelikör": "Coffee Liqueur",
        "Weißer Rohrzucker": "White Cane Sugar", "Limette": "Lime", "Ingwerbier": "Ginger Beer",
        "Wodka": "Vodka", "Orangensaft": "Orange Juice", "Tomatensaft": "Tomato Juice",
        "Staudensellerie": "Celery", "Worcestershiresauce": "Worcestershire Sauce",
        "Pfeffer": "Pepper", "Salz": "Salt", "Zitrone": "Lemon", "Brauner Rum": "Aged Rum",
        "Cola": "Cola", "Tonic Water": "Tonic Water", "Schaumwein": "Sparkling Wine",
        "Pfirsichpüree": "Peach Puree", "Aperol": "Aperol", "Prosecco": "Prosecco",
        "Cachaça": "Cachaça", "Grapefruit Soda": "Grapefruit Soda"
    }
};

// -- Theme Init --
const savedTheme = localStorage.getItem('pp_theme');
if(savedTheme === 'dark') document.body.classList.add('dark');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('pp_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// -- 1. Data Loading --
async function initData() {
  try {
    const [rRes, sRes] = await Promise.all([
      fetch('./data/cocktails.json'),
      fetch('./data/substitutions.json')
    ]);
    
    if(!rRes.ok || !sRes.ok) throw new Error("Failed to load data files");

    const rData = await rRes.json();
    const sData = await sRes.json();

    RECIPES = rData.recipes;
    SUBS = sData.substitutions;
    GENERICS = sData.generic_families;

    populateDatalist();
    renderPantry();
    render();
    renderBarBack();
  } catch (err) {
    console.error(err);
    results.innerHTML = `<div class="card" style="color:var(--fail); padding:20px;">Error Loading Data. Check console.</div>`;
  }
}

// -- Helpers --
function t(key, type='ui') {
    if (CURRENT_LANG === 'de') return DICT[type].de[key] || key;
    if (type === 'ing') return DICT.ing[key] || key; 
    return DICT.ui.en[key] || key; 
}

function getGlassIcon(glassType) {
    const g = (glassType || "").toLowerCase();
    if(g.includes('martini') || g.includes('coupe')) return '🍸';
    if(g.includes('tumbler') || g.includes('rocks') || g.includes('fashion')) return '🥃';
    if(g.includes('long') || g.includes('highball') || g.includes('collins')) return '🥤';
    if(g.includes('mule') || g.includes('mug')) return '🍺';
    if(g.includes('flute') || g.includes('sekt')) return '🥂';
    if(g.includes('wine')) return '🍷';
    return '🍹';
}

function typeOf(name) {
  const n = name.toLowerCase();
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

function scaledMl(ml) {
  const n = Math.max(0.1, Number(scaleValue.value || 1));
  return ml * n;
}

function matchesSelection(ingName) {
  if (selected.has(ingName)) return true;
  // Check substitutions
  const sub = SUBS[ingName];
  if (sub && sub.some(s => selected.has(s))) return true;
  // Check generic families
  for (const [label, pattern] of Object.entries(GENERICS)) {
    if (!selected.has(label)) continue;
    try {
      if (new RegExp(pattern, 'i').test(ingName)) return true;
    } catch (e) { }
  }
  return false;
}

function makeable(r) {
  if (selected.size === 0) return true; // If pantry is empty, show everything
  // Otherwise, strict match: MUST have all non-optional ingredients
  return r.ingredients.every(i => i.optional || matchesSelection(i.name));
}

// -- Rendering --
function populateDatalist() {
    const bv = base.value;
    const filteredRecipes = RECIPES.filter(r => 
        bv === 'All' || (r.base && r.base.includes(bv))
    );
    const opts = filteredRecipes.map(r => `<option value="${r.name}"></option>`).sort();
    recipeList.innerHTML = opts.join('');
}

function renderPantry() {
  const allIngredients = Array.from(new Set(RECIPES.flatMap(r => r.ingredients.map(i => i.name)))).sort();
  const groups = { Spirit: [], Liqueur: [], 'Wine/Bubbly': [], 'Mixer/NA': [] };
  
  for (const ing of allIngredients) {
    const type = typeOf(ing);
    if(groups[type]) groups[type].push(ing); else groups['Mixer/NA'].push(ing);
  }
  // Add Generics
  for (const label of Object.keys(GENERICS)) {
      const type = typeOf(label);
      if(groups[type]) groups[type].push(label);
  }

  pantryBox.innerHTML = Object.entries(groups).map(([g, list]) => {
    if(list.length === 0) return '';
    const uniqueList = [...new Set(list)].sort();
    return `<div class="card" style="break-inside: avoid;"><strong>${g}</strong><div style="display:flex;flex-direction:column;gap:4px;margin-top:4px;">` +
      uniqueList.map(name => {
         const isChecked = selected.has(name) ? 'checked' : '';
         return `<label><input type="checkbox" value="${name}" ${isChecked}> ${t(name, 'ing')}</label>`;
      }).join('') +
      `</div></div>`;
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
  
  scaleLabel.textContent = scaleMode.value === 'servings' ? t('servings') : t('target_ml');
  q.placeholder = t('search_ph');

  let list = RECIPES.filter(r => 
    (bv === 'All' || (r.base && r.base.includes(bv))) &&
    (qv === '' || r.name.toLowerCase().includes(qv)) &&
    makeable(r)
  );

  if(list.length === 0) {
      results.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--muted);">
        <h3>No matches found</h3>
        <p>Try adding more ingredients to your pantry (Sugar, Lemon, etc.) or clearing the selection.</p>
      </div>`;
      return;
  }

  results.innerHTML = list.map(r => {
    const ings = r.ingredients.map(i => {
      const ml = scaledMl(i.qtyMl || 0);
      const [v, u] = convertQty(ml);
      const label = i.label ? ` <span style="font-size:0.9em;color:var(--muted)">(${i.label})</span>` : '';
      const top = i.top ? ' (top up)' : '';
      const name = t(i.name, 'ing'); 
      const qtyDisplay = i.qtyMl ? `<span class="qty">${v} ${u}</span>` : '—';
      
      // Highlight missing ingredients if pantry is active
      const isMissing = selected.size > 0 && !i.optional && !matchesSelection(i.name);
      const style = isMissing ? 'color:var(--fail); font-weight:bold;' : '';
      const missingIcon = isMissing ? ' ⚠️' : '';

      return `<div style="${style}">${qtyDisplay} ${name}${label}${top}${missingIcon}</div>`;
    }).join('');

    const icon = getGlassIcon(r.glass);

    return `<article class="recipe">
      <div style="display:flex;justify-content:space-between;align-items:start;">
        <h3 style="margin:0;">${icon} ${r.name}</h3>
      </div>
      <div class="meta">${t('method')}: ${r.method} • ${t('glass')}: ${r.glass}</div>
      <div class="ingredients" style="margin:10px 0;padding:12px;background:var(--bg);border-radius:8px;">${ings}</div>
      <div style="font-style:italic;font-size:14px;margin-bottom:10px;line-height:1.5;">${r.instructions}</div>
      <div style="margin-top:auto;">
        <button class="primary" data-add="${r.id}">${t('add_sheet')}</button>
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
      if (!ing.qtyMl) continue;
      const totalMl = ing.qtyMl * servings;
      totals.set(ing.name, (totals.get(ing.name) || 0) + totalMl);
    }
  }

  bbTable.innerHTML = "";
  Array.from(totals.entries()).sort().forEach(([name, ml]) => {
    let mlDisplay = "";
    if (roundBottles.checked) {
        const btls = Math.ceil(ml / 750);
        mlDisplay = `<strong>${btls}</strong> x 750ml btls`;
    } else {
        mlDisplay = `${Math.round(ml)} ml`;
    }
    const cl = (ml / 10).toFixed(1);
    const oz = (ml / 29.57).toFixed(1);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t(name, 'ing')}</td><td>${mlDisplay}</td><td>${cl} cl / ${oz} oz</td>`;
    bbTable.appendChild(tr);
  });
}

// -- Listeners --
q.addEventListener('input', render);
base.addEventListener('change', () => { q.value = ""; populateDatalist(); render(); });
units.addEventListener('change', render);
scaleMode.addEventListener('change', render);
scaleValue.addEventListener('input', render);
langSelect.addEventListener('change', () => { CURRENT_LANG = langSelect.value; renderPantry(); render(); renderBarBack(); });
includeGarnish.addEventListener('change', renderBarBack);
roundBottles.addEventListener('change', renderBarBack);

// NEW: Clear Pantry Listener
clearPantryBtn.addEventListener('click', () => {
    selected.clear();
    // Uncheck all checkboxes visually
    $$('#pantry input[type="checkbox"]').forEach(box => box.checked = false);
    render();
});

initData();
