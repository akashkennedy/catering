import type { Label } from "./i18n";

function lab(en: string, ta: string): Label {
  return { en, ta };
}

/**
 * Placeholder for the business's Google Maps URL. Paste the full
 * `google.com/maps/...` link here to activate the "Review us on Google"
 * button on the public site. Empty = button hidden.
 */
export const GOOGLE_MAPS_URL = "";

export const SITE_GALLERY_CATEGORIES = ["sadya", "kitchens", "receptions", "live"] as const;

export type SiteGalleryCategory = (typeof SITE_GALLERY_CATEGORIES)[number];

export const SITE_GALLERY_CATEGORY_LABELS: Record<SiteGalleryCategory, Label> = {
  sadya: lab("Sadya & Feasts", "சாப்பாடு & விருந்து"),
  kitchens: lab("Kitchens", "சமையலறை"),
  receptions: lab("Receptions", "வரவேற்பு"),
  live: lab("Live Counters", "நேரடி கவுண்டர்கள்"),
};

export const SITE_NAV = {
  home: lab("Home", "முகப்பு"),
  about: lab("About Us", "எங்களைப் பற்றி"),
  menu: lab("Menu & Services", "மெனு & சேவைகள்"),
  gallery: lab("Gallery", "புகைப்படங்கள்"),
  testimonials: lab("Testimonials", "வாடிக்கையாளர் கருத்துகள்"),
  contact: lab("Contact", "தொடர்பு"),
  bookFeast: lab("Book Your Feast", "உங்கள் விருந்தை முன்பதிவு செய்க"),
  callDesk: lab("Call Desk", "அழைக்கவும்"),
} as const;

export const SITE_HERO = {
  badge: lab("Traditional Woodfire Culinary Art", "பாரம்பரிய விறகு அடுப்பு சமையல் கலை"),
  title: lab(
    "Authentic Tamil & Kerala Feasts for Your Milestone Celebrations",
    "உங்கள் முக்கிய கொண்டாட்டங்களுக்கு உண்மையான தமிழ் & கேரள விருந்துகள்"
  ),
  subtitle: lab(
    "Crafting exceptional woodfire Kerala Sadya and grand Tamil Kalyana Virundhu across Kanyakumari with pure ghee, stone-ground spices, and heartfelt hospitality.",
    "கன்னியாகுமரி முழுவதும் தூய நெய், கல்லில் அரைத்த மசாலாக்கள் மற்றும் அன்பான உபசரிப்புடன் சிறந்த விறகு அடுப்பு கேரள சாத்யா மற்றும் பிரமாண்ட தமிழ் கல்யாண விருந்து."
  ),
  quoteCta: lab("Get a Free Feast Quote", "இலவச விருந்து மதிப்பீடு பெறுக"),
  menusCta: lab("Explore Our Menus", "எங்கள் மெனுக்களைப் பார்க்க"),
  photoUrl: "https://mampallicatering.vercel.app/images/img_02.jpg",
} as const;

export const SITE_TRUST_CARDS: { title: Label; desc: Label }[] = [
  {
    title: lab("Traditional Vazhaillai", "பாரம்பரிய வாழை இலை"),
    desc: lab("Pure Leaf Dining", "தூய இலை உணவு"),
  },
  {
    title: lab("Pure Ghee & Spices", "தூய நெய் & மசாலா"),
    desc: lab("Zero Preservatives", "பாதுகாப்பான்கள் இல்லை"),
  },
  {
    title: lab("50 to 5,000+ Guests", "50 முதல் 5,000+ விருந்தினர்கள்"),
    desc: lab("Capacity Masters", "எந்த அளவும் சமாளிக்கும் திறன்"),
  },
  {
    title: lab("Auspicious Specialities", "மங்கல சிறப்பு உணவுகள்"),
    desc: lab("100% Authentic", "100% உண்மையான சுவை"),
  },
];

