export type Label = {
  en: string;
  ta: string;
};

function lab(en: string, ta: string): Label {
  return { en, ta };
}

export const ui = {
  appName: lab("Catering CRM", "கேட்டரிங் CRM"),
  dashboard: {
    title: lab("Dashboard", "டாஷ்போர்டு"),
    subtitle: lab(
      "Home page placeholder for the Catering CRM dashboard.",
      "கேட்டரிங் CRM டாஷ்போர்டுக்கான முகப்புப்பக்கம்."
    ),
    mantineButton: lab("Mantine styled button", "Mantine பொத்தான்"),
    tailwindButton: lab("Tailwind styled button", "Tailwind பொத்தான்"),
    upcomingEvents: lab("Upcoming events", "வரவிருக்கும் நிகழ்வுகள்"),
    upcomingEmpty: lab("No upcoming events.", "வரவிருக்கும் நிகழ்வுகள் இல்லை."),
    widgetPlaceholder: lab("Coming soon", "விரைவில்"),
    totalOrders: lab("Total orders", "மொத்த ஆர்டர்கள்"),
    totalAmount: lab("Total amount", "மொத்த தொகை"),
    totalExpenses: lab("Total expenses", "மொத்த செலவுகள்"),
    pendingAmount: lab("Pending amount", "நிலுவைத் தொகை"),
    earningsThisMonth: lab("This month", "இந்த மாதம்"),
    earningsAllTime: lab("All time", "அனைத்து நேரம்"),
    paymentOverview: lab("Payment status", "கட்டண நிலை"),
    clientPending: lab("Client pending", "வாடிக்கையாளர் நிலுவை"),
    employeePending: lab("Employee pending", "ஊழியர் நிலுவை"),
    paymentEmpty: lab("No pending payments.", "நிலுவை கட்டணங்கள் இல்லை."),
    customerFollowUp: lab("Customer follow-up", "வாடிக்கையாளர் தொடர்பு"),
    remindersEmpty: lab("No reminders.", "நினைவூட்டல்கள் இல்லை."),
    notificationNote: lab(
      "Reminders fire only while this app is open in a browser tab. If the browser is closed they stay queued and fire the next time the app is opened.",
      "இந்தப் பயன்பாடு திறந்த உலாவித் தாளில் இருக்கும் போது மட்டுமே நினைவூட்டல்கள் செயல்படும். உலாவி மூடப்பட்டால், அடுத்த முறை பயன்பாடு திறக்கும் போது செயல்படும்."
    ),
    quickAdd: lab("Quick add", "விரைவு சேர்"),
    quickAddHint: lab(
      "Add a new event with just the essentials — fill in the rest later.",
      "அடிப்படை விவரங்களுடன் புதிய நிகழ்வைச் சேர்க்கவும் — மீதியை பின்னர் நிரப்பவும்."
    ),
  },
  moreItems: (count: number): Label => ({
    en: `${count} more`,
    ta: `${count} மேலும்`,
  }),
  search: {
    placeholder: lab("Search", "தேடு"),
    noResults: lab("No results found", "முடிவுகள் எதுவும் இல்லை"),
  },
  nav: {
    dashboard: lab("Dashboard", "டாஷ்போர்டு"),
    events: lab("Events", "நிகழ்வுகள்"),
    templates: lab("Templates", "டெம்ப்ளேட்டுகள்"),
    ingredients: lab("Ingredients", "பொருட்கள்"),
    inventoryTracker: lab("Inventory", "சரக்கிருப்பு"),
    employees: lab("Employees", "ஊழியர்கள்"),
    website: lab("Website", "இணையதளம்"),
    finance: lab("Income & Expense", "வருமானம் & செலவு"),
    settings: lab("Settings", "அமைப்புகள்"),
    more: lab("More", "மேலும்"),
  },
  common: {
    add: lab("Add", "சேர்க்க"),
    save: lab("Save", "சேமி"),
    cancel: lab("Cancel", "ரத்துசெய்"),
    delete: lab("Delete", "நீக்கு"),
    edit: lab("Edit", "திருத்து"),
    name: lab("Name", "பெயர்"),
    phone: lab("Phone", "தொலைபேசி"),
    date: lab("Date", "தேதி"),
    status: lab("Status", "நிலை"),
    payment: lab("Payment", "கட்டணம்"),
    headcount: lab("Headcount", "நபர்கள்"),
    qty: lab("Qty", "அளவு"),
    unit: lab("Unit", "அலகு"),
    price: lab("Price", "விலை"),
    actions: lab("Actions", "செயல்கள்"),
    template: lab("Template", "டெம்ப்ளேட்"),
    noDate: lab("No date", "தேதி இல்லை"),
    noAccess: lab(
      "You don't have access to this section. Ask your admin.",
      "இந்தப் பிரிவை அணுக உங்களுக்கு அனுமதி இல்லை. நிர்வாகியைத் தொடர்புகொள்ளவும்."
    ),
  },
  events: {
    addEvent: lab("Add Event", "நிகழ்வு சேர்க்க"),
    searchByName: lab("Search by name", "பெயரில் தேடு"),
    filterByDate: lab("Filter by date", "தேதி வடிகட்டு"),
    empty: lab("No events yet. Add one to get started.", "இன்னும் நிகழ்வுகள் இல்லை. தொடங்க ஒன்றைச் சேர்க்கவும்."),
    emptyFiltered: lab("No events match your filters.", "உங்கள் வடிப்பான்களுடன் எந்த நிகழ்வும் பொருந்தவில்லை."),
    deleteTitle: lab("Delete event", "நிகழ்வை நீக்கு"),
    statusAll: lab("All", "அனைத்தும்"),
    statusEnquiry: lab("Enquiry", "விசாரணை"),
    statusConfirmed: lab("Confirmed", "உறுதிசெய்யப்பட்டது"),
    statusPreparing: lab("Preparing", "தயாராகிறது"),
    statusCompleted: lab("Completed", "முடிந்தது"),
    statusPaid: lab("Paid", "செலுத்தப்பட்டது"),
    venue: lab("Venue", "இடம்"),
    venuePlaceholder: lab("e.g. Madurai function hall", "எ.கா. மதுரை மண்டபம்"),
    address: lab("Address", "முகவரி"),
    addressPlaceholder: lab("e.g. 12, Anna Nagar, Madurai", "எ.கா. 12, அண்ணா நகர், மதுரை"),
    functionType: lab("Function type", "விழா வகை"),
    ratePerPerson: lab("Rate per person", "ஒரு நபர் கட்டணம்"),
    totalAmount: lab("Total amount", "மொத்த தொகை"),
    advancePaid: lab("Advance paid", "முன்பணம்"),
    balance: lab("Balance", "மீதம்"),
    totalAmountHint: lab(
      "Total amount = rate per person × headcount. Edit it manually to override.",
      "மொத்த தொகை = ஒரு நபர் கட்டணம் × நபர்கள். மாற்ற கைமுறையாகத் திருத்தவும்."
    ),
    noIngredients: lab(
      "No ingredients yet. Select a template and set a headcount to generate the scaled ingredient list.",
      "இன்னும் பொருட்கள் இல்லை. டெம்ப்ளேட்டைத் தேர்ந்தெடுத்து நபர்களை அமைத்து பொருள் பட்டியலை உருவாக்கவும்."
    ),
    runningTotal: lab("Running total", "மொத்த தொகை"),
    assignExistingEmployee: lab("Assign existing employee", "ஏற்கனவே உள்ள ஊழியரை நியமிக்கவும்"),
    pickEmployee: lab("Pick an employee", "ஊழியரைத் தேர்ந்தெடுக்கவும்"),
    addOneOffEmployee: lab("Add one-off employee", "ஒருமுறை ஊழியர் சேர்க்கவும்"),
    defaultRateNote: lab(
      "Default rate is pre-filled from the master list and can be edited per event.",
      "இயல்பு ஊதியம் முதன்மைப் பட்டியலிலிருந்து நிரப்பப்பட்டு ஒவ்வொரு நிகழ்விலும் திருத்தலாம்."
    ),
    noEmployees: lab(
      "No employees assigned yet. Assign an existing employee or add a one-off.",
      "இன்னும் ஊழியர்கள் நியமிக்கப்படவில்லை. ஏற்கனவே உள்ள ஊழியரை நியமிக்கவும் அல்லது ஒருமுறை ஊழியரைச் சேர்க்கவும்."
    ),
    totalToPay: lab("Total to pay", "செலுத்த வேண்டிய மொத்தம்"),
    totalPaid: lab("Total paid", "செலுத்திய மொத்தம்"),
    totalPending: lab("Total pending", "நிலுவையில் உள்ள மொத்தம்"),
    vendor: lab("Vendor", "விற்பனையாளர்"),
    vendorPlaceholder: lab("Type a vendor name", "விற்பனையாளர் பெயரைத் தட்டச்சு செய்க"),
    addUtensil: lab("Add utensil", "பாத்திரம் சேர்க்க"),
    vendorNote: lab(
      "Vendor names are remembered from past entries. Add utensils with quantities and rental prices.",
      "விற்பனையாளர் பெயர்கள் முந்தைய உள்ளீடுகளிலிருந்து நினைவில் வைக்கப்படும். அளவு & வாடகை விலையுடன் பாத்திரங்களைச் சேர்க்கவும்."
    ),
    noUtensils: lab(
      "No rental items yet. Enter a vendor name and add utensils.",
      "இன்னும் வாடகை பொருட்கள் இல்லை. விற்பனையாளர் பெயரை உள்ளிட்டு பாத்திரங்களைச் சேர்க்கவும்."
    ),
    totalRentalCost: lab("Total rental cost", "மொத்த வாடகை செலவு"),
    eventDetails: lab("Event details", "நிகழ்வு விவரங்கள்"),
    customerDetails: lab("Customer details", "வாடிக்கையாளர் விவரங்கள்"),
    pricing: lab("Pricing", "விலை நிர்ணயம்"),
    selectTemplate: lab("Select a template", "டெம்ப்ளேட்டைத் தேர்ந்தெடுக்கவும்"),
    headcountNote: lab(
      "Changing the headcount or template recalculates the ingredient list below.",
      "நபர்கள் அல்லது டெம்ப்ளேட்டை மாற்றினால் கீழே உள்ள பொருள் பட்டியல் மீண்டும் கணக்கிடப்படும்."
    ),
    tabIngredients: lab("Ingredients", "பொருட்கள்"),
    tabEmployees: lab("Employees", "ஊழியர்கள்"),
    tabRental: lab("Rental", "வாடகை"),
    meals: lab("Meals", "உணவுகள்"),
    mealNumber: (n: number): Label => ({
      en: `Meal ${n}`,
      ta: `உணவு ${n}`,
    }),
    addMeal: lab("Add meal", "உணவு சேர்க்க"),
    removeMeal: lab("Remove meal", "உணவை நீக்கு"),
    noMeals: lab(
      "No meals yet. Add one to plan courses for this event.",
      "இன்னும் உணவுகள் இல்லை. இந்த நிகழ்வுக்கு உணவுகளைத் திட்டமிட ஒன்றைச் சேர்க்கவும்."
    ),
    includeCourses: lab("Include courses", "சேர்க்க வேண்டிய உணவுகள்"),
    searchCourses: lab("Search courses…", "உணவுகளைத் தேடு…"),
    selectAllCourses: lab("Select all", "அனைத்தும்"),
    clearCourses: lab("Clear", "நீக்கு"),
    selectedCount: (selected: number, total: number): Label => ({
      en: `${selected} of ${total} selected`,
      ta: `${total}-இல் ${selected} தேர்வு`,
    }),
    printPreview: lab("Print preview", "அச்சு முன்னோட்டம்"),
    printCategories: lab("Print categories", "அச்சிட வேண்டிய வகைகள்"),
    buyListPdf: lab("Buy list (qty only)", "வாங்கும் பட்டியல் (அளவு மட்டும்)"),
    detailedPdf: lab("Detailed (with price)", "விரிவானது (விலையுடன்)"),
    printNote: lab(
      "Quantity and price edits here are saved to the event. Unchecked categories are left out of the PDF.",
      "இங்கு அளவு மற்றும் விலை திருத்தங்கள் நிகழ்வில் சேமிக்கப்படும். தேர்வு நீக்கிய வகைகள் PDF-இல் வராது."
    ),
    invoice: lab("Invoice", "விலைப்பட்டியல்"),
    invoiceNo: lab("Invoice no", "விலைப்பட்டியல் எண்"),
    thankYou: lab("Thank You", "நன்றி"),
    totalHeadcount: lab("Total headcount", "மொத்த நபர்கள்"),
    pdfLanguage: lab("PDF language", "PDF மொழி"),
    pdfEnglish: lab("English", "ஆங்கிலம்"),
    pdfTamil: lab("Tamil", "தமிழ்"),
    sendBuyListWhatsApp: lab("Send buy list on WhatsApp", "வாங்கும் பட்டியலை வாட்ஸ்அப்பில் அனுப்பு"),
    sendDetailedWhatsApp: lab("Send invoice on WhatsApp", "விலைப்பட்டியலை வாட்ஸ்அப்பில் அனுப்பு"),
    whatsappNote: lab(
      "Opens WhatsApp to the customer number with the invoice summary. Attach the downloaded PDF in the chat.",
      "வாடிக்கையாளர் எண்ணுக்கு வாட்ஸ்அப் திறக்கும். பதிவிறக்கிய PDF-ஐ அரட்டையில் இணைக்கவும்."
    ),
    invalidCustomerPhone: lab(
      "Add a valid 10-digit customer phone number to the event first.",
      "முதலில் நிகழ்வில் சரியான 10 இலக்க வாடிக்கையாளர் எண்ணைச் சேர்க்கவும்."
    ),
    editEvent: lab("Edit Event", "நிகழ்வைத் திருத்து"),
    nameRequired: lab("Name is required", "பெயர் தேவை"),
    invalidPhone: lab("Enter a valid 10-digit phone number", "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்"),
    headcountMin: lab("Headcount must be 1 or more", "நபர்கள் எண்ணிக்கை 1 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    dateRequired: lab("Date is required", "தேதி தேவை"),
    pastDateError: lab("Cannot select a date in the past", "கடந்த கால தேதியைத் தேர்ந்தெடுக்க முடியாது"),
    namePlaceholder: lab("e.g. Ravi's wedding", "எ.கா. ரவியின் திருமணம்"),
    phonePlaceholder: lab("e.g. (123)-456-7890", "எ.கா. (123)-456-7890"),
    headcountPlaceholder: lab("e.g. 300", "எ.கா. 300"),
    unknownIngredient: lab("Unknown ingredient", "அறியப்படாத பொருள்"),
    toPay: lab("To pay", "செலுத்த வேண்டியது"),
    paid: lab("Paid", "செலுத்தியது"),
    pending: lab("Pending", "நிலுவை"),
    returned: lab("Returned", "திரும்பியது"),
    duration: lab("Duration", "காலம்"),
    utensil: lab("Utensil", "பாத்திரம்"),
    amountToPayPlaceholder: lab("e.g. 1200", "எ.கா. 1200"),
    saveToMaster: lab("Save to master list", "முதன்மைப் பட்டியலில் சேமி"),
    saveToMasterDesc: lab(
      "Add this employee to the master list for future events",
      "எதிர்கால நிகழ்வுகளுக்கு இந்த ஊழியரை முதன்மைப் பட்டியலில் சேர்க்கவும்"
    ),
    oneOffNamePlaceholder: lab("e.g. Mani", "எ.கா. மணி"),
    amountMin: lab("Amount must be 0 or more", "தொகை 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    selectUtensil: lab("Select utensil", "பாத்திரத்தைத் தேர்ந்தெடுக்கவும்"),
    pickFromMaster: lab("Pick from master list", "முதன்மைப் பட்டியலிலிருந்து தேர்ந்தெடுக்கவும்"),
    utensilName: lab("Utensil name", "பாத்திரத்தின் பெயர்"),
    utensilNamePlaceholder: lab("e.g. Steel plates (100 pcs)", "எ.கா. இரும்புத் தட்டுகள் (100)"),
    quantityPlaceholder: lab("e.g. 10", "எ.கா. 10"),
    rentalPrice: lab("Rental price", "வாடகை விலை"),
    rentalPricePlaceholder: lab("e.g. 500", "எ.கா. 500"),
    rentalFrom: lab("Rental from", "வாடகை தொடக்கம்"),
    rentalTo: lab("Rental to", "வாடகை இறுதி"),
    saveUtensilToMaster: lab("Save utensil to master list", "பாத்திரத்தை முதன்மைப் பட்டியலில் சேமி"),
    saveUtensilToMasterDesc: lab(
      "Add this utensil to the master list for future events",
      "எதிர்கால நிகழ்வுகளுக்கு இந்த பாத்திரத்தை முதன்மைப் பட்டியலில் சேர்க்கவும்"
    ),
    utensilNameRequired: lab("Utensil name is required", "பாத்திரத்தின் பெயர் தேவை"),
    qtyMin: lab("Quantity must be 1 or more", "அளவு 1 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    startDateRequired: lab("Start date is required", "தொடக்க தேதி தேவை"),
    endDateRequired: lab("End date is required", "இறுதி தேதி தேவை"),
    viewList: lab("List", "பட்டியல்"),
    viewCalendar: lab("Calendar", "நாட்காட்டி"),
    today: lab("Today", "இன்று"),
    prevMonth: lab("Previous month", "முந்தைய மாதம்"),
    nextMonth: lab("Next month", "அடுத்த மாதம்"),
    noEventsOnDay: lab("No events on this day.", "அன்று நிகழ்வுகள் இல்லை."),
    monthNames: [
      lab("January", "ஜனவரி"),
      lab("February", "பிப்ரவரி"),
      lab("March", "மார்ச்"),
      lab("April", "ஏப்ரல்"),
      lab("May", "மே"),
      lab("June", "ஜூன்"),
      lab("July", "ஜூலை"),
      lab("August", "ஆகஸ்ட்"),
      lab("September", "செப்டம்பர்"),
      lab("October", "அக்டோபர்"),
      lab("November", "நவம்பர்"),
      lab("December", "டிசம்பர்"),
    ],
    // Monday-first order to match the calendar grid.
    weekdayNamesShort: [
      lab("Mon", "தி"),
      lab("Tue", "செ"),
      lab("Wed", "பு"),
      lab("Thu", "வி"),
      lab("Fri", "வெ"),
      lab("Sat", "ச"),
      lab("Sun", "ஞா"),
    ],
  },
  site: {
    manager: lab("Site manager", "தள மேலாளர்"),
    business: lab("Contact", "தொடர்பு"),
    phoneNumbers: lab("Phone numbers", "தொலைபேசி எண்கள்"),
    phonePlaceholder: lab("e.g. (123)-456-7890", "எ.கா. (123)-456-7890"),
    whatsapp: lab("WhatsApp number (digits only)", "வாட்ஸ்அப் எண் (எண்கள் மட்டும்)"),
    addPhone: lab("Add phone", "தொலைபேசி சேர்க்க"),
    menus: lab("Menus", "மெனுக்கள்"),
    gallery: lab("Gallery", "புகைப்படங்கள்"),
    testimonials: lab("Testimonials", "வாடிக்கையாளர் கருத்துகள்"),
    address: lab("Office address", "அலுவலக முகவரி"),
    kindPhoto: lab("Photo link", "புகைப்பட இணைப்பு"),
    kindInstagram: lab("Instagram post", "இன்ஸ்டாகிராம் பதிவு"),
    itemUrl: lab("Link", "இணைப்பு"),
    instagramHint: lab(
      "Paste the post's Share → Copy link URL. The post must be public. Offline visitors see a link instead of the preview.",
      "பதிவின் Share → Copy link இணைப்பை ஒட்டவும். பதிவு பொதுவில் இருக்க வேண்டும்."
    ),
    invalidLink: lab("Enter a valid link.", "சரியான இணைப்பை உள்ளிடவும்."),
    photo: lab("Photo link", "புகைப்பட இணைப்பு"),
    photoPlaceholder: lab("https://…", "https://…"),
    rating: lab("Stars (1–5)", "நட்சத்திரங்கள் (1–5)"),
    source: lab("Source", "ஆதாரம்"),
    sourceManual: lab("Direct / manual", "நேரடி"),
    sourceGoogle: lab("Google review", "கூகுள் மதிப்புரை"),
    quote: lab("Review text (English)", "மதிப்புரை (ஆங்கிலம்)"),
    quoteTa: lab("Review text (Tamil, optional)", "மதிப்புரை (தமிழ்)"),
    author: lab("Author name", "எழுதியவர் பெயர்"),
    occasion: lab("Occasion", "நிகழ்வு"),
    place: lab("Place", "இடம்"),
    price: lab("Price per leaf (₹, 0 hides price)", "இலை விலை (₹, 0 எனில் மறைக்கும்)"),
    courses: lab("Courses", "உணவு வகைகள்"),
    itemsOnePerLine: lab("Items, one per line (English | Tamil)", "உணவுகள், வரிக்கு ஒன்று (ஆங்கிலம் | தமிழ்)"),
    caption: lab("Caption", "தலைப்பு"),
    category: lab("Category", "வகை"),
    tag: lab("Tagline", "குறிச்சொல்"),
    description: lab("Description", "விளக்கம்"),
    linkedTemplate: lab("Linked event template (optional)", "இணைக்கப்பட்ட டெம்ப்ளேட்"),
    preview: lab("Live preview (what visitors see)", "நேரடி முன்னோட்டம்"),
    publish: lab("Publish to website", "இணையதளத்தில் வெளியிடு"),
    pull: lab("Load from database", "தரவுத்தளத்திலிருந்து ஏற்று"),
    lastPublished: lab("Last published", "கடைசியாக வெளியிட்டது"),
    neverPublished: lab("Not published yet.", "இன்னும் வெளியிடவில்லை."),
    pullTitle: lab("Load from database", "தரவுத்தளத்திலிருந்து ஏற்று"),
    pullMessage: lab(
      "Replace local edits with the live website content? Unsaved local changes will be lost.",
      "உள்ளூர் திருத்தங்களை நேரடி உள்ளடக்கத்தால் மாற்றவா?"
    ),
    publishFailed: lab("Publish failed. Try again.", "வெளியிட முடியவில்லை. மீண்டும் முயற்சிக்கவும்."),
    dbMissing: lab(
      "Database not connected. Add DATABASE_URL on the server first.",
      "தரவுத்தளம் இணைக்கப்படவில்லை. முதலில் சர்வரில் DATABASE_URL சேர்க்கவும்."
    ),
    profileUrl: lab("Google profile link (optional)", "கூகுள் சுயவிவர இணைப்பு"),
    invalidPhoneList: lab("Fix highlighted phone numbers.", "தொலைபேசி எண்களைச் சரிசெய்க."),
    emptyMenus: lab("No menus yet. Add one to get started.", "இன்னும் மெனுக்கள் இல்லை."),
    emptyGallery: lab("No photos yet. Add one to get started.", "இன்னும் புகைப்படங்கள் இல்லை."),
    emptyTestimonials: lab("No testimonials yet. Add one to get started.", "இன்னும் கருத்துகள் இல்லை."),
  },
  reminders: {
    title: lab("Reminders", "நினைவூட்டல்கள்"),
    phone: lab("Phone", "தொலைபேசி"),
    note: lab("Note", "குறிப்பு"),
    phonePlaceholder: lab("e.g. (123)-456-7890", "எ.கா. (123)-456-7890"),
    notePlaceholder: lab("e.g. Follow up on quote", "எ.கா. மேற்கோள் பற்றி தொடர்பு"),
    remindIn: lab("Remind in", "மீண்டும் நினைவூட்டு"),
    in30min: lab("In 30 minutes", "30 நிமிடத்தில்"),
    in1hr: lab("In 1 hour", "1 மணி நேரத்தில்"),
    customTime: lab("Custom time", "தனிப்பயன் நேரம்"),
    time: lab("Time", "நேரம்"),
    add: lab("Add reminder", "நினைவூட்டல் சேர்க்க"),
    dismiss: lab("Dismiss reminder", "நினைவூட்டலை நிராகரி"),
    invalidPhone: lab("Enter a valid 10-digit phone number", "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்"),
  },
  ingredients: {
    addIngredient: lab("Add Ingredient", "பொருள் சேர்க்க"),
    empty: lab("No ingredients yet. Add one to get started.", "இன்னும் பொருட்கள் இல்லை. தொடங்க ஒன்றைச் சேர்க்கவும்."),
    noMatch: lab("No ingredients match your search.", "உங்கள் தேடலுடன் எந்தப் பொருளும் பொருந்தவில்லை."),
    deleteTitle: lab("Delete ingredient", "பொருளை நீக்கு"),
    editTitle: lab("Edit Ingredient", "பொருளைத் திருத்து"),
    searchIngredients: lab("Search ingredients", "பொருட்களைத் தேடு"),
    tamilName: lab("Tamil name", "தமிழ் பெயர்"),
    tamilNamePlaceholder: lab("e.g. அரிசி", "எ.கா. அரிசி"),
    namePlaceholder: lab("e.g. Rice", "எ.கா. அரிசி"),
    selectUnit: lab("Select a unit", "அலகைத் தேர்ந்தெடுக்கவும்"),
    globalPrice: lab("Global price", "உலகளாவிய விலை"),
    globalPricePlaceholder: lab("e.g. 150", "எ.கா. 150"),
    unitPrefix: lab("Unit:", "அலகு:"),
    note: lab("Note", "குறிப்பு"),
    notePlaceholder: lab("e.g. Market, vendor", "எ.கா. சந்தை, விற்பனையாளர்"),
    englishName: lab("English name", "ஆங்கிலப் பெயர்"),
    category: lab("Category", "வகை"),
    selectTag: lab("Select a category", "வகையைத் தேர்ந்தெடுக்கவும்"),
    autoFillHint: lab("Typing an English or Tanglish name fills the Tamil name automatically.", "ஆங்கிலம் அல்லது டாங்லிஷ் பெயரைத் தட்டச்சு செய்தால் தமிழ் பெயர் தானாக நிரம்பும்."),
    tags: {
      all: lab("All", "அனைத்தும்"),
      grocery: lab("Grocery", "மளிகை"),
      vegetables: lab("Vegetables", "காய்கறிகள்"),
      "masala-spices": lab("Masala / Spices", "மசாலா / மசாலாப் பொருட்கள்"),
      vessel: lab("Vessel", "பாத்திரங்கள்"),
      "meat-fish": lab("Meat & Fish", "இறைச்சி & மீன்"),
      fuel: lab("Fuel", "எரிபொருள்"),
    },
  },
  tracker: {
    title: lab("Inventory", "சரக்கிருப்பு"),
    subtitle: lab(
      "Purchases logged to the stock ledger, filtered by date.",
      "சரக்கு பதிவேட்டில் பதிவான கொள்முதல்கள், தேதி வாரியாக."
    ),
    thisWeek: lab("This week", "இந்த வாரம்"),
    thisMonth: lab("This month", "இந்த மாதம்"),
    custom: lab("Custom", "தனிப்பயன்"),
    from: lab("From", "முதல்"),
    to: lab("To", "வரை"),
    totalSpent: lab("Total spent", "மொத்த செலவு"),
    entries: (count: number): Label => ({
      en: `${count} ${count === 1 ? "purchase" : "purchases"}`,
      ta: `${count} கொள்முதல்கள்`,
    }),
    cost: lab("Cost", "செலவு"),
    noPrice: lab("Price not recorded", "விலை பதிவாகவில்லை"),
    empty: lab(
      "No purchases in this range. Log one to get started.",
      "இந்த காலத்தில் கொள்முதல்கள் இல்லை. ஒன்றைப் பதிவு செய்யவும்."
    ),
    invalidRange: lab(
      "Start date must be on or before the end date.",
      "தொடக்க தேதி முடிவு தேதிக்கு முன் இருக்க வேண்டும்."
    ),
    logPurchase: lab("Log purchase", "கொள்முதல் பதிவு"),
    logTitle: lab("Log a purchase", "கொள்முதலைப் பதிவு செய்க"),
    selectIngredient: lab("Select ingredient", "பொருளைத் தேர்ந்தெடுக்கவும்"),
    linkEvent: lab("Linked event (optional)", "இணைக்கப்பட்ட நிகழ்வு (விருப்பம்)"),
    noEvent: lab("No event", "நிகழ்வு இல்லை"),
    assignToEvent: lab("Assign to event", "நிகழ்வுக்கு ஒதுக்கு"),
    assignTitle: lab("Assign items to event", "நிகழ்வுக்கு பொருட்களை ஒதுக்கு"),
    selectEvent: lab("Select event", "நிகழ்வைத் தேர்ந்தெடுக்கவும்"),
    addItem: lab("Add item", "பொருள் சேர்"),
    noItems: lab("No items added yet.", "இன்னும் பொருட்கள் சேர்க்கப்படவில்லை."),    qtyMin: lab("Quantity must be more than 0", "அளவு 0-ஐ விட அதிகமாக இருக்க வேண்டும்"),
    priceMin: lab("Price must be 0 or more", "விலை 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    pricePlaceholder: lab("e.g. 150", "எ.கா. 150"),
    dateRequired: lab("Date is required", "தேதி தேவை"),
  },
  templates: {
    addTemplate: lab("Add Template", "டெம்ப்ளேட் சேர்க்க"),
    empty: lab("No templates yet. Add one to get started.", "இன்னும் டெம்ப்ளேட்டுகள் இல்லை. தொடங்க ஒன்றைச் சேர்க்கவும்."),
    deleteTitle: lab("Delete template", "டெம்ப்ளேட்டை நீக்கு"),
    editTitle: lab("Edit Template", "டெம்ப்ளேட்டைத் திருத்து"),
    nameRequired: lab("Name is required", "பெயர் தேவை"),
    namePlaceholder: lab("e.g. Wedding lunch", "எ.கா. திருமண மதிய உணவு"),
    englishName: lab("English name", "ஆங்கிலப் பெயர்"),
    tamilName: lab("Tamil name", "தமிழ் பெயர்"),
    englishNamePlaceholder: lab("e.g. Saapadu", "எ.கா. சாப்பாடு"),
    tamilNamePlaceholder: lab("e.g. சாப்பாடு", "எ.கா. சாப்பாடு"),
    dishEnglishPlaceholder: lab("e.g. Sambar", "எ.கா. சாம்பார்"),
    dishTamilPlaceholder: lab("e.g. சாம்பார்", "எ.கா. சாம்பார்"),
    searchTemplates: lab(
      "Search templates or dishes inside them…",
      "டெம்ப்ளேட் அல்லது அதிலுள்ள உணவுகளைத் தேடு…"
    ),
    noMatch: lab(
      "No templates match your search.",
      "உங்கள் தேடலுடன் எந்த டெம்ப்ளேட்டும் பொருந்தவில்லை."
    ),
    importLegacy: lab("Import old app", "பழைய செயலியிலிருந்து இறக்கு"),
    importLegacyNote: lab(
      "Adds every meal, course and ingredient from the old app. Existing entries are skipped, never duplicated.",
      "பழைய செயலியிலிருந்து அனைத்து உணவு, வகை மற்றும் பொருட்களைச் சேர்க்கிறது. ஏற்கனவே உள்ளவை தவிர்க்கப்படும்."
    ),
    dish: lab("Dish", "உணவு"),
    dishes: lab("Dishes", "உணவுகள்"),
    ingredients: lab("Ingredients", "பொருட்கள்"),
    dishName: lab("Dish name", "உணவின் பெயர்"),
    dishNameRequired: lab("Dish name is required", "உணவின் பெயர் தேவை"),
    dishNamePlaceholder: lab("e.g. Chicken biryani", "எ.கா. சிக்கன் பிரியாணி"),
    ingredientRequired: lab("Select an ingredient", "பொருளைத் தேர்ந்தெடுக்கவும்"),
    noDishes: lab(
      "No dishes yet. Add one to start attaching ingredients.",
      "இன்னும் உணவுகள் இல்லை. பொருட்களைச் சேர்க்க ஒன்றைச் சேர்க்கவும்."
    ),
    noIngredientsOnDish: lab("No ingredients on this dish yet.", "இந்த உணவில் இன்னும் பொருட்கள் இல்லை."),
    selectIngredient: lab("Select ingredient", "பொருளைத் தேர்ந்தெடுக்கவும்"),
    ingredient: lab("Ingredient", "பொருள்"),
    qtyPer100: lab("Qty / 100", "அளவு / 100"),
    qtyPlaceholder: lab("Qty", "அளவு"),
    qtyMin: lab("Qty must be 0 or more", "அளவு 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    addIngredient: lab("Add ingredient", "பொருள் சேர்க்க"),
    addDish: lab("Add dish", "உணவு சேர்க்க"),
  },
  employees: {
    addEmployee: lab("Add Employee", "ஊழியர் சேர்க்க"),
    empty: lab("No employees yet. Add one to get started.", "இன்னும் ஊழியர்கள் இல்லை. தொடங்க ஒன்றைச் சேர்க்கவும்."),
    deleteTitle: lab("Delete employee", "ஊழியரை நீக்கு"),
    editTitle: lab("Edit Employee", "ஊழியரைத் திருத்து"),
    nameRequired: lab("Name is required", "பெயர் தேவை"),
    invalidPhone: lab("Enter a valid 10-digit phone number", "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்"),
    phonePlaceholder: lab("e.g. (123)-456-7890", "எ.கா. (123)-456-7890"),
    namePlaceholder: lab("e.g. Ravi", "எ.கா. ரவி"),
    defaultRate: lab("Default rate", "இயல்பு ஊதியம்"),
    ratePlaceholder: lab("e.g. 1500", "எ.கா. 1500"),
    rateMin: lab("Rate must be 0 or more", "விகிதம் 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    ratePrefix: lab("Rate:", "விகிதம்:"),
    accounts: lab("Logins & access", "உள்நுழைவுகள் & அணுகல்"),
    createLogin: lab("Create login", "உள்நுழைவு உருவாக்கு"),
    loginUsername: lab("Login username", "உள்நுழைவு பயனர் பெயர்"),
    tempPassword: lab("Temporary password (min 8)", "தற்காலிக கடவுச்சொல் (குறைந்தது 8)"),
    linkEmployee: lab("Link to employee (optional)", "ஊழியருடன் இணை (விருப்பம்)"),
    noEmployeeLink: lab("Standalone login", "தனி உள்நுழைவு"),
    adminBadge: lab("Admin", "நிர்வாகி"),
    permViewFinance: lab("See income & expenses", "வருமானம் & செலவு பார்க்க"),
    permViewRates: lab("See others' pay", "மற்றவர் ஊதியம் பார்க்க"),
    permViewEmployees: lab("See employees", "ஊழியர்களைப் பார்க்க"),
    permViewWebsite: lab("See website", "இணையதளம் பார்க்க"),
    permExportExcel: lab("Export to Excel", "எக்செல் ஏற்றுமதி"),
    permManageEmployees: lab("Manage employees & logins", "ஊழியர்கள் & உள்நுழைவுகள்"),
    permManageSettings: lab("Manage settings", "அமைப்புகள்"),
    removeLogin: lab("Remove login", "உள்நுழைவை நீக்கு"),
    noLogins: lab("No employee logins yet.", "இன்னும் ஊழியர் உள்நுழைவுகள் இல்லை."),
  },
  settings: {
    uiLanguage: lab("UI language", "இடைமுக மொழி"),
    uiLanguageNote: lab(
      "Choose how labels are shown across the app interface.",
      "பயன்பாட்டு இடைமுகத்தில் லேபிள்கள் எவ்வாறு காட்டப்படும் என்பதைத் தேர்ந்தெடுக்கவும்."
    ),
    english: lab("English", "ஆங்கிலம்"),
    tamil: lab("Tamil", "தமிழ்"),
    defaultLanguage: lab("Document language", "ஆவண மொழி"),
    defaultLanguageNote: lab(
      "Used for exported PDF documents.",
      "ஏற்றுமதி செய்யப்படும் PDF ஆவணங்களுக்குப் பயன்படுகிறது."
    ),
    exportExcel: lab("Export to Excel", "எக்செல் ஏற்றுமதி"),
    exportExcelNote: lab(
      "Download the whole database as one .xlsx file, one sheet per section.",
      "முழு தரவுத்தளத்தையும் ஒரு .xlsx கோப்பாகப் பதிவிறக்கவும், ஒவ்வொரு பிரிவிற்கும் ஒரு தாள்."
    ),
    exportExcelButton: lab("Download Excel", "எக்செல் பதிவிறக்கு"),
    exportExcelWorking: lab("Preparing download…", "பதிவிறக்கம் தயாராகிறது…"),
    exportExcelDone: lab("Excel file downloaded.", "எக்செல் கோப்பு பதிவிறக்கப்பட்டது."),
    exportExcelFailed: lab(
      "Export failed. Please try again.",
      "ஏற்றுமதி தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்."
    ),
    dark: lab("Dark", "இருள்"),
  },
  finance: {
    income: lab("Income", "வருமானம்"),
    expenses: lab("Expenses", "செலவுகள்"),
    profit: lab("Profit", "லாபம்"),
    eventCollections: lab("Event collections", "நிகழ்வு வசூல்"),
    otherIncome: lab("Other income", "மற்ற வருமானம்"),
    eventCosts: lab("Event costs", "நிகழ்வு செலவுகள்"),
    manualExpenses: lab("Other expenses", "மற்ற செலவுகள்"),
    addExpense: lab("Add Expense", "செலவு சேர்க்க"),
    addOtherIncome: lab("Add Other Income", "மற்ற வருமானம் சேர்க்க"),
    category: lab("Category", "வகை"),
    selectCategory: lab("Select a category", "வகையைத் தேர்ந்தெடுக்கவும்"),
    amount: lab("Amount", "தொகை"),
    amountPlaceholder: lab("e.g. 5000", "எ.கா. 5000"),
    note: lab("Note", "குறிப்பு"),
    notePlaceholder: lab("e.g. Market purchase", "எ.கா. சந்தை கொள்முதல்"),
    month: lab("Month", "மாதம்"),
    salaryNote: lab(
      "Staff salary is intentionally not an expense category here — it is already captured per event through the Employees tab. Recording it here too would count it twice against profit.",
      "ஊழியர் சம்பளம் இங்கு வேண்டுமென்றே செலவு வகையாக இல்லை — ஒவ்வொரு நிகழ்விலும் ஊழியர்கள் தாவல் வழியாக ஏற்கனவே கணக்கிடப்படுகிறது. இங்கும் சேர்த்தால் லாபத்தில் இருமுறை கணக்கிடப்படும்."
    ),
    noExpenses: lab(
      "No expenses in this period.",
      "இந்தக் காலத்தில் செலவுகள் இல்லை."
    ),
    noOtherIncome: lab(
      "No other income in this period.",
      "இந்தக் காலத்தில் மற்ற வருமானம் இல்லை."
    ),
    deleteEntry: lab("Delete entry", "பதிவை நீக்கு"),
    noAccess: lab(
      "You don't have access to income & expenses. Ask the admin for access.",
      "வருமானம் & செலவுகளைப் பார்க்க உங்களுக்கு அணுகல் இல்லை. நிர்வாகியைத் தொடர்பு கொள்ளவும்."
    ),
    entries: (count: number): Label => ({
      en: `${count} ${count === 1 ? "entry" : "entries"}`,
      ta: `${count} பதிவுகள்`,
    }),
    categories: {
      "food materials": lab("Food materials", "உணவு பொருட்கள்"),
      "other expenses": lab("Other expenses", "பிற செலவுகள்"),
      electricity: lab("Electricity", "மின்சாரம்"),
      transport: lab("Transport", "போக்குவரத்து"),
      gas: lab("Gas", "எரிவாயு"),
      custom: lab("Custom", "தனிப்பயன்"),
    },
  },
  offline: {
    title: lab("You are offline", "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்"),
    line1: lab(
      "The app shell is available. Your localStorage data can still be accessed.",
      "பயன்பாட்டு ஷெல் கிடைக்கிறது. உங்கள் localStorage தரவு இன்னும் அணுகலாம்."
    ),
    line2: lab("Reconnect to the network to load all features.", "அனைத்து அம்சங்களுக்கும் நெட்வொர்க்குடன் மீண்டும் இணையவும்."),
  },
  autoMsg: {
    paymentThanks: lab("Payment received — thank you!", "கட்டணம் பெறப்பட்டது — நன்றி!"),
    amountPaid: lab("Amount paid", "செலுத்திய தொகை"),
  },
  feedback: {
    title: lab("Customer feedback", "வாடிக்கையாளர் கருத்து"),
    subtitle: lab(
      "Ask the customer for a star rating and a short review, then save it to the website testimonials.",
      "வாடிக்கையாளரிடம் நட்சத்திர மதிப்பீடு மற்றும் கருத்தைக் கேட்டு, இணையதள கருத்துகளில் சேமிக்கவும்."
    ),
    rating: lab("Rating", "மதிப்பீடு"),
    review: lab("Review", "கருத்து"),
    reviewPlaceholder: lab("e.g. Excellent food and service!", "எ.கா. அருமையான உணவு மற்றும் சேவை!"),
    author: lab("Customer name", "வாடிக்கையாளர் பெயர்"),
    skip: lab("Skip", "தவிர்"),
  },
  autoRemind: {
    eventTomorrow: lab("Event tomorrow", "நாளை நிகழ்வு"),
    eventTomorrowDetail: (name: string): Label => ({
      en: `${name} is tomorrow — time to prepare.`,
      ta: `${name} நாளை — தயாராகுங்கள்.`,
    }),
    paymentOverdue: lab("Payment overdue", "கட்டணம் தாமதம்"),
    paymentOverdueDetail: (name: string, amount: string): Label => ({
      en: `${name}: ${amount} pending over a week after the event.`,
      ta: `${name}: நிகழ்வுக்குப் பிறகு ஒரு வாரத்திற்கும் மேலாக ${amount} நிலுவை.`,
    }),
  },
  auth: {
    title: lab("Sign in", "உள்நுழைக"),
    subtitle: lab(
      "Sign in to manage your catering events.",
      "உங்கள் கேட்டரிங் நிகழ்வுகளை நிர்வகிக்க உள்நுழையவும்."
    ),
    username: lab("Username", "பயனர் பெயர்"),
    password: lab("Password", "கடவுச்சொல்"),
    signIn: lab("Sign in", "உள்நுழைக"),
    invalidCredentials: lab(
      "Invalid username or password.",
      "தவறான பயனர் பெயர் அல்லது கடவுச்சொல்."
    ),
    capsLockOn: lab("Caps Lock is on", "Caps Lock இயக்கத்தில் உள்ளது"),
    logout: lab("Log out", "வெளியேறு"),
  },
  deleteConfirm: (name: string): Label => ({
    en: `Are you sure you want to delete "${name}"?`,
    ta: `"${name}"-ஐ நீக்க விரும்புகிறீர்களா?`,
  }),
  guests: (count: number): Label => ({
    en: `${count} guests`,
    ta: `${count} விருந்தினர்கள்`,
  }),
  eventsCount: (count: number): Label => ({
    en: `${count} ${count === 1 ? "event" : "events"}`,
    ta: `${count} நிகழ்வுகள்`,
  }),
  dishesTitle: (count: number): Label => ({
    en: `${count} ${count === 1 ? "dish" : "dishes"}`,
    ta: `${count} உணவுகள்`,
  }),
  ingredientsCount: (count: number): Label => ({
    en: `${count} ${count === 1 ? "ingredient" : "ingredients"}`,
    ta: `${count} பொருட்கள்`,
  }),
  dishNumber: (n: number): Label => ({
    en: `Dish ${n}`,
    ta: `உணவு ${n}`,
  }),
} as const;

/** Selects the preferred language from a bilingual label. */
export function preferredText(
  label: Label | undefined | null,
  preference: "en" | "ta"
): string {
  if (!label) {
    if (process.env.NODE_ENV !== "production") {
      console.error("preferredText called with a missing label", new Error().stack);
    }
    return "";
  }
  return preference === "ta" ? (label.ta || label.en) : label.en;
}
