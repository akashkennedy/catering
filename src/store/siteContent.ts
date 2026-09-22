import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `site-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export type TestimonialSource = "manual" | "google";

export type SiteTestimonial = {
  id: string;
  quoteEn: string;
  quoteTa: string;
  author: string;
  event: string;
  eventTa: string;
  place: string;
  rating: number;
  source: TestimonialSource;
  profileUrl: string;
  authorPhotoUrl: string;
  googleReviewId: string;
};

export type SiteCourseGroup = {
  id: string;
  nameEn: string;
  nameTa: string;
  items: { en: string; ta: string }[];
};

export type SiteMenu = {
  id: string;
  nameEn: string;
  nameTa: string;
  tagEn: string;
  tagTa: string;
  descEn: string;
  descTa: string;
  price: number;
  photoUrl: string;
  templateId: string | null;
  courses: SiteCourseGroup[];
  /** Landing display extras — mirror the live site tabs/cards. */
  tabKey: string;
  taglineEn: string;
  taglineTa: string;
  unitEn: string;
  unitTa: string;
  isVegOnly: boolean;
  sideTitle: string;
  sideDesc: string;
  sideBadge: string;
  sideImage: string;
};

export type GalleryKind = "photo" | "instagram";

export function isGalleryKind(value: unknown): value is GalleryKind {
  return value === "photo" || value === "instagram";
}

export type SiteGalleryItem = {
  id: string;
  kind: GalleryKind;
  url: string;
  captionEn: string;
  captionTa: string;
  category: string;
};

export type SiteBusiness = {
  phones: string[];
  whatsapp: string;
  addressEn: string;
  addressTa: string;
  serviceZones: string[];
};

export const DEFAULT_SERVICE_ZONES = [
  "Thiruvarambu",
  "Marthandam",
  "Nagercoil",
  "Thuckalay",
  "Kulasekharam",
  "Kanyakumari",
  "Karungal",
  "Trivandrum Border",
];

export type SiteMenuInput = Omit<SiteMenu, "id" | "courses"> & {
  courses: Omit<SiteCourseGroup, "id">[];
};

export type SiteTestimonialInput = Omit<SiteTestimonial, "id">;
export type SiteGalleryInput = Omit<SiteGalleryItem, "id">;

const IMG = "/images";

function seedTestimonials(): SiteTestimonial[] {
  return [
    {
      id: newId(),
      quoteEn:
        "For our daughter's wedding at Marthandam, we booked Mampalli for 1,800 guests. The Kerala Sadya was flawless! Guests from Trivandrum were praising the Ada Pradhaman and fresh crispy chips for weeks. The servers were so kind.",
      quoteTa:
        "மார்த்தாண்டத்தில் எங்கள் மகள் திருமணத்திற்கு 1,800 விருந்தினர்களுக்கு மாம்பள்ளியை முன்பதிவு செய்தோம். கேரள சாத்யா குறையில்லாமல் இருந்தது!",
      author: "Anand & Priya Ramachandran",
      event: "Daughter's Wedding Reception",
      eventTa: "மகள் திருமண வரவேற்பு",
      place: "Marthandam",
      rating: 5,
      source: "manual",
      profileUrl: "",
      authorPhotoUrl: "",
      googleReviewId: "",
    },
    {
      id: newId(),
      quoteEn:
        "We held my father's 60th Shashti Poorthi pooja at Thiruvarambu. The traditional Tamil Virundhu was pure nostalgia. Drumstick sambar with authentic ghee aroma felt like our grandmother's feast. Truly exceptional service!",
      quoteTa:
        "திருவரம்பில் என் தந்தையின் 60வது சஷ்டியப்த பூர்த்தியை நடத்தினோம். பாரம்பரிய தமிழ் விருந்து பாட்டி வீட்டு சாப்பாடு போல இருந்தது!",
      author: "Dr. K. Sundaram",
      event: "60th Birthday Celebration (Shashti Poorthi)",
      eventTa: "60வது பிறந்தநாள் விழா",
      place: "Nagercoil",
      rating: 5,
      source: "manual",
      profileUrl: "",
      authorPhotoUrl: "",
      googleReviewId: "",
    },
    {
      id: newId(),
      quoteEn:
        "From the morning filter coffee and fluffy poori masala to the grand evening Biryani live counters, Mampalli managed our housewarming seamlessly. The kitchen space was left spotlessly clean afterward!",
      quoteTa:
        "காலை பில்டர் காபி முதல் மாலை பிரியாணி லைவ் கவுண்டர்கள் வரை எங்கள் புதுமனை விழாவை மாம்பள்ளி சிறப்பாக நடத்தியது!",
      author: "Meera & Navin",
      event: "Housewarming Ceremony (Grahapravesam)",
      eventTa: "புதுமனை புகுவிழா",
      place: "Thuckalay",
      rating: 5,
      source: "manual",
      profileUrl: "",
      authorPhotoUrl: "",
      googleReviewId: "",
    },
  ];
}

/**
 * Mock menus mirroring the live landing tabs:
 *  1. Kerala Sadya (Kalyanam Special)
 *  2. Tamil Virundhu Sappadu
 *  3. Live Tiffin & Evening Counters
 */
function seedMenus(): SiteMenu[] {
  return [
    {
      id: newId(),
      nameEn: "Royal Travancore Wedding Sadya",
      nameTa: "ராயல் திருவிதாங்கூர் திருமண சாத்யா",
      tagEn: "26 Items Traditional",
      tagTa: "26 வகை பாரம்பரியம்",
      descEn:
        "The jewel of southern hospitality. Served ceremoniously on freshly cut tender banana leaves with pure cow ghee poured atop steaming hot parippu and Kerala Red Matta / Ponni rice.",
      descTa:
        "தென்னக உபசரிப்பின் மணிமகுடம். புதிய வாழை இலையில் சூடான பருப்புடன் தூய பசும் நெய் ஊற்றி முறைப்படி பரிமாறப்படும் 26 வகை பாரம்பரிய விருந்து.",
      price: 280,
      photoUrl: `${IMG}/img_03.jpg`,
      templateId: null,
      tabKey: "Kerala Sadya (Kalyanam Special)",
      taglineEn: "Authentic 26-course Grand Feast on Fresh Banana Leaf",
      taglineTa: "புதிய வாழை இலையில் 26 வகை பாரம்பரிய விருந்து",
      unitEn: "/ per leaf plate",
      unitTa: "/ இலைக்கு",
      isVegOnly: true,
      sideTitle: "The Sanctity of Leaf Serving",
      sideDesc:
        "Every element in a Sadya has its designated place on the banana leaf. Our servers are well-versed in this Vedic hospitality etiquette.",
      sideBadge: "Fresh Nilgiri & Nagercoil Leaves Guaranteed",
      sideImage: `${IMG}/img_03.jpg`,
      courses: [
        {
          id: newId(),
          nameEn: "Core Feasts & Curries",
          nameTa: "முக்கிய குழம்புகள்",
          items: [
            { en: "Kerala Red Matta Rice & Ponni Rice", ta: "கேரள மட்டை அரிசி & பொன்னி அரிசி" },
            { en: "Parippu Curry & Steaming Fresh Cow Ghee", ta: "பருப்பு குழம்பு & தூய பசும் நெய்" },
            { en: "Travancore Drumstick & Pumpkin Sambar", ta: "முருங்கை & பூசணி சாம்பார்" },
            { en: "Pepper Cumin Rasam & Moru Kachiathu", ta: "மிளகு சீரக ரசம் & மோர்" },
            { en: "Traditional Kalan & Tender Ash Gourd Olan", ta: "பாரம்பரிய காளன் & ஓலன்" },
          ],
        },
        {
          id: newId(),
          nameEn: "Accompaniments & Crisps",
          nameTa: "துணை உணவுகள்",
          items: [
            { en: "Classic Avial in Cold-Pressed Coconut Oil", ta: "செக்கு எண்ணெய் அவியல்" },
            { en: "Beetroot & Cabbage Coconut Thoran", ta: "பீட்ரூட் & முட்டைகோஸ் தோரன்" },
            { en: "Pineapple Kichadi & White Pumpkin Pachadi", ta: "அன்னாசி கிச்சடி & பூசணி பச்சடி" },
            { en: "Nendran Banana Chips & Sharkara Varatti", ta: "நேந்திரன் சிப்ஸ் & சர்க்கரை வரட்டி" },
            { en: "Ginger Puli Inji & Large Crispy Appalam", ta: "இஞ்சி புளி & அப்பளம்" },
          ],
        },
        {
          id: newId(),
          nameEn: "Signature Double Payasam Finale",
          nameTa: "இரட்டை பாயசம்",
          items: [
            { en: "Ada Pradhaman: rice flakes in dark jaggery, thick coconut milk & fried cashews", ta: "அட பிரதமன்: வெல்லம் & தேங்காய் பால்" },
            { en: "Palada Payasam: slow-simmered rich milk delight", ta: "பாலடை பாயசம்: பசும் பால் சுவை" },
          ],
        },
      ],
    },
    {
      id: newId(),
      nameEn: "Tamil Virundhu Sappadu",
      nameTa: "தமிழ் விருந்து சாப்பாடு",
      tagEn: "Kalyana Virundhu",
      tagTa: "கல்யாண விருந்து",
      descEn:
        "Grand Tamil wedding feast on fresh banana leaf with drumstick sambar, variety pachadis, poriyals and double payasam, served piping hot with heartfelt hospitality.",
      descTa:
        "புதிய வாழை இலையில் முருங்கை சாம்பார், பச்சடி வகைகள், பொரியல் மற்றும் இரட்டை பாயசத்துடன் பிரமாண்ட தமிழ் கல்யாண விருந்து.",
      price: 250,
      photoUrl: `${IMG}/img_02.jpg`,
      templateId: null,
      tabKey: "Tamil Virundhu Sappadu",
      taglineEn: "Grand Tamil wedding feast on fresh banana leaf",
      taglineTa: "வாழை இலையில் பிரமாண்ட தமிழ் விருந்து",
      unitEn: "/ per leaf plate",
      unitTa: "/ இலைக்கு",
      isVegOnly: true,
      sideTitle: "Kalyana Samayal Tradition",
      sideDesc:
        "Stone-ground spices, cold-pressed oils and pure ghee — cooked in brass urulis over slow woodfire, just like grandmother's feast.",
      sideBadge: "50 to 2,000+ Guests in One Sitting",
      sideImage: `${IMG}/img_02.jpg`,
      courses: [
        {
          id: newId(),
          nameEn: "Virundhu Core",
          nameTa: "முக்கிய விருந்து",
          items: [
            { en: "Ponni Rice & Paruppu Nei", ta: "பொன்னி அரிசி & பருப்பு நெய்" },
            { en: "Drumstick Sambar & Rasam", ta: "முருங்கை சாம்பார் & ரசம்" },
            { en: "Kalyana Poriyal & Kootu", ta: "கல்யாண பொரியல் & கூட்டு" },
          ],
        },
        {
          id: newId(),
          nameEn: "Payasam Finale",
          nameTa: "பாயசம்",
          items: [
            { en: "Paruppu Payasam & Kesari", ta: "பருப்பு பாயசம் & கேசரி" },
          ],
        },
      ],
    },
    {
      id: newId(),
      nameEn: "Live Tiffin & Evening Counters",
      nameTa: "நேரடி டிபன் & மாலை கவுண்டர்கள்",
      tagEn: "Interactive Counters",
      tagTa: "நேரடி கவுண்டர்கள்",
      descEn:
        "Filter coffee, poori masala, dosa varieties, Biryani and chaat counters served live with uniformed chefs and spotless counters.",
      descTa:
        "பில்டர் காபி, பூரி மசாலா, தோசை வகைகள், பிரியாணி மற்றும் சாட் கவுண்டர்கள் நேரடியாகப் பரிமாறப்படும்.",
      price: 180,
      photoUrl: `${IMG}/img_06.jpg`,
      templateId: null,
      tabKey: "Live Tiffin & Evening Counters",
      taglineEn: "Filter coffee to Biryani — served live",
      taglineTa: "பில்டர் காபி முதல் பிரியாணி வரை — நேரடி",
      unitEn: "/ per guest",
      unitTa: "/ விருந்தினருக்கு",
      isVegOnly: true,
      sideTitle: "Interactive Live Experience",
      sideDesc:
        "Morning tiffin to evening chaat — live dosa, appam and Biryani counters with chefs in uniform and hygienic serveware.",
      sideBadge: "Customizable per guest head",
      sideImage: `${IMG}/img_06.jpg`,
      courses: [
        {
          id: newId(),
          nameEn: "Morning Tiffin Live",
          nameTa: "காலை டிபன்",
          items: [
            { en: "Filter Coffee & Poori Masala", ta: "பில்டர் காபி & பூரி மசாலா" },
            { en: "Ghee Roast & Ven Pongal", ta: "நெய் ரோஸ்ட் & வெண் பொங்கல்" },
          ],
        },
        {
          id: newId(),
          nameEn: "Evening Counters",
          nameTa: "மாலை கவுண்டர்கள்",
          items: [
            { en: "Veg Biryani & Chaat Live", ta: "வெஜ் பிரியாணி & சாட்" },
          ],
        },
      ],
    },
  ];
}

function seedGallery(): SiteGalleryItem[] {
  const photo = (
    url: string,
    captionEn: string,
    captionTa: string,
    category: string
  ): SiteGalleryItem => ({ id: newId(), kind: "photo", url, captionEn, captionTa, category });
  return [
    photo(`${IMG}/img_02.jpg`, "2,500 Guests Vazhaillai Virundhu", "2,500 விருந்தினர் வாழை இலை விருந்து", "sadya"),
    photo(`${IMG}/img_03.jpg`, "Heirloom Red Rice & Payasams", "பாரம்பரிய சிவப்பு அரிசி & பாயசம்", "sadya"),
    photo(`${IMG}/img_04.jpg`, "Pure Brass Uruli Cooking", "பித்தளை உருளி சமையல்", "kitchens"),
    photo(`${IMG}/img_05.jpg`, "Marthandam Wedding Mandapam", "மார்த்தாண்டம் திருமண மண்டபம்", "receptions"),
    photo(`${IMG}/img_06.jpg`, "Interactive Live Tiffin Experience", "நேரடி டிபன் அனுபவம்", "live"),
    photo(`${IMG}/img_07.jpg`, "Ada Pradhaman & Ghee Halwa", "அட பிரதமன் & நெய் அல்வா", "sadya"),
  ];
}

function seedBusiness(): SiteBusiness {
  return {
    phones: ["919443210000", "919842120000"],
    whatsapp: "919443210000",
    addressEn:
      "Mampalli Central Kitchen, Main Road, Thiruvarambu, Kanyakumari District, Tamil Nadu - 629161",
    addressTa:
      "மாம்பள்ளி மத்திய சமையலறை, மெயின் ரோடு, திருவரம்பு, கன்னியாகுமரி மாவட்டம், தமிழ் நாடு - 629161",
    serviceZones: [...DEFAULT_SERVICE_ZONES],
  };
}

export type RemoteSiteContent = {
  business: SiteBusiness;
  menus: SiteMenu[];
  gallery: SiteGalleryItem[];
  testimonials: SiteTestimonial[];
};

type SiteContentState = RemoteSiteContent & {
  /** Local-only publish metadata; never sent to the database. */
  lastPublishedAt: string | null;
  setLastPublishedAt: (value: string | null) => void;
  replaceAll: (input: RemoteSiteContent) => void;
  setBusiness: (input: SiteBusiness) => void;
  addMenu: (input: SiteMenuInput) => void;
  updateMenu: (id: string, input: SiteMenuInput) => void;
  deleteMenu: (id: string) => void;
  addGalleryItem: (input: SiteGalleryInput) => void;
  updateGalleryItem: (id: string, input: SiteGalleryInput) => void;
  deleteGalleryItem: (id: string) => void;
  addTestimonial: (input: SiteTestimonialInput) => void;
  updateTestimonial: (id: string, input: SiteTestimonialInput) => void;
  deleteTestimonial: (id: string) => void;
};

function withIds(input: SiteMenuInput): SiteMenu {
  return {
    ...input,
    id: newId(),
    courses: input.courses.map((course) => ({ ...course, id: newId() })),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Validate + normalize a content doc pulled from the database.
 * Returns null when the payload is unusable. Missing ids are regenerated
 * so older/alien payloads still load safely.
 */
export function normalizeRemoteContent(data: unknown): RemoteSiteContent | null {
  if (!data || typeof data !== "object") return null;
  const doc = data as Record<string, unknown>;
  if (!doc.business || typeof doc.business !== "object") return null;
  if (!Array.isArray(doc.menus) || !Array.isArray(doc.gallery) || !Array.isArray(doc.testimonials)) {
    return null;
  }
  const businessRaw = doc.business as Record<string, unknown>;
  const business: SiteBusiness = {
    phones: asStringArray(businessRaw.phones),
    whatsapp: asString(businessRaw.whatsapp),
    addressEn: asString(businessRaw.addressEn),
    addressTa: asString(businessRaw.addressTa),
    serviceZones: asStringArray(businessRaw.serviceZones).length
      ? asStringArray(businessRaw.serviceZones)
      : [...DEFAULT_SERVICE_ZONES],
  };
  const strOr = (value: unknown, fallback: string): string => {
    const s = asString(value).trim();
    return s || fallback;
  };
  const menus: SiteMenu[] = (doc.menus as Record<string, unknown>[]).map((raw) => {
    const nameEn = asString(raw.nameEn);
    return {
      id: asString(raw.id) || newId(),
      nameEn,
      nameTa: strOr(raw.nameTa, nameEn),
      tagEn: asString(raw.tagEn),
      tagTa: strOr(raw.tagTa, asString(raw.tagEn)),
      descEn: asString(raw.descEn),
      descTa: strOr(raw.descTa, asString(raw.descEn)),
      price: asNumber(raw.price, 0),
      photoUrl: asString(raw.photoUrl),
      templateId: typeof raw.templateId === "string" ? raw.templateId : null,
      tabKey: strOr(raw.tabKey, nameEn),
      taglineEn: strOr(raw.taglineEn, asString(raw.descEn)),
      taglineTa: strOr(raw.taglineTa, strOr(raw.taglineEn, asString(raw.descEn))),
      unitEn: strOr(raw.unitEn, "/ per leaf plate"),
      unitTa: strOr(raw.unitTa, "/ இலைக்கு"),
      isVegOnly: raw.isVegOnly !== false,
      sideTitle: asString(raw.sideTitle),
      sideDesc: asString(raw.sideDesc),
      sideBadge: asString(raw.sideBadge),
      sideImage: asString(raw.sideImage) || asString(raw.photoUrl),
      courses: Array.isArray(raw.courses)
        ? (raw.courses as Record<string, unknown>[]).map((course) => ({
            id: asString(course.id) || newId(),
            nameEn: asString(course.nameEn),
            nameTa: asString(course.nameTa),
            items: Array.isArray(course.items)
              ? (course.items as Record<string, unknown>[])
                  .map((item) => ({ en: asString(item.en), ta: asString(item.ta) }))
                  .filter((item) => item.en !== "")
              : [],
          }))
        : [],
    };
  });
  const gallery: SiteGalleryItem[] = (doc.gallery as Record<string, unknown>[]).map((raw) => ({
    id: asString(raw.id) || newId(),
    // Landing only renders site-hosted photos now; coerce legacy instagram kinds.
    kind: "photo",
    url: asString(raw.url),
    captionEn: asString(raw.captionEn),
    captionTa: strOr(raw.captionTa, asString(raw.captionEn)),
    category: asString(raw.category) || "sadya",
  }));
  const eventToFlat = (value: unknown): { event: string; eventTa: string } => {
    if (value && typeof value === "object") {
      const rec = value as Record<string, unknown>;
      const en = asString(rec.en);
      return { event: en, eventTa: strOr(rec.ta, en) };
    }
    const en = asString(value);
    return { event: en, eventTa: en };
  };
  const quoteToFlat = (
    raw: Record<string, unknown>
  ): { quoteEn: string; quoteTa: string } => {
    const nested = raw.quote;
    if (nested && typeof nested === "object") {
      const rec = nested as Record<string, unknown>;
      const en = asString(rec.en) || asString(raw.quoteEn);
      return { quoteEn: en, quoteTa: strOr(rec.ta, en) };
    }
    const en = asString(raw.quoteEn);
    return { quoteEn: en, quoteTa: strOr(raw.quoteTa, en) };
  };
  const testimonials: SiteTestimonial[] = (doc.testimonials as Record<string, unknown>[]).map(
    (raw) => {
      const ev = eventToFlat(raw.event);
      const q = quoteToFlat(raw);
      return {
        id: asString(raw.id) || newId(),
        quoteEn: q.quoteEn,
        quoteTa: q.quoteTa,
        author: asString(raw.author),
        event: ev.event,
        eventTa: asString(raw.eventTa) || ev.eventTa,
        place: asString((raw.location as string) ?? raw.place),
        rating: Math.min(5, Math.max(1, Math.round(asNumber(raw.rating, 5)))),
        source: raw.source === "google" ? "google" : "manual",
        profileUrl: asString(raw.profileUrl),
        authorPhotoUrl: asString(raw.authorPhotoUrl),
        googleReviewId: asString(raw.googleReviewId),
      };
    }
  );
  return { business, menus, gallery, testimonials };
}

export function defaultSiteContent(): Pick<
  SiteContentState,
  "business" | "menus" | "gallery" | "testimonials"
> {
  return {
    business: seedBusiness(),
    menus: seedMenus(),
    gallery: seedGallery(),
    testimonials: seedTestimonials(),
  };
}

export const useSiteContentStore = create<SiteContentState>()(
  persist(
    (set) => ({
      ...defaultSiteContent(),
      lastPublishedAt: null,
      setLastPublishedAt: (value) => set({ lastPublishedAt: value }),
      replaceAll: (input) =>
        set({
          business: input.business,
          menus: input.menus,
          gallery: input.gallery,
          testimonials: input.testimonials,
        }),
      setBusiness: (input) => set({ business: input }),
      addMenu: (input) =>
        set((state) => ({ menus: [...state.menus, withIds(input)] })),
      updateMenu: (id, input) =>
        set((state) => ({
          menus: state.menus.map((menu) =>
            menu.id === id
              ? {
                  ...input,
                  id,
                  courses: input.courses.map((course) => ({
                    ...course,
                    id:
                      menu.courses.find(
                        (c) => c.nameEn === course.nameEn && c.nameTa === course.nameTa
                      )?.id ?? newId(),
                  })),
                }
              : menu
          ),
        })),
      deleteMenu: (id) =>
        set((state) => ({ menus: state.menus.filter((menu) => menu.id !== id) })),
      addGalleryItem: (input) =>
        set((state) => ({ gallery: [...state.gallery, { id: newId(), ...input }] })),
      updateGalleryItem: (id, input) =>
        set((state) => ({
          gallery: state.gallery.map((item) => (item.id === id ? { ...input, id } : item)),
        })),
      deleteGalleryItem: (id) =>
        set((state) => ({ gallery: state.gallery.filter((item) => item.id !== id) })),
      addTestimonial: (input) =>
        set((state) => ({ testimonials: [...state.testimonials, { id: newId(), ...input }] })),
      updateTestimonial: (id, input) =>
        set((state) => ({
          testimonials: state.testimonials.map((item) =>
            item.id === id ? { ...input, id } : item
          ),
        })),
      deleteTestimonial: (id) =>
        set((state) => ({
          testimonials: state.testimonials.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "catering-site",
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as {
          menus?: Array<Record<string, unknown>> | null;
          gallery?: Array<Record<string, unknown>> | null;
          testimonials?: Array<Record<string, unknown>> | null;
          business?: Record<string, unknown> | null;
          lastPublishedAt?: unknown;
        } & Record<string, unknown>;
        const businessRaw = (state.business ?? {}) as Record<string, unknown>;
        const strOr = (v: unknown, f: string): string => {
          const s = typeof v === "string" ? v.trim() : "";
          return s || f;
        };
        return {
          ...state,
          lastPublishedAt:
            typeof state.lastPublishedAt === "string" ? state.lastPublishedAt : null,
          business: {
            phones: [],
            whatsapp: "",
            addressEn: "",
            addressTa: "",
            ...(businessRaw as Record<string, unknown>),
            serviceZones: Array.isArray(businessRaw.serviceZones)
              ? (businessRaw.serviceZones as string[])
              : [...DEFAULT_SERVICE_ZONES],
          },
          menus: (state.menus ?? []).map((raw) => {
            const nameEn = typeof raw.nameEn === "string" ? raw.nameEn : "";
            return {
              tabKey: nameEn,
              taglineEn: "",
              taglineTa: "",
              unitEn: "/ per leaf plate",
              unitTa: "/ இலைக்கு",
              isVegOnly: true,
              sideTitle: "",
              sideDesc: "",
              sideBadge: "",
              sideImage: "",
              ...raw,
              nameTa: strOr(raw.nameTa, nameEn),
            };
          }),
          gallery: (state.gallery ?? []).map((raw) => ({
            ...raw,
            kind: "photo",
          })),
          testimonials: (state.testimonials ?? []).map((raw) => ({
            eventTa: "",
            ...raw,
          })),
        };
      },
    }
  )
);
