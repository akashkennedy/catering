/**
 * Static English → Tamil dictionary for common catering ingredients.
 * Lookup is case-insensitive (keys are lowercased).
 * Add new entries at the bottom of the relevant category.
 */

import { INGREDIENT_CATALOG } from "./ingredientCatalog";
import type { IngredientTag } from "./ingredientTags";

export const ingredientTranslations: Record<string, string> = {
  // Grains & staples
  "rice": "அரிசி",
  "basmati rice": "பாஸ்மதி அரிசி",
  "jeera rice": "சீரக சாதம்",
  "boiled rice": "புழுங்கல் அரிசி",
  "raw rice": "பச்சரிசி",
  "wheat flour": "கோதுமை மாவு",
  "maida": "மைதா",
  "rava": "ரவை",
  "sooji": "சூஜி",
  "vermicelli": "சேமியா",
  "poha": "அவல்",
  "oats": "ஓட்ஸ்",
  "corn flour": "சோள மாவு",
  "gram flour": "கடலை மாவு",
  "rice flour": "அரிசி மாவு",

  // Lentils & legumes
  "toor dal": "துவரம் பருப்பு",
  "moong dal": "பாசிப்பருப்பு",
  "chana dal": "கடலைப்பருப்பு",
  "masoor dal": "மசூர் பருப்பு",
  "urad dal": "உளுந்தம் பருப்பு",
  "rajma": "ராஜ்மா",
  "black eyed peas": "லோபியா",
  "chickpeas": "கடலை",
  "green gram": "பாசிப்பருப்பு",
  "black gram": "கருப்பு உளுந்து",
  "peanut": "நிலக்கடலை",
  "peanuts": "நிலக்கடலை",

  // Vegetables
  "onion": "வெங்காயம்",
  "onions": "வெங்காயம்",
  "tomato": "தக்காளி",
  "tomatoes": "தக்காளி",
  "potato": "உருளைக்கிழங்கு",
  "carrot": "கேரட்",
  "beans": "பீன்ஸ்",
  "peas": "பட்டாணி",
  "green peas": "பச்சை பட்டாணி",
  "cauliflower": "காலிஃப்ளவர்",
  "cabbage": "முட்டைக்கோஸ்",
  "brinjal": "கத்திரிக்காய்",
  "ladies finger": "வெண்டைக்காய்",
  "okra": "வெண்டைக்காய்",
  "bottle gourd": "சுரைக்காய்",
  "ridge gourd": "புடலங்காய்",
  "bitter gourd": "பாகற்காய்",
  "drumstick": "முருங்கைக்காய்",
  "spinach": "கீரை",
  "coriander leaves": "கொத்தமல்லி",
  "mint leaves": "புதினா",
  "curry leaves": "கறிவேப்பிலை",
  "green chili": "பச்சை மிளகாய்",
  "green chilies": "பச்சை மிளகாய்",
  "ginger": "இஞ்சி",
  "garlic": "பூண்டு",
  "garlic cloves": "பூண்டு பற்கள்",
  "coconut": "தேங்காய்",
  "coconut pieces": "தேங்காய் துண்டுகள்",
  "banana": "வாழைப்பழம்",
  "raw banana": "வாழைக்காய்",
  "plantain": "வாழைக்காய்",
  "mushroom": "காளான்",
  "corn": "சோளம்",
  "beetroot": "பீட்ரூட்",
  "ash gourd": "பூசணிக்காய்",
  "pumpkin": "பூசணிக்காய்",
  "spring onion": "வெங்காயத் தழை",
  "spring onions": "வெங்காயத் தழை",
  "green onion": "பச்சை வெங்காயம்",
  "fenugreek leaves": "வெந்தயக்கீரை",

  // Spices & seasonings
  "salt": "உப்பு",
  "red chili powder": "மிளகாய் தூள்",
  "turmeric powder": "மஞ்சள் தூள்",
  "coriander powder": "மல்லித்தூள்",
  "cumin powder": "சீரகத்தூள்",
  "garam masala": "கரம் மசாலா",
  "chili powder": "மிளகாய் தூள்",
  "black pepper": "கருமிளகு",
  "pepper powder": "மிளகு தூள்",
  "cumin seeds": "சீரகம்",
  "mustard seeds": "கடுகு",
  "turmeric": "மஞ்சள்",
  "red chili": "காய்ந்த மிளகாய்",
  "red chilies": "காய்ந்த மிளகாய்",
  "asafoetida": "பெருங்காயம்",
  "hing": "பெருங்காயம்",
  "fenugreek": "வெந்தயம்",
  "cardamom": "ஏலக்காய்",
  "cloves": "கிராம்பு",
  "cinnamon": "இலவங்கப்பட்டை",
  "star anise": "நட்சத்திர அன்னாசி",
  "bay leaf": "பிரிஞ்சிலை",
  "fennel seeds": "சோம்பு",
  "tamarind": "புளி",
  "lemon": "எலுமிச்சை",
  "lime": "சுண்ணாம்பு எலுமிச்சை",
  "vinegar": "வினிகர்",
  "black salt": "கருப்பு உப்பு",
  "rock salt": "கல் உப்பு",
  "sugar": "சர்க்கரை",
  "jaggery": "வெல்லம்",
  "honey": "தேன்",

  // Oil & fats
  "oil": "எண்ணெய்",
  "coconut oil": "தேங்காய் எண்ணெய்",
  "sesame oil": "நல்லெண்ணெய்",
  "gingelly oil": "நல்லெண்ணெய்",
  "mustard oil": "கடுகு எண்ணெய்",
  "vegetable oil": "காய்கறி எண்ணெய்",
  "sunflower oil": "சூரியகாந்தி எண்ணெய்",
  "ghee": "நெய்",
  "butter": "வெண்ணெய்",

  // Dairy
  "milk": "பால்",
  "curd": "தயிர்",
  "yogurt": "தயிர்",
  "paneer": "பன்னீர்",
  "cream": "கிரீம்",
  "cottage cheese": "பாலாடைக்கட்டி",
  "condensed milk": "கெட்டிப் பால்",

  // Nuts & dried fruits
  "cashew": "முந்திரி",
  "cashews": "முந்திரி",
  "cashew nuts": "முந்திரி",
  "almond": "பாதாம்",
  "almonds": "பாதாம்",
  "raisins": "திராட்சை",
  "dry grapes": "திராட்சை",
  "walnut": "அக்ரூட் பருப்பு",

  // Pulses & prepared items
  "sambar powder": "சாம்பார் தூள்",
  "rasam powder": "ரசம் தூள்",
  "idli batter": "இட்லி மாவு",
  "dosa batter": "தோசை மாவு",

  // Flours & baking
  "besan": "கடலை மாவு",
  "maida flour": "மைதா மாவு",
  "semolina": "ரவை",
  "all purpose flour": "மைதா மாவு",
  "wheat": "கோதுமை",
  "baking soda": "சமையல் சோடா",
  "baking powder": "பேக்கிங் பவுடர்",

  // Miscellaneous
  "banana leaf": "வாழை இலை",
  "banana leaves": "வாழை இலைகள்",
  "food colour": "உணவு நிறம்",
  "food coloring": "உணவு நிறம்",
  "food color": "உணவு நிறம்",
  "water": "தண்ணீர்",
  "tea": "தேநீர்",
  "coffee": "காபி",
  "coffee powder": "காபி தூள்",
  "tea powder": "தேநீர் தூள்",
};

