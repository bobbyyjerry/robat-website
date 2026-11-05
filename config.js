/* ============================================================
   ROBAT — BUSINESS CONFIGURATION (single source of truth)
   ------------------------------------------------------------
   Every page reads store status, contact details, and policy
   text from this object instead of hardcoding it. Fields marked
   null/placeholder are NOT YET CONFIRMED — do not invent values
   for them. Until they are filled in, the site stays in
   "reservation" mode and the live-checkout code path stays
   disabled (see storeMode below).
   ============================================================ */
var ROBAT_CONFIG = {
  // "catalogue" = browse only, no ordering.
  // "reservation" = customers can request a reservation via WhatsApp;
  //                 this is NOT a completed purchase.
  // "live" = real payment processing is wired up server-side.
  // "live" now means the cart/checkout code is present. Whether customers
  // can actually order is controlled from the admin page (Settings ->
  // "Checkout open") and needs an exchange rate to be set. Payments are
  // verified server-side by Supabase functions (see docs/PAYSTACK-SETUP.md).
  storeMode: "live",

  brand: {
    legalName: "ROBAT FIT LTD",
    registrationNumber: "RC 9863999", // CAC registration number, as supplied by the owner
    tradingName: "ROBAT",
    domain: "robatfit.com",
    address: "46, Royal Palm Drive, Ikoyi, Lagos, Nigeria"
  },

  contact: {
    supportEmail: "info@robatfit.com",
    whatsappNumber: "+234 906 056 9412",
    whatsappNumberIntl: "2349060569412", // digits only, for wa.me links
    instagram: "https://www.instagram.com/robatfit"
  },

  // Prices, stock, colours, shipping fees and the USD->NGN rate are NOT
  // stored in this file any more. They live in the database and are edited
  // from admin.html. Payments are always charged in NGN.
  currency: "NGN",

  // Public connection details for the store backend (Supabase).
  // The publishable key is public by design — it can only do what the
  // database rules allow (read the catalogue). NEVER put a secret or
  // service_role key here.
  supabase: {
    url: "https://gwrgsucqiyhtsfgbfcxz.supabase.co",
    publishableKey: "sb_publishable_48NAIwv9VnqkBKaTGhPdUQ_gdSXhR0p"
  },

  launch: {
    targetDate: "2026-10-31", // stated target — NOT yet reconfirmed this session
    confirmed: false // set true only once the user explicitly reconfirms the date
  },

  shipping: {
    countries: ["Nigeria"], // fees/areas/estimates are edited in the admin page
    rates: null,
    estimates: null
  },

  returns: {
    windowDays: null, // the returns policy text is edited in the admin page
    conditions: null
  },

  payment: {
    provider: "paystack"
  },

  analytics: {
    provider: null, // no analytics is used on this site
    consentRequired: true // no analytics/tracking script should load before consent while this is true
  }
};

/* Small helpers so templates don't repeat this logic. */
function robatFormatLaunchDate(){
  if(!ROBAT_CONFIG.launch.confirmed){ return "date to be announced"; }
  var d = new Date(ROBAT_CONFIG.launch.targetDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", {day:"numeric", month:"long", year:"numeric"});
}
/* Prices come from the database now (see store.js); this stays only so
   older template code that calls it cannot break. */
function robatPriceLabel(){ return "See Shop"; }