export const SITE_SPECIALITIES: { title: Label; desc: Label }[] = [
  {
    title: lab("Travancore Palada & Ada Pradhaman", "திருவிதாங்கூர் பாலடை & அட பிரதமன்"),
    desc: lab(
      "Slow-simmered pure cow milk & jaggery nectar",
      "மெதுவாகக் காய்ச்சிய தூய பசும் பால் & வெல்லம்"
    ),
  },
  {
    title: lab("Kalyana Drumstick Sambar & Rasam", "கல்யாண முருங்கை சாம்பார் & ரசம்"),
    desc: lab("Stone-ground heirloom spice roasts", "கல்லில் அரைத்த பாரம்பரிய மசாலா"),
  },
  {
    title: lab("Pure Woodfire Cookery", "தூய விறகு அடுப்பு சமையல்"),
    desc: lab(
      "Infused with the distinct warmth of earthen pots & bronze urulis",
      "மண் பாத்திரங்கள் & வெண்கல உருளிகளின் தனித்துவமான சுவையுடன்"
    ),
  },
];

export const SITE_STATS: { value: string; label: Label }[] = [
  {
    value: "25+",
    label: lab("Years of Tradition", "ஆண்டுகால பாரம்பரியம்"),
  },
  {
    value: "1,200+",
    label: lab("Grand Weddings", "பிரமாண்ட திருமணங்கள்"),
  },
  {
    value: "500,000+",
    label: lab("Delighted Guests", "மகிழ்ந்த விருந்தினர்கள்"),
  },
  {
    value: "50 - 5,000",
    label: lab("Guest Capacity", "விருந்தினர் எண்ணிக்கை"),
  },
];

export const SITE_ABOUT = {
  eyebrow: lab("Our Culinary Heritage", "எங்கள் சமையல் பாரம்பரியம்"),
  title: lab("Rooted in the Soulful Flavors of Thiruvarambu", "திருவரம்பின் உணர்வுபூர்வ சுவைகளில் வேரூன்றியது"),
  paras: [
    lab(
      "For over two decades in Thiruvarambu, our master chefs have preserved ancestral recipes cooked in pure brass urulis over slow woodfire. We believe a feast is an auspicious blessing for the host and an unforgettable experience for every guest.",
      "திருவரம்பில் இரண்டு தசாப்தங்களுக்கும் மேலாக, எங்கள் தலைமை சமையல்காரர்கள் தூய பித்தளை உருளிகளில் மெதுவான விறகு நெருப்பில் பாரம்பரிய சமையல் முறைகளைப் பாதுகாத்து வருகின்றனர்."
    ),
    lab(
      "Whether a ceremonious 24-course Kerala Sadya or a lavish Kalyana Virundhu, we prepare every dish with cold-pressed oils, freshly ground spices, and pure cow ghee, serving every batch piping hot with unmatched warmth.",
      "24 வகை கேரள சாத்யாவாக இருந்தாலும், ஆடம்பர கல்யாண விருந்தாக இருந்தாலும், ஒவ்வொரு உணவையும் செக்கு எண்ணெய், புதிதாக அரைத்த மசாலா மற்றும் தூய பசும் நெய்யுடன் தயாரித்து சூடாகப் பரிமாறுகிறோம்."
    ),
  ],
  checklist: [
    lab("FSSAI Standard Hygiene", "FSSAI தர சுகாதாரம்"),
    lab("Master Firewood Cooks", "தேர்ந்த விறகு அடுப்பு சமையல்காரர்கள்"),
    lab("Fresh Farm Produce Daily", "தினமும் புதிய பண்ணை காய்கறிகள்"),
    lab("Uniformed Professional Staff", "சீருடை அணிந்த தொழில்முறை ஊழியர்கள்"),
  ],
  photoUrl: "https://mampallicatering.vercel.app/images/img_03.jpg",
} as const;

export const SITE_MENU_SECTION = {
  eyebrow: lab("Curated Celebratory Offerings", "தேர்ந்த கொண்டாட்ட உணவுகள்"),
  title: lab("Signature Feast Menus & Catering Services", "சிறப்பு விருந்து மெனுக்கள் & கேட்டரிங் சேவைகள்"),
  subtitle: lab(
    "Curated traditional banana-leaf feasts and live reception counters tailored for your milestone events.",
    "உங்கள் முக்கிய நிகழ்வுகளுக்கு ஏற்ப தேர்ந்த பாரம்பரிய வாழை இலை விருந்துகள் மற்றும் நேரடி வரவேற்பு கவுண்டர்கள்."
  ),
  enquire: lab("Enquire for this Menu", "இந்த மெனுவைப் பற்றி விசாரிக்க"),
  perLeaf: lab("/ per leaf plate", "/ இலைக்கு"),
} as const;