/**
 * Look up the Tamil name for an English ingredient name.
 * Returns undefined if no match is found (caller should fall back to manual entry).
 */
export function lookupTamilName(englishName: string): string | undefined {
  return lookupIngredient(englishName)?.tamilName;
}

export type IngredientSuggestion = {
  tamilName: string;
  tag: IngredientTag;
};

/**
 * Tanglish → Tamil aliases so typing a romanised Tamil word (e.g. "pallari",
 * "arisi", "venkayam") still auto-fills the Tamil name.
 */
const tanglishAliases: Record<string, string> = {
  arisi: "அரிசி",
  ari: "அரிசி",
  ponni: "பொன்னி அரிசி",
  ponny: "பொன்னி அரிசி",
  rawk: "பச்சரிசி",
  aval: "அவல்",
  ada: "அடை",
  pal: "பால்",
  thayir: "தயிர்",
  ennai: "எண்ணெய்",
  nallennai: "நல்லெண்ணெய்",
  thennai: "தேங்காய்",
  coconut: "தேங்காய்",
  ulli: "வெங்காயம்",
  venkayam: "வெங்காயம்",
  pallari: "பல்லரி",
  smallulli: "சின்ன உள்ளி",
  chinnaulli: "சின்ன உள்ளி",
  takkali: "தக்காளி",
  thakkali: "தக்காளி",
  urulaikizhangu: "உருளைக்கிழங்கு",
  urulai: "உருளை கிழங்கு",
  kilangu: "கிழங்கு",
  kathirikkai: "கத்திரிக்காய்",
  vendaikkai: "வெண்டைக்காய்",
  pavakkai: "பாவக்காய்",
  avarakkai: "அவரக்காய்",
  putalangkai: "புடலங்காய்",
  vazhudhana: "வழுதனங்காய்",
  murungaikkai: "முருங்கைக்காய்",
  vendhayam: "வெந்தயம்",
  venthayam: "வெந்தயம்",
  seeragam: "ஜீரகம்",
  jeeragam: "ஜீரகம்",
  manjal: "மஞ்சள்",
  milagai: "மிளகாய்",
  uppu: "உப்பு",
  sarkkarai: "சர்க்கரை",
  vellam: "வெல்லம்",
  kothamalli: "கொத்தமல்லி",
  malitthool: "மல்லித்தூள்",
  malitthooli: "மல்லி பொடி",
  karuvapillai: "கறிவேப்பிலை",
  karuvapilai: "கறிவேப்பிலை",
  pudhina: "புதினா",
  pudina: "புதினா",
  kozhi: "கோழி",
  koli: "கோழி",
  "nattu koli": "நாட்டு கோழி",
  maattu: "மட்டன்",
  meen: "மீன்",
  thengai: "தேங்காய்",
  vaazhaipazham: "வாழைப்பழம்",
  vaazhaikkai: "வாழைக்காய்",
  vazhaikkai: "வாழைக்காய்",
  "vazha ilai": "வாழ இலை",
  godhumai: "கோதுமை",
  maavu: "மாவு",
  mavu: "மாவு",
  "arisi mavu": "அரிசி மாவு",
  "kadala mavu": "கடலை மாவு",
  "thoor dal": "துவரம் பருப்பு",
  toordal: "துவரம் பருப்பு",
  paasi: "பாசிப்பருப்பு",
  uzhundu: "உளுந்து",
  ulundu: "உளுந்து",
  kadalai: "கடலை",
  ellumichai: "எலுமிச்சை",
  elumichai: "எலுமிச்சை",
  pachai: "பச்சை",
};

