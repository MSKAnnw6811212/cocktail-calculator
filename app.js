/* app.js - Pixel & Pour Cocktail Calculator (v19.0 - Content Expansion) */

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

// -- ENGLISH SOURCE CONSTANTS --
const ESSENTIALS = ["Ice Cubes", "Sugar", "Salt", "Lime", "Lemon", "Orange", "Mint", "Olives", "Cherry", "Pepper", "Nutmeg"];
const HIDDEN_SPECIFICS = [
    "Bourbon Whiskey", "Rye Whiskey", "Canadian Whisky", "Scotch Whisky",
    "White Rum", "Dark Rum", "Aged Rum", 
    "Dry Vermouth", "Sweet Vermouth", "Triple Sec", "Cointreau"
];

// -- TRANSLATION DICTIONARY (English -> German Only) --
const DICT = {
    // UI Labels
    ui: {
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
    },
    // Ingredients & Data
    ing: {
        "Ice Cubes": "Eiswürfel", "Crushed Ice": "Crushed Ice", "Sugar": "Zucker", "Salt": "Salz", "Pepper": "Pfeffer", "Nutmeg": "Muskatnuss",
        "Lime": "Limette", "Lemon": "Zitrone", "Orange": "Orange", "Mint": "Minze", "Olives": "Oliven", "Cherry": "Kirsche", "Strawberries": "Erdbeeren", "Vanilla Ice Cream": "Vanilleeis", "Celery": "Staudensellerie",
        "Gin": "Gin", "Sloe Gin": "Schlehenlikör (Sloe Gin)", "Rum (Any)": "Rum (Alle)", "Whiskey (Any)": "Whiskey (Alle)", "Vodka": "Wodka", "Tequila": "Tequila",
        "Cachaça": "Cachaça", "Cognac": "Cognac", "Brandy": "Brandy", "Pisco": "Pisco", "Calvados": "Calvados",
        "Coffee Liqueur": "Kaffeelikör", "Campari": "Campari", "Aperol": "Aperol", "Amaretto": "Amaretto", "Galliano": "Galliano", "Bénédictine": "Bénédictine",
        "Maraschino": "Maraschino", "Cream Liqueur": "Sahnelikör", "Triple Sec": "Triple Sec", "White Crème de Cacao": "Creme de Cacao (Weiß)", "Brown Crème de Cacao": "Creme de Cacao (Braun)",
        "Prosecco": "Prosecco", "Champagne": "Champagner", "Red Wine": "Rotwein", "White Wine": "Weißwein", "Sparkling Wine": "Schaumwein", "Guinness": "Guinness",
        "Vermouth": "Wermut", "Dry Vermouth": "Wermut Trocken", "Sweet Vermouth": "Wermut Rot", "Sherry": "Sherry", "Port": "Portwein",
        "Lemon Juice": "Zitronensaft", "Lime Juice": "Limettensaft", "Orange Juice": "Orangensaft",
        "Pineapple Juice": "Ananassaft", "Cranberry Juice": "Cranberrysaft", "Tomato Juice": "Tomatensaft",
        "Grapefruit Soda": "Grapefruit Soda", "Cola": "Cola", "Soda Water": "Sodawasser", "Tonic Water": "Tonic Water",
        "Ginger Beer": "Ingwerbier", "Ginger Ale": "Ginger Ale",
        "Sugar Syrup": "Zuckersirup", "Orgeat": "Mandelsirup", "Grenadine": "Grenadine", "Honey Syrup": "Honigsirup", "Coconut Syrup": "Kokossirup",
        "Cream": "Sahne", "Milk": "Milch", "Coconut Cream": "Kokosnusscreme",
        "Egg White": "Eiweiß", "Egg Yolk": "Eigelb", "Worcestershire Sauce": "Worcestershiresauce", "Angostura Bitters": "Angostura Bitters",
        "Peach Puree": "Pfirsichpüree",
        "Bourbon Whiskey": "Bourbon Whiskey", "Rye Whiskey": "Rye Whiskey", "White Rum": "Weißer Rum", "Dark Rum": "Dunkler Rum", "Aged Rum": "Brauner Rum",
        "White Cane Sugar": "Weißer Rohrzucker", "Apricot Brandy": "Apricot Brandy", "Grand Marnier": "Grand Marnier", "Blue Curaçao": "Blue Curaçao",

        // Methods & Glass
        "Stir": "Rühren", "Shake": "Schütteln", "Build": "Bauen", "Muddle": "Zerstoßen", 
        "Shake + top": "Schütteln + Auffüllen", "Blend/Shake": "Mixen/Schütteln", "Roll/Stir": "Rollen/Rühren", "Blend": "Mixen",
        "Tumbler": "Tumbler", "Martini": "Martini-Glas", "Coupe": "Schale", "Highball": "Highball-Glas",
        "Longdrink": "Longdrink-Glas", "Mule Mug": "Kupferbecher", "Wine Glass": "Weinglas", "Flute": "Sektflöte", "Julep Cup": "Julep-Becher",

        // Instructions
        "Stir ingredients with ice. Strain over fresh ice. Garnish with orange.": "Auf Eis rühren. Auf frisches Eis abseihen. Mit Orange garnieren.",
        "Stir with ice. Strain into chilled glass. Garnish with olive.": "Auf Eis rühren. In gekühltes Glas abseihen. Mit Olive garnieren.",
        "Shake with ice. Fine strain.": "Mit Eis schütteln. Fein abseihen.",
        "Shake with ice. Strain into salt-rimmed glass.": "Mit Eis schütteln. In Glas mit Salzrand abseihen.",
        "Build over ice. Float cream.": "Auf Eis bauen. Sahne vorsichtig darüberschichten (floaten).",
        "Build in glass over ice. Stir.": "Im Glas auf Eis bauen. Umrühren.",
        "Shake hard. Strain.": "Kräftig schütteln. Abseihen.",
        "Muddle mint gently. Add ingredients and ice. Top with soda.": "Minze andrücken. Zutaten & Eis dazu. Mit Soda toppen.",
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
        "Build in glass over ice. Garnish with lime wedge.": "Im Glas auf Eis bauen. Mit Limettenschnitz garnieren.",
        "Stir with ice until very cold. Strain into chilled glass. Garnish with lemon twist or olive.": "Kalt rühren. In gekühltes Glas abseihen. Mit Zitrone/Olive garnieren.",
        "Dry shake (no ice) first, then shake with ice. Strain over fresh ice.": "Erst ohne Eis schütteln (Dry Shake), dann mit Eis. Abseihen.",
        "Shake hard with ice to create foam. Strain into chilled glass.": "Kräftig auf Eis schütteln (für Schaum). In gekühltes Glas abseihen.",
        "Build in glass over ice. Stir gently. Garnish with orange slice.": "Im Glas auf Eis bauen. Sanft rühren. Mit Orange garnieren.",
        "Stir with ice. Strain into chilled glass. Garnish with cherry.": "Auf Eis rühren. In gekühltes Glas abseihen. Mit Kirsche garnieren.",
        "Muddle mint gently. Add ingredients and ice. Top with soda.": "Minze sanft andrücken. Zutaten & Eis dazu. Mit Soda toppen.",
        "Build in mug over ice. Top with Ginger Beer.": "Im Becher auf Eis bauen. Mit Ginger Beer auffüllen.",
        "Fill glass with ice. Add Prosecco, then Aperol, then Soda.": "Glas mit Eis füllen. Prosecco, dann Aperol, dann Soda.",
        "Stir gently with ice. Garnish with celery stick.": "Sanft auf Eis rühren. Mit Selleriestange garnieren.",
        "Shake with ice. Strain into chilled glass.": "Auf Eis schütteln. In gekühltes Glas abseihen.",
        "Shake (except soda). Strain onto ice. Top with soda.": "Schütteln (außer Soda). Auf Eis abseihen. Mit Soda toppen.",
        "Shake hard. Pour unstrained into glass.": "Kräftig schütteln. Ungeseiht ins Glas gießen.",
        "Shake hard or blend with crushed ice.": "Kräftig schütteln oder blenden.",
        "Build in glass over ice. Garnish with lime wedge.": "Im Glas auf Eis bauen. Mit Limette garnieren.",
        "Muddle lime chunks and sugar. Add ice and Cachaça. Stir.": "Limette & Zucker zerstoßen. Eis & Cachaça dazu. Rühren.",
        "Shake (no soda). Strain into glass (no ice). Top with soda.": "Schütteln (ohne Soda). Ins Glas (ohne Eis) abseihen. Mit Soda toppen.",
        "Build vodka and liqueur over ice. Float cream on top.": "Wodka & Likör auf Eis bauen. Sahne darüberschichten.",
        "Pour puree into glass. Top gently with Prosecco.": "Püree ins Glas. Vorsichtig mit Prosecco auffüllen.",
        "Shake first 3 ingredients. Strain into flute. Top with Champagne.": "Erste 3 Zutaten schütteln. In Flöte abseihen. Mit Champagner toppen.",
        "Build in glass with ice. Stir.": "Im Glas auf Eis bauen. Rühren.",
        "Muddle mint gently. Fill cup with crushed ice. Add bourbon. Stir until cup frosts.": "Minze sanft andrücken. Becher mit Crushed Ice füllen. Bourbon dazu. Rühren bis beschlagen.",
        "Build tequila and juice. Sink grenadine to bottom.": "Tequila & Saft bauen. Grenadine hineinsinken lassen.",
        "Shake all spirits/sour. Strain into ice-filled glass. Top with Cola.": "Alles (außer Cola) schütteln. Auf Eis abseihen. Mit Cola toppen.",
        "Build over ice. Garnish with cherry.": "Auf Eis bauen. Mit Kirsche garnieren.",
        "Build in glass over ice. Garnish with orange slice.": "Im Glas auf Eis bauen. Mit Orangenscheibe garnieren.",
        "Shake with ice. Strain. Garnish with nutmeg.": "Auf Eis schütteln. Abseihen. Mit Muskatnuss garnieren.",
        "Soak sugar cube in bitters. Drop into flute. Top with Champagne.": "Zuckerwürfel in Bitter tränken. Ins Glas geben. Mit Champagner auffüllen.",
        "Fill half with Champagne, top with Guinness.": "Halb mit Champagner füllen, mit Guinness toppen.",
        "Build in glass (or silver cup). Top with Champagne.": "Im Glas (oder Silberbecher) bauen. Mit Champagner toppen.",
        "Shake (except Champagne). Strain into flute. Top with Champagne.": "Schütteln (außer Champagner). In Flöte abseihen. Mit Champagner toppen.",
        "Shake with ice. Strain. Garnish with nutmeg.": "Auf Eis schütteln. Abseihen. Mit Muskatnuss garnieren.",
        "Shake (except soda). Strain into glass. Top with soda.": "Schütteln (außer Soda). Ins Glas abseihen. Mit Soda toppen.",
        "Shake with ice. Strain into ice-filled glass.": "Auf Eis schütteln. In eisgefülltes Glas abseihen.",
        "Build vodka and juice over ice. Float Galliano on top.": "Wodka & Saft auf Eis bauen. Galliano darüberschichten.",
        "Shake hard or blend. Pour into glass over crushed ice.": "Kräftig schütteln oder blenden. Auf Crushed Ice gießen.",
        "Build in glass over ice. Top with Ginger Ale or Lemonade.": "Im Glas auf Eis bauen. Mit Ginger Ale oder Limonade toppen.",
        "Rim glass with salt. Build ingredients over ice.": "Glasrand mit Salz versehen. Zutaten auf Eis bauen.",
        "Build in glass over ice.": "Im Glas auf Eis bauen.",
        "Blend with crushed ice.": "Mit Crushed Ice blenden.",
        "Shake with ice. Pour into large glass.": "Auf Eis schütteln. In großes Glas gießen.",
        "Shake hard with ice. Pour unstrained into large glass.": "Kräftig auf Eis schütteln. Ungeseiht in großes Glas gießen.",
        "Build over ice. Squeeze lime wedge. Top with Ginger Ale.": "Auf Eis bauen. Limette auspressen. Mit Ginger Ale toppen.",
        "Shake with ice. Strain over fresh ice.": "Auf Eis schütteln. Auf frisches Eis abseihen.",
        "Build in glass (or snifter). No ice.": "Im Glas (oder Schwenker) bauen. Kein Eis.",
        "Shake with ice. Strain into sugar-rimmed glass.": "Auf Eis schütteln. In Glas mit Zuckerrand abseihen.",
        "Shake hard with ice. Strain into glass. Garnish with nutmeg.": "Kräftig auf Eis schütteln. Ins Glas abseihen. Mit Muskatnuss garnieren.",
        "Shake hard with ice. Strain. Top with bitters.": "Kräftig auf Eis schütteln. Abseihen. Mit Bitters toppen.",
        "Shake hard with ice. Strain. Garnish with nutmeg.": "Kräftig auf Eis schütteln. Abseihen. Mit Muskatnuss garnieren.",
        // --- New Additions (Batch A & B) ---
        "A & A Riesling Liqueur": "A & A Riesling Likör",
        "Cider": "Apfelwein (Cider)",
        "Pear Brandy": "Birnenbrand",
        "Peach Liqueur": "Pfirsichlikör",
        "Dubonnet Rouge": "Dubonnet Rouge",
        "Orange Bitters": "Orange Bitters",
        "Pastis": "Pastis",
        "Passion Fruit Nectar": "Maracujanektar",
        "White Crème de Menthe": "Pfefferminzlikör (weiß)",
        "Cherry Brandy": "Kirschbrandy",
        "Bitter Lemon": "Bitter Lemon",
        "Apple Juice": "Apfelsaft",
        "Lime Syrup": "Limettensirup",
        "Consommé": "Rinderkraftbrühe",
        "Celery Salt": "Selleriesalz",
        "Tabasco": "Tabasco",
        "Guinness": "Guinness",
        "Crème de Bananes": "Bananenlikör",
        "Banana Nectar": "Bananennektar",
        "Banana": "Banane",
        "Strawberry Liqueur": "Erdbeerlikör",
        "Strawberry Syrup": "Erdbeersirup",
        "Melon Liqueur": "Melonenlikör",
        "Mango Syrup": "Mangosirup",
        "Coconut Liqueur": "Kokoslikör",
        "Cranberry Syrup": "Cranberrysirup",
        "Vanilla Syrup": "Vanillesirup",
        "Raspberry Liqueur": "Himbeerlikör",
        "Blackberry": "Brombeere",
        "Raspberry": "Himbeere",
        "Kumquat": "Kumquat",
        "Brown Sugar": "Brauner Zucker",
        "Cloves": "Nelken",
        "Cinnamon Stick": "Zimtstange",
        "Hot Water": "Heißes Wasser",
        "Hot Coffee": "Heißer Kaffee",
        "Chocolate Shavings": "Schokoladenraspel",
        "Egg Yolk": "Eigelb",
        "Overproof Rum": "Rum (73%)",
        "Galliano": "Galliano",
        "Bénédictine": "Bénédictine",
        "Sloe Gin": "Schlehenlikör (Sloe Gin)",
        "Apricot Brandy": "Apricot Brandy",
        "Grand Marnier": "Grand Marnier",
        "Blue Curaçao": "Blue Curaçao",
        "Fino Sherry": "Fino Sherry",
        "Cream Sherry": "Cream Sherry",
        // --- Batch C Additions ---
        "Raspberry Liqueur": "Himbeerlikör",
        "Blackberries": "Brombeeren",
        "Raspberries": "Himbeeren",
        "Passion Fruit Liqueur": "Passoã (Maracujalikör)",
        "Spiced Rum": "Spiced Rum",
        "Vanilla Syrup": "Vanillesirup",
        "Mango Syrup": "Mangosirup",
        "Lemonade": "Zitronenlimonade (klar)",
        "Kumquats": "Kumquats",
        "Brown Sugar": "Brauner Zucker",
        "Lime Juice Cordial": "Lime Juice Cordial (z.B. Rose's)",
        "Orange Vodka": "Orangen-Wodka",
        "Vanilla Vodka": "Vanille-Wodka",
        "Banana Nectar": "Bananennektar",
        "Raki": "Raki",
        "Melon Liqueur": "Melonenlikör",
        "Ginger": "Ingwer",
        "Cucumber": "Gurke",
        // --- Batch D Additions ---
        "Goldwasser": "Danziger Goldwasser",
        "Peach Bitters": "Pfirsich-Bitter",
        "Cold Black Tea": "Kalter Schwarztee",
        "Genever": "Genever",
        "Curacao Orange": "Curaçao Orange",
        // --- Batch E Additions ---
        "Creme de Violette": "Veilchenlikör (Crème de Violette)",
        "Absinthe": "Absinth",
        "Dry Orange Curaçao": "Orange Curaçao (Trocken)",
        "Chocolate Liqueur": "Schokoladenlikör",
        "Anisette": "Anislikör",
        "Orange Liqueur": "Orangenlikör",
        // --- Batch F Additions ---
        "Grappa": "Grappa",
        "Fernet Branca": "Fernet Branca",
        "Apple Schnapps": "Apfelkorn/Apfelschnaps",
        "Pousse-Café": "Pousse-Café (geschichtet)",
        "Kirschwasser": "Kirschwasser",
        "Sweet Sherry": "Süßer Sherry (Cream)",
        "Pernod": "Pernod",
        // --- Batch G Additions ---
        "Pearl Onion": "Silberzwiebel",
        "Green Crème de Menthe": "Pfefferminzlikör (Grün)",
        "Grapefruit": "Grapefruit",
        "Water": "Wasser",
        "Kummel": "Kümmellikör",
        "Yellow Chartreuse": "Chartreuse Gelb",
        // --- Batch H Additions ---
        "Butter": "Butter",
        "Honey": "Honig",
        // --- Batch I & J Additions ---
        "Irish Whiskey": "Irischer Whiskey",
        "Midori": "Melonenlikör (Midori)",
        "Green Chartreuse": "Chartreuse Grün",
        // --- Batch K & L Additions ---
        "Hazelnut Schnapps": "Haselnussgeist",
        "Kahlúa": "Kahlúa (Kaffeelikör)",
        "Raspberry Syrup": "Himbeersirup",
        "Citron Vodka": "Zitronen-Wodka",
        "Tennessee Whiskey": "Tennessee Whiskey (z.B. Jack Daniel's)",
        "Chocolate Milk": "Kakao (Kalt)",
        "Cherry Juice": "Kirschsaft"
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
    // If Language is English, return strict English (Source)
    if (CURRENT_LANG === 'en') return key;

    // If Language is German, look up in Dictionary
    if (type === 'ing') return DICT.ing[key] || key;
    if (type === 'ui') return DICT.ui[key] || key;
    
    return key;
}

// UI LABELS (Original English Defaults)
const UI_EN = {
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
};

function updateStaticLabels() {
    // If English, use UI_EN. If German, use DICT.ui
    const labels = CURRENT_LANG === 'en' ? UI_EN : DICT.ui;
    
    $$('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(labels[key]) el.textContent = labels[key];
    });
    q.placeholder = labels['search_ph'];
    scaleLabel.textContent = scaleMode.value === 'servings' ? labels['servings_label'] : labels['target_label'];
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
  
  if(ESSENTIALS.map(e=>e.toLowerCase()).includes(n)) return 'Essentials';
  
  // FIX: Ginger Ale is NOT a Spirit (Must check before Spirit check)
  if (n.includes('ginger') || n.includes('ale') || n.includes('beer')) return 'Mixer/NA';

  if (/gin|wodka|vodka|rum|whisk|bourbon|rye|tequila|cognac|brandy|cachaça/.test(n)) return 'Spirit';
  if (/vermouth|wermut|sherry|porto|aperitif|campari|amaro|liqueur|likör|sec|cointreau|kahlua/.test(n)) return 'Liqueur';
  if (/wine|wein|champagner|sekt|prosecco|sparkling/.test(n)) return 'Wine/Bubbly';
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
  // Categories are always keys for UI dict
  const catKeys = { 'Essentials': 'cat_essentials', 'Spirit': 'cat_spirit', 'Liqueur': 'cat_liqueur', 'Wine/Bubbly': 'cat_wine_bubbly', 'Mixer/NA': 'cat_mixer_na' };

  pantryBox.innerHTML = order.map(g => {
    const list = groups[g];
    if(!list || list.length === 0) return '';
    
    // Get Title based on Lang
    const labels = CURRENT_LANG === 'en' ? UI_EN : DICT.ui;
    const title = labels[catKeys[g]]; 
    
    return `<div class="pantry-group"><strong>${title}</strong><div class="pantry-grid">` +
      [...new Set(list)].sort().map(name => {
         const isChecked = selected.has(name) ? 'checked' : '';
         // Translate Ingredient Label only if DE
         const labelText = t(name, 'ing');
         return `<label class="pantry-item"><input type="checkbox" value="${name}" ${isChecked}> ${labelText}</label>`;
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

  const labels = CURRENT_LANG === 'en' ? UI_EN : DICT.ui;

  const isDefaultFilters = qv === "" && bv === "All" && selected.size === 0;
  if(isDefaultFilters) {
      results.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--muted);">
        <h2 style="color:var(--txt); margin-bottom:10px;">${labels['welcome_head']}</h2>
        <p>${labels['welcome_text']}</p>
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
        ? `<div class="status-bar ok">✅ ${labels['lbl_makeable']}</div>` 
        : (selected.size > 0 ? `<div class="status-bar missing">${labels['lbl_missing']} ${missing.length} ${labels['lbl_item_s']}</div>` : '');

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
      <div class="meta">${labels['lbl_method']}: ${t(r.method, 'ing')} • ${labels['lbl_glass']}: ${t(r.glass, 'ing')}</div>
      <div class="ingredients" style="margin:10px 0;padding:12px;background:var(--bg);border-radius:8px;">${ings}</div>
      <div style="font-style:italic;font-size:14px;margin-bottom:10px;line-height:1.5;">${t(r.instructions, 'ing')}</div>
      <div style="margin-top:auto;">
        <button class="primary" data-add="${r.id}">${labels['btn_add_sheet']}</button>
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
    const labels = CURRENT_LANG === 'en' ? UI_EN : DICT.ui;
    
    if (data.ml > 0) {
        if (roundBottles.checked) {
            const btls = Math.ceil(data.ml / 750);
            mlDisplay = `<strong>${btls}</strong> x 750ml btls`;
        } else {
            mlDisplay = `${Math.round(data.ml)} ml`;
        }
    } else {
        mlDisplay = `<span style="color:var(--muted);">${labels['qty_count']}</span>`;
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