export const SITE_STANDARDS: { title: Label; desc: Label }[] = [
  {
    title: lab("Vazhaillai Protocol", "வாழை இலை நெறிமுறை"),
    desc: lab(
      "Every tender leaf is hand-selected, washed with purified RO water, and arranged respecting customary direction and dining etiquette.",
      "ஒவ்வொரு இளம் இலையும் கையால் தேர்ந்து, சுத்திகரித்த நீரில் கழுவி, முறைப்படி பரிமாறப்படுகிறது."
    ),
  },
  {
    title: lab("Farm-Fresh Sourcing", "பண்ணையிலிருந்து நேரடி"),
    desc: lab(
      "Direct from local growers: Nagercoil plantains, Pollachi farm coconuts, and pure fresh cow milk delivered daily.",
      "உள்ளூர் விவசாயிகளிடமிருந்து நேரடி: நாகர்கோவில் வாழை, பொள்ளாச்சி தேங்காய், தினமும் புதிய பசும் பால்."
    ),
  },
  {
    title: lab("Steam & Brass Kitchens", "நவீன & பித்தளை சமையல்"),
    desc: lab(
      "Modern hygienic steam boilers paired with ancestral heavy bronze urulis ensure distinct taste and cleanliness.",
      "நவீன சுகாதார நீராவி கொதிகலன்கள் மற்றும் பாரம்பரிய வெண்கல உருளிகள் தனித்துவமான சுவை மற்றும் தூய்மையை உறுதி செய்கின்றன."
    ),
  },
  {
    title: lab("Disciplined Trained Staff", "பயிற்சி பெற்ற ஒழுக்கமான ஊழியர்கள்"),
    desc: lab(
      "Uniformed, smiling servers who anticipate guests' needs, serving hot seconds with gracious hospitality.",
      "சீருடை அணிந்த, புன்னகைக்கும் பரிமாறுபவர்கள் சூடாக இரண்டாம் முறை அன்புடன் பரிமாறுவார்கள்."
    ),
  },
];

export const SITE_GALLERY_SECTION = {
  eyebrow: lab("Memories Captured", "பதிவான நினைவுகள்"),
  title: lab("Glimpses of Grand Celebrations", "பிரமாண்ட கொண்டாட்டங்களின் காட்சிகள்"),
  all: lab("All", "அனைத்தும்"),
} as const;

export const SITE_TESTIMONIALS_SECTION = {
  eyebrow: lab("Words of Blessings", "ஆசி மொழிகள்"),
  title: lab("Cherished by Families Across Kanyakumari", "கன்னியாகுமரி குடும்பங்களின் நேசத்திற்குரியவர்கள்"),
  googleBadge: lab("via Google", "கூகுள் வழியாக"),
  reviewUs: lab("Review us on Google", "கூகுளில் மதிப்பிடுங்கள்"),
} as const;