/** The full catalog gives us tuned English/tanglish → Tamil + tag suggestions. */
const catalogSuggestions = new Map<string, IngredientSuggestion>();

for (const item of INGREDIENT_CATALOG) {
  const key = item.name.trim().toLowerCase();
  if (!key || catalogSuggestions.has(key)) continue;
  catalogSuggestions.set(key, { tamilName: item.tamilName, tag: item.tag });
}

function normalizedKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DISH_TAMIL_MAP: Record<string, string> = {
  // Core meals
  saapadu: "சாப்பாடு",
  sapadu: "சாப்பாடு",
  sappadu: "சாப்பாடு",
  sapaadu: "சாப்பாடு",
  meals: "சாப்பாடு",
  meal: "சாப்பாடு",
  "veg meals": "வெஜ் சாப்பாடு",
  "non-veg meals": "அசைவ சாப்பாடு",
  "non veg meals": "அசைவ சாப்பாடு",
  "special meals": "ஸ்பெஷல் சாப்பாடு",
  "mini meals": "மினி சாப்பாடு",
  "full meals": "முழு சாப்பாடு",
  "kalyana sappadu": "கல்யாண சாப்பாடு",
  "kalyana saapadu": "கல்யாண சாப்பாடு",
  "wedding meals": "கல்யாண சாப்பாடு",
  "elai sappadu": "இலை சாப்பாடு",
  "banana leaf meals": "வாழை இலை சாப்பாடு",
  tiffin: "டிபன்",
  breakfast: "காலை டிபன்",
  lunch: "மதிய சாப்பாடு",
  dinner: "இரவு சாப்பாடு",
  supper: "இரவு சாப்பாடு",
  combo: "காம்போ",
  thali: "தாலி",
  sadhya: "சாப்பாடு",
  // Modifiers
  veg: "வெஜ்",
  vegetarian: "சைவம்",
  "non-veg": "அசைவம்",
  "non veg": "அசைவம்",
  nonveg: "அசைவம்",
  special: "ஸ்பெஷல்",
  mini: "மினி",
  full: "முழு",
  deluxe: "டீலக்ஸ்",
  super: "சூப்பர்",
  wedding: "கல்யாண",
  kalyana: "கல்யாண",
  morning: "காலை",
  evening: "மாலை",
  night: "இரவு",
  // Tiffin items
  pongal: "பொங்கல்",
  "ven pongal": "வெண் பொங்கல்",
  "sakkarai pongal": "சர்க்கரை பொங்கல்",
  idli: "இட்லி",
  dosa: "தோசை",
  dosai: "தோசை",
  "masala dosa": "மசாலா தோசை",
  "ghee dosa": "நெய் தோசை",
  poori: "பூரி",
  chapathi: "சப்பாத்தி",
  chappathi: "சப்பாத்தி",
  parotta: "பரோட்டா",
  parota: "பரோட்டா",
  upma: "உப்புமா",
  kichadi: "கிச்சடி",
  kesari: "கேசரி",
  vadai: "வடை",
  "medu vadai": "மெது வடை",
  "ulundu vadai": "உளுந்து வடை",
  bonda: "போண்டா",
  bajji: "பஜ்ஜி",
  vada: "வடை",
  // Mains / curries
  sambar: "சாம்பார்",
  "sambar sadham": "சாம்பார் சாதம்",
  rasam: "ரசம்",
  moru: "மோர்",
  mor: "மோர்",
  thayir: "தயிர்",
  "moru curry": "மோர் குழம்பு",
  "mor kuzhambu": "மோர் குழம்பு",
  "more kuzhambu": "மோர் குழம்பு",
  kootu: "கூட்டு",
  poriyal: "பொரியல்",
  kari: "கறி",
  curry: "குழம்பு",
  "chicken curry": "சிக்கன் குழம்பு",
  "mutton curry": "மட்டன் குழம்பு",
  "fish curry": "மீன் குழம்பு",
  "meen kuzhambu": "மீன் குழம்பு",
  karakuzhambu: "காரக் குழம்பு",
  "kara kuzhambu": "காரக் குழம்பு",
  vathakuzhambu: "வத்தக் குழம்பு",
  "vatha kuzhambu": "வத்தக் குழம்பு",
  pachadi: "பச்சடி",
  "thayir pachadi": "தயிர் பச்சடி",
  avial: "அவியல்",
  "kootu curry": "கூட்டு",
  // Rice varieties
  biryani: "பிரியாணி",
  biriyani: "பிரியாணி",
  "chicken biryani": "சிக்கன் பிரியாணி",
  "chicken briyani": "சிக்கன் பிரியாணி",
  "mutton biryani": "மட்டன் பிரியாணி",
  "veg biryani": "வெஜ் பிரியாணி",
  "mushroom biryani": "காளான் பிரியாணி",
  "fried rice": "பிரைட் ரைஸ்",
  "jeera rice": "சீரக சாதம்",
  "ghee rice": "நெய் சாதம்",
  "curd rice": "தயிர் சாதம்",
  "thayir sadham": "தயிர் சாதம்",
  "lemon rice": "எலுமிச்சை சாதம்",
  "elumichai sadham": "எலுமிச்சை சாதம்",
  "coconut rice": "தேங்காய் சாதம்",
  "thengai sadham": "தேங்காய் சாதம்",
  "tomato rice": "தக்காளி சாதம்",
  "thakkali sadham": "தக்காளி சாதம்",
  "sambar rice": "சாம்பார் சாதம்",
  // Sides / extras
  "chicken 65": "சிக்கன் 65",
  chicken65: "சிக்கன் 65",
  appalam: "அப்பளம்",
  papad: "அப்பளம்",
  pickle: "ஊறுகாய்",
  oorugai: "ஊறுகாய்",
  payasam: "பாயசம்",
  "semiya payasam": "சேமியா பாயசம்",
  "javvarisi payasam": "ஜவ்வரிசி பாயசம்",
  coffee: "காபி",
  "filter coffee": "பில்டர் காபி",
  tea: "டீ",
  juice: "ஜூஸ்",
};

