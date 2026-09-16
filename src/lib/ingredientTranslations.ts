/**
 * Static English → Tamil dictionary for common catering ingredients.
 * Lookup is case-insensitive (keys are lowercased).
 * Add new entries at the bottom of the relevant category.
 */

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
  const key = englishName.trim().toLowerCase();
  return ingredientTranslations[key];
}