export const SITE_CONTACT = {
  eyebrow: lab("Reserve Your Auspicious Date", "உங்கள் மங்கல தேதியை முன்பதிவு செய்க"),
  title: lab("Plan Your Celebration Feast", "உங்கள் கொண்டாட்ட விருந்தைத் திட்டமிடுங்கள்"),
  subtitle: lab(
    "Muhurtham dates book quickly. Submit your event details below for an instant quote via WhatsApp or call our desk.",
    "முகூர்த்த தேதிகள் விரைவில் நிரம்பும். உடனடி மதிப்பீட்டிற்கு உங்கள் நிகழ்வு விவரங்களை அனுப்புங்கள்."
  ),
  name: lab("Full Name *", "முழு பெயர் *"),
  phone: lab("WhatsApp / Phone Number *", "வாட்ஸ்அப் / தொலைபேசி *"),
  date: lab("Event Date *", "நிகழ்வு தேதி *"),
  eventType: lab("Event Type *", "நிகழ்வு வகை *"),
  eventTypePlaceholder: lab("Select event type…", "நிகழ்வு வகையைத் தேர்ந்தெடுக்க…"),
  guestCount: lab("Estimated Guest Count *", "உத்தேச விருந்தினர் எண்ணிக்கை *"),
  guestCountPlaceholder: lab("Select guest range…", "விருந்தினர் எண்ணிக்கையைத் தேர்ந்தெடுக்க…"),
  location: lab("Event Location / Mandapam *", "நிகழ்வு இடம் / மண்டபம் *"),
  notes: lab("Special Menu Notes or Preferences", "சிறப்பு மெனு குறிப்புகள்"),
  sendWhatsapp: lab("Send Request via WhatsApp", "வாட்ஸ்அப் மூலம் அனுப்புக"),
  callDirect: lab("Call Us Direct", "நேரடியாக அழைக்கவும்"),
  officeTitle: lab("Direct Office & Kitchens", "நேரடி அலுவலகம் & சமையலறைகள்"),
  address: lab(
    "Mampalli Central Kitchen, Main Road, Thiruvarambu, Kanyakumari District, Tamil Nadu - 629161",
    "மாம்பள்ளி மத்திய சமையலறை, மெயின் ரோடு, திருவரம்பு, கன்னியாகுமரி மாவட்டம், தமிழ் நாடு - 629161"
  ),
  whatsappHours: lab(
    "Instant Response WhatsApp (7:00 AM - 10:00 PM Daily)",
    "உடனடி வாட்ஸ்அப் பதில் (தினமும் காலை 7 - இரவு 10)"
  ),
  zonesTitle: lab("Active Service Zones", "சேவை பகுதிகள்"),
  zones: [
    "Thiruvarambu",
    "Marthandam",
    "Nagercoil",
    "Thuckalay",
    "Kulasekharam",
    "Kanyakumari",
    "Karungal",
    "Trivandrum Border",
  ],
  eventTypes: [
    lab("Wedding / Kalyanam", "திருமணம் / கல்யாணம்"),
    lab("Kerala Sadya Celebration", "கேரள சாத்யா கொண்டாட்டம்"),
    lab("Reception Banquet", "வரவேற்பு விருந்து"),
    lab("Housewarming (Grahapravesam)", "புதுமனை புகுவிழா"),
    lab("Birthday / Family Gathering", "பிறந்தநாள் / குடும்ப கூட்டம்"),
    lab("Corporate / Temple Annadanam", "நிறுவன / கோவில் அன்னதானம்"),
  ],
  guestRanges: [
    lab("50 - 150 Guests (Intimate Gathering)", "50 - 150 விருந்தினர்கள்"),
    lab("150 - 500 Guests (Medium Hall)", "150 - 500 விருந்தினர்கள்"),
    lab("500 - 1,500 Guests (Grand Kalyanam)", "500 - 1,500 விருந்தினர்கள்"),
    lab("1,500 - 5,000+ Guests (Mega Convention)", "1,500 - 5,000+ விருந்தினர்கள்"),
  ],
} as const;

export const SITE_FOOTER = {
  name: lab("Mampalli", "மாம்பள்ளி"),
  blurb: lab(
    "Bringing ancestral culinary sanctity, pure ghee aromatics, and the revered hospitality of traditional Vazhaillai Saapadu to your milestone celebrations across South India.",
    "பாரம்பரிய சமையல் புனிதம், தூய நெய் மணம் மற்றும் பாரம்பரிய வாழை இலை சாப்பாட்டு உபசரிப்பை தென்னிந்தியா முழுவதும் உங்கள் கொண்டாட்டங்களுக்கு."
  ),
  regionsTitle: lab("Service Regions", "சேவை பகுதிகள்"),
  contactTitle: lab("Get In Touch", "தொடர்பு கொள்க"),
  rights: lab(
    "© 2026 Mampalli Catering Service. Rooted in Thiruvarambu, Kanyakumari. All Rights Reserved.",
    "© 2026 மாம்பள்ளி கேட்டரிங் சர்வீஸ். திருவரம்பு, கன்னியாகுமரி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
  ),
} as const;