/** Offline Tanglish → Tamil transliteration so unknown words still fill something editable. */

const MEI_MAP: Record<string, string> = {
  ng: "ங்",
  nj: "ஞ்",
  th: "த்",
  dh: "த்",
  sh: "ஷ்",
  ch: "ச்",
  zh: "ழ்",
  kh: "க்",
  gh: "க்",
  ph: "ப்",
  bh: "ப்",
  nn: "ண்",
  ll: "ள்",
  rr: "ற்",
  k: "க்",
  g: "க்",
  c: "க்",
  q: "க்",
  x: "க்ஸ்",
  s: "ஸ்",
  j: "ஜ்",
  h: "ஹ்",
  t: "ட்",
  d: "ட்",
  n: "ன்",
  p: "ப்",
  b: "ப்",
  f: "ப்",
  m: "ம்",
  y: "ய்",
  r: "ர்",
  l: "ல்",
  v: "வ்",
  w: "வ்",
  z: "ழ்",
};

const VOWEL_SIGN_MAP: Record<string, string> = {
  ai: "ை",
  au: "ௌ",
  aa: "ா",
  ee: "ே",
  ii: "ீ",
  oo: "ோ",
  uu: "ூ",
  ou: "ூ",
  a: "",
  i: "ி",
  u: "ு",
  e: "ெ",
  o: "ொ",
};

