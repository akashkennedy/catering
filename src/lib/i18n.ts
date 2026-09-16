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
    totalEarnings: lab("Total earnings", "மொத்த வருவாய்"),
    earningsThisMonth: lab("This month", "இந்த மாதம்"),
    earningsAllTime: lab("All time", "அனைத்து நேரம்"),
    earningsEmpty: lab("No earnings to show yet.", "இன்னும் காட்ட வருவாய் இல்லை."),
    paymentOverview: lab("Payment status", "கட்டண நிலை"),
    clientPending: lab("Client pending", "வாடிக்கையாளர் நிலுவை"),
    employeePending: lab("Employee pending", "ஊழியர் நிலுவை"),
    paymentEmpty: lab("No pending payments.", "நிலுவை கட்டணங்கள் இல்லை."),
    inventoryAlerts: lab("Inventory alerts", "பொருள் எச்சரிக்கைகள்"),
    inventoryEmpty: lab(
      "All ingredients are above their low-stock threshold.",
      "அனைத்து பொருட்களும் குறைந்த இருப்பு எல்லைக்கு மேல் உள்ளன."
    ),
    utensilsNotReturned: lab("Utensils not yet returned", "திரும்பப் பெறாத பாத்திரங்கள்"),
    utensilsEmpty: lab("No outstanding rentals.", "நிலுவையில் உள்ள வாடகை இல்லை."),
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
  nav: {
    dashboard: lab("Dashboard", "டாஷ்போர்டு"),
    events: lab("Events", "நிகழ்வுகள்"),
    templates: lab("Templates", "டெம்ப்ளேட்டுகள்"),
    ingredients: lab("Ingredients", "பொருட்கள்"),
    employees: lab("Employees", "ஊழியர்கள்"),
    rental: lab("Rental", "வாடகை"),
    calculator: lab("Calculator", "கணக்கீட்டாளர்"),
    settings: lab("Settings", "அமைப்புகள்"),
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
  },
  calculator: {
    title: lab("Pricing calculator", "விலை கணக்கீடு"),
    subtitle: lab(
      "Estimate raw ingredient cost and a suggested quote price from a template. Nothing is saved until you convert.",
      "டெம்ப்ளேட்டிலிருந்து மூலப் பொருள் செலவு மற்றும் பரிந்துரைக்கப்பட்ட மேற்கோள் விலையை மதிப்பிடவும்."
    ),
    markup: lab("Markup %", "லாப சதவீதம் %"),
    rawCost: lab("Raw ingredient cost", "மூலப் பொருள் செலவு"),
    suggestedQuote: lab("Suggested quote price", "பரிந்துரைக்கப்பட்ட மேற்கோள் விலை"),
    convertToEvent: lab("Convert to event", "நிகழ்வாக மாற்று"),
    convertNote: lab(
      "Picks these values into a new event form — add the remaining details there.",
      "இந்த மதிப்புகளை புதிய நிகழ்வு படிவத்தில் நிரப்பும் — மீதமுள்ள விவரங்களை அங்கு சேர்க்கவும்."
    ),
    noTemplate: lab(
      "Select a template and enter a headcount to see the estimate.",
      "மதிப்பீட்டைக் காண டெம்ப்ளேட்டைத் தேர்ந்தெடுத்து நபர்களை உள்ளிடவும்."
    ),
    markupNote: lab(
      "Quoted price = raw cost × (1 + markup %).",
      "மேற்கோள் விலை = மூல செலவு × (1 + லாபம் %)."
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
    selectTemplate: lab("Select a template", "டெம்ப்ளேட்டைத் தேர்ந்தெடுக்கவும்"),
    headcountNote: lab(
      "Changing the headcount or template recalculates the ingredient list below.",
      "நபர்கள் அல்லது டெம்ப்ளேட்டை மாற்றினால் கீழே உள்ள பொருள் பட்டியல் மீண்டும் கணக்கிடப்படும்."
    ),
    tabIngredients: lab("Ingredients", "பொருட்கள்"),
    tabEmployees: lab("Employees", "ஊழியர்கள்"),
    tabRental: lab("Rental", "வாடகை"),
    generatePdf: lab("Generate PDF", "PDF உருவாக்கு"),
    editEvent: lab("Edit Event", "நிகழ்வைத் திருத்து"),
    nameRequired: lab("Name is required", "பெயர் தேவை"),
    invalidPhone: lab("Enter a valid 10-digit Indian mobile number", "சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்"),
    headcountMin: lab("Headcount must be 1 or more", "நபர்கள் எண்ணிக்கை 1 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    dateRequired: lab("Date is required", "தேதி தேவை"),
    pastDateError: lab("Cannot select a date in the past", "கடந்த கால தேதியைத் தேர்ந்தெடுக்க முடியாது"),
    namePlaceholder: lab("e.g. Ravi's wedding", "எ.கா. ரவியின் திருமணம்"),
    phonePlaceholder: lab("e.g. 9876543210", "எ.கா. 9876543210"),
    headcountPlaceholder: lab("e.g. 300", "எ.கா. 300"),
    used: lab("Used", "பயன்படுத்தப்பட்டது"),
    markUsed: lab("Mark used", "பயன்படுத்தப்பட்டதாகக் குறி"),
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
  },
  reminders: {
    title: lab("Reminders", "நினைவூட்டல்கள்"),
    phone: lab("Phone", "தொலைபேசி"),
    note: lab("Note", "குறிப்பு"),
    phonePlaceholder: lab("e.g. 9876543210", "எ.கா. 9876543210"),
    notePlaceholder: lab("e.g. Follow up on quote", "எ.கா. மேற்கோள் பற்றி தொடர்பு"),
    remindIn: lab("Remind in", "மீண்டும் நினைவூட்டு"),
    in30min: lab("In 30 minutes", "30 நிமிடத்தில்"),
    in1hr: lab("In 1 hour", "1 மணி நேரத்தில்"),
    customTime: lab("Custom time", "தனிப்பயன் நேரம்"),
    time: lab("Time", "நேரம்"),
    add: lab("Add reminder", "நினைவூட்டல் சேர்க்க"),
    dismiss: lab("Dismiss reminder", "நினைவூட்டலை நிராகரி"),
    invalidPhone: lab("Enter a valid 10-digit Indian mobile number", "சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்"),
  },
  ingredients: {
    addIngredient: lab("Add Ingredient", "பொருள் சேர்க்க"),
    empty: lab("No ingredients yet. Add one to get started.", "இன்னும் பொருட்கள் இல்லை. தொடங்க ஒன்றைச் சேர்க்கவும்."),
    deleteTitle: lab("Delete ingredient", "பொருளை நீக்கு"),
    editTitle: lab("Edit Ingredient", "பொருளைத் திருத்து"),
    nameRequired: lab("Name is required", "பெயர் தேவை"),
    tamilName: lab("Tamil name", "தமிழ் பெயர்"),
    tamilNamePlaceholder: lab("e.g. அரிசி", "எ.கா. அரிசி"),
    namePlaceholder: lab("e.g. Rice", "எ.கா. அரிசி"),
    selectUnit: lab("Select a unit", "அலகைத் தேர்ந்தெடுக்கவும்"),
    unitRequired: lab("Unit is required", "அலகு தேவை"),
    qtyPlaceholder: lab("e.g. 5", "எ.கா. 5"),
    qtyMin: lab("Qty must be 0 or more", "அளவு 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    globalPrice: lab("Global price", "உலகளாவிய விலை"),
    globalPricePlaceholder: lab("e.g. 150", "எ.கா. 150"),
    priceMin: lab("Price must be 0 or more", "விலை 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    unitPrefix: lab("Unit:", "அலகு:"),
    pricePrefix: lab("Price:", "விலை:"),
    openingStock: lab("Opening stock", "ஆரம்ப இருப்பு"),
    lowStockThreshold: lab("Low stock threshold", "குறைந்த இருப்பு எல்லை"),
    openingStockPlaceholder: lab("e.g. 0", "எ.கா. 0"),
    thresholdPlaceholder: lab("e.g. 5", "எ.கா. 5"),
    inStock: lab("In stock:", "இருப்பில்:"),
    remaining: lab("Remaining", "மீதமுள்ள"),
    lowStock: lab("Low stock", "குறைந்த இருப்பு"),
    logPurchase: lab("Log purchase", "வாங்குதலைப் பதிவுசெய்"),
    purchaseTitle: lab("Log purchased quantity", "வாங்கிய அளவைப் பதிவுசெய்"),
    purchaseQty: lab("Purchased qty", "வாங்கிய அளவு"),
    note: lab("Note", "குறிப்பு"),
    notePlaceholder: lab("e.g. Market, vendor", "எ.கா. சந்தை, விற்பனையாளர்"),
    purchaseNote: lab(
      "Adds to the ingredient's remaining stock.",
      "பொருளின் மீதமுள்ள இருப்பை அதிகரிக்கிறது."
    ),
  },
  templates: {
    addTemplate: lab("Add Template", "டெம்ப்ளேட் சேர்க்க"),
    empty: lab("No templates yet. Add one to get started.", "இன்னும் டெம்ப்ளேட்டுகள் இல்லை. தொடங்க ஒன்றைச் சேர்க்கவும்."),
    deleteTitle: lab("Delete template", "டெம்ப்ளேட்டை நீக்கு"),
    editTitle: lab("Edit Template", "டெம்ப்ளேட்டைத் திருத்து"),
    nameRequired: lab("Name is required", "பெயர் தேவை"),
    namePlaceholder: lab("e.g. Wedding lunch", "எ.கா. திருமண மதிய உணவு"),
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
    invalidPhone: lab("Enter a valid 10-digit Indian mobile number", "சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்"),
    phonePlaceholder: lab("e.g. 9876543210", "எ.கா. 9876543210"),
    namePlaceholder: lab("e.g. Ravi", "எ.கா. ரவி"),
    defaultRate: lab("Default rate", "இயல்பு ஊதியம்"),
    ratePlaceholder: lab("e.g. 1500", "எ.கா. 1500"),
    rateMin: lab("Rate must be 0 or more", "விகிதம் 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    ratePrefix: lab("Rate:", "விகிதம்:"),
  },
  utensils: {
    addUtensil: lab("Add Utensil", "பாத்திரம் சேர்க்க"),
    empty: lab("No utensils yet. Add one to get started.", "இன்னும் பாத்திரங்கள் இல்லை. தொடங்க ஒன்றைச் சேர்க்கவும்."),
    deleteTitle: lab("Delete utensil", "பாத்திரத்தை நீக்கு"),
    editTitle: lab("Edit Utensil", "பாத்திரத்தைத் திருத்து"),
    namePlaceholder: lab("e.g. Steel plate", "எ.கா. இரும்புத் தட்டு"),
    nameRequired: lab("Name is required", "பெயர் தேவை"),
    rentPrice: lab("Reference rent price", "குறிப்பு வாடகை விலை"),
    rentPricePlaceholder: lab("e.g. 20", "எ.கா. 20"),
    rentPriceMin: lab("Price must be 0 or more", "விலை 0 அல்லது அதற்கு மேல் இருக்க வேண்டும்"),
    refPricePrefix: lab("Reference rent price:", "குறிப்பு வாடகை விலை:"),
  },
  settings: {
    uiLanguage: lab("UI language", "இடைமுக மொழி"),
    uiLanguageNote: lab(
      "Choose how labels are shown across the app interface.",
      "பயன்பாட்டு இடைமுகத்தில் லேபிள்கள் எவ்வாறு காட்டப்படும் என்பதைத் தேர்ந்தெடுக்கவும்."
    ),
    english: lab("English", "ஆங்கிலம்"),
    tamil: lab("Tamil", "தமிழ்"),
    both: lab("Both", "இரண்டும்"),
    defaultLanguage: lab("Document language", "ஆவண மொழி"),
    defaultLanguageNote: lab(
      "Used for exported PDF documents.",
      "ஏற்றுமதி செய்யப்படும் PDF ஆவணங்களுக்குப் பயன்படுகிறது."
    ),
    ingredientPrices: lab("Ingredient prices", "பொருள் விலைகள்"),
    ingredientPricesNote: lab(
      "Edit the global price used as the default when planning events.",
      "நிகழ்வு திட்டமிடும்போது இயல்பாகப் பயன்படும் உலகளாவிய விலையைத் திருத்தவும்."
    ),
    noIngredients: lab(
      "No ingredients yet. Add them from the Ingredients page.",
      "இன்னும் பொருட்கள் இல்லை. பொருட்கள் பக்கத்திலிருந்து சேர்க்கவும்."
    ),
  },
  offline: {
    title: lab("You are offline", "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்"),
    line1: lab(
      "The app shell is available. Your localStorage data can still be accessed.",
      "பயன்பாட்டு ஷெல் கிடைக்கிறது. உங்கள் localStorage தரவு இன்னும் அணுகலாம்."
    ),
    line2: lab("Reconnect to the network to load all features.", "அனைத்து அம்சங்களுக்கும் நெட்வொர்க்குடன் மீண்டும் இணையவும்."),
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

export function labelText(label: Label): string {
  return `${label.en} · ${label.ta}`;
}