const INDEPENDENT_VOWEL_MAP: Record<string, string> = {
  ai: "ஐ",
  au: "ஔ",
  aa: "ஆ",
  ee: "ஏ",
  ii: "ஈ",
  oo: "ஓ",
  uu: "ஊ",
  ou: "ஊ",
  a: "அ",
  i: "இ",
  u: "உ",
  e: "எ",
  o: "ஒ",
};

const CONSONANT_TOKENS = Object.keys(MEI_MAP).sort((a, b) => b.length - a.length);
const VOWEL_TOKENS = Object.keys(VOWEL_SIGN_MAP).sort((a, b) => b.length - a.length);

function matchToken(input: string, pos: number, tokens: string[]): string | null {
  for (const token of tokens) {
    if (input.startsWith(token, pos)) return token;
  }
  return null;
}

function baseMei(consonant: string, nextVowel: string | null): string {
  // Context-sensitive c/g: ce/ci -> soft sound.
  if (consonant === "c" && nextVowel && ["e", "ee", "i", "ii"].includes(nextVowel)) return "ச்";
  if (consonant === "g" && nextVowel && ["e", "ee", "i", "ii"].includes(nextVowel)) return "ஜ்";
  return MEI_MAP[consonant];
}

function combineMei(meiWithPulli: string, vowel: string): string {
  const stem = meiWithPulli.endsWith("்") ? meiWithPulli.slice(0, -1) : meiWithPulli;
  // 'x' base is a conjunct (க்ஸ்); keep it as-is for non-'a' vowels to avoid broken output.
  if (meiWithPulli === "க்ஸ்" && vowel !== "a") return `${stem}${VOWEL_SIGN_MAP[vowel] ?? ""}`;
  return `${stem}${VOWEL_SIGN_MAP[vowel] ?? ""}`;
}

function transliterateWord(raw: string): string {
  const input = raw.trim().toLowerCase();
  if (!input) return "";
  // Keep digits as-is; strip other punctuation.
  if (/^[0-9]+$/.test(input)) return raw.trim();
  let out = "";
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch < "a" || ch > "z") {
      // Digits pass through; skip other symbols.
      if (ch >= "0" && ch <= "9") out += ch;
      i += 1;
      continue;
    }
    // Vowel at syllable start -> independent vowel letter.
    const vowelHere = matchToken(input, i, VOWEL_TOKENS);
    const consonantHere = matchToken(input, i, CONSONANT_TOKENS);
    if (vowelHere && !consonantHere) {
      out += INDEPENDENT_VOWEL_MAP[vowelHere];
      i += vowelHere.length;
      continue;
    }
    if (consonantHere) {
      const afterConsonant = i + consonantHere.length;
      const vowelAfter = matchToken(input, afterConsonant, VOWEL_TOKENS);
      const mei = baseMei(consonantHere, vowelAfter);
      if (vowelAfter) {
        out += combineMei(mei, vowelAfter);
        i = afterConsonant + vowelAfter.length;
      } else {
        out += mei;
        i = afterConsonant;
      }
      continue;
    }
    // Fallback: skip unknown char.
    i += 1;
  }
  return out;
}

function translateToken(token: string): string {
  const key = normalizedKey(token);
  if (!key) return "";
  if (/^[0-9]+$/.test(key)) return key;
  const dishHit = DISH_TAMIL_MAP[key];
  if (dishHit) return dishHit;
  const ingredientHit = lookupIngredient(key)?.tamilName;
  if (ingredientHit) return ingredientHit;
  const flat = key.replace(/ /g, "");
  if (flat !== key) {
    if (DISH_TAMIL_MAP[flat]) return DISH_TAMIL_MAP[flat];
    const flatHit = lookupIngredient(flat)?.tamilName;
    if (flatHit) return flatHit;
  }
  return transliterateWord(key);
}

/**
 * Best-effort Tamil suggestion for template / course (dish) names.
 * Exact phrase first, then word-by-word dictionary + transliteration. Offline-safe.
 * Always returns something non-empty for non-empty input.
 */
export function suggestTamilName(englishName: string): string {
  const key = normalizedKey(englishName);
  if (!key) return "";
  const dishHit = DISH_TAMIL_MAP[key];
  if (dishHit) return dishHit;
  const ingredientHit = lookupIngredient(key)?.tamilName;
  if (ingredientHit) return ingredientHit;
  const tokens = key.split(/[\s\-/]+/).filter(Boolean);
  if (tokens.length > 1) {
    const translated = tokens.map(translateToken).filter(Boolean);
    if (translated.length > 0) return translated.join(" ");
  }
  const single = translateToken(key);
  if (single) return single;
  return transliterateWord(key);
}

/**
 * Best-effort lookup for an English or Tanglish ingredient name.
 * Returns the Tamil name (and matching category tag) when found.
 */
export function lookupIngredient(
  englishName: string
): IngredientSuggestion | undefined {
  const key = normalizedKey(englishName);
  if (!key) return undefined;

  const fromCatalog = catalogSuggestions.get(key);
  if (fromCatalog) return fromCatalog;

  const direct = ingredientTranslations[key];
  if (direct) return { tamilName: direct, tag: "grocery" };

  const alias = tanglishAliases[key];
  if (alias) return { tamilName: alias, tag: "grocery" };

  const flat = key.replace(/ /g, "");
  const flatFromCatalog = catalogSuggestions.get(flat);
  if (flatFromCatalog) return flatFromCatalog;
  const flatDirect = ingredientTranslations[flat];
  if (flatDirect) return { tamilName: flatDirect, tag: "grocery" };
  const flatAlias = tanglishAliases[flat];
  if (flatAlias) {
    return { tamilName: flatAlias, tag: "grocery" };
  }

  return undefined;
}
