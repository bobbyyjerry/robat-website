/* ROBAT measurement. Optional vendors start only after analytics consent.
   Keep checkout details and private order-link tokens out of vendor payloads. */
(function(){
"use strict";
if(window.RobatAnalytics){ return; }
var config = (window.ROBAT_CONFIG && window.ROBAT_CONFIG.analytics) || {};
var CONSENT_KEY = "robat_analytics_consent_v1";
var PURCHASE_KEY = "robat_measured_purchases_v1";
var consent = read(CONSENT_KEY);
var started = false, clarityStarted = false;
var current = "", previous = safeReferrer(document.referrer);
var seen = {}, pendingPurchase = null;
var products = {
  "performance-shirt":"GENERA Performance Shirt",
  "performance-short":"GENERA Performance Short",
  "genera-complete-set":"GENERA Complete Set"
};
var campaign = {};
var search = new URLSearchParams(location.search);
["source","medium","campaign","content","term"].forEach(function(key){
  var value = search.get("utm_" + key);
  if(value && /^[a-z0-9_. -]{1,100}$/i.test(value)){ campaign["campaign_" + key] = value; }
});

function read(key){
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch(e){ return null; }
}
function write(key, value){
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){}
}
function allowed(){
  return consent === true && ["robatfit.com","www.robatfit.com"].indexOf(location.hostname) !== -1;
}
function safeReferrer(value){
  try {
    var url = new URL(value);
    return url.origin === location.origin ? url.origin + url.pathname : url.origin + "/";
  } catch(e){ return ""; }
}
function pageUrl(){
  var url = new URL(location.origin + location.pathname);
  Object.keys(campaign).forEach(function(key){
    url.searchParams.set("utm_" + key.slice(9), campaign[key]);
  });
  return url.href;
}
function sensitive(path){
  return /^\/(?:checkout|track)(?:\/|$)/.test(path) || /^\/(?:order-status|admin)\.html$/.test(path);
}
function script(src){
  var tag = document.createElement("script");
  tag.async = true;
  tag.src = src;
  tag.referrerPolicy = "origin";
  document.head.appendChild(tag);
}
function gtag(){
  window.dataLayer.push(arguments);
}
function start(){
  if(!allowed() || started){ return; }
  started = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;
  gtag("consent", "default", { analytics_storage:"granted", ad_storage:"denied", ad_user_data:"denied", ad_personalization:"denied" });
  gtag("js", new Date());
  gtag("config", config.ga4MeasurementId, {
    send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false,
    page_location:pageUrl(), page_referrer:previous,
    cookie_flags:"SameSite=Lax;Secure"
  });
  script("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(config.ga4MeasurementId));
  // A full navigation separates recordings from screens containing personal data.
  // Unexpected query parameters may contain private links or user-entered values.
  var publicQuery = Array.from(search.keys()).every(function(key){
    return /^utm_(source|medium|campaign|content|term)$/.test(key) && /^[a-z0-9_. -]{1,100}$/i.test(search.get(key));
  });
  if(!sensitive(location.pathname) && publicQuery){
    window.clarity = window.clarity || function(){
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    window.clarity("consentv2", { analytics_Storage:"granted", ad_Storage:"denied" });
    script("https://www.clarity.ms/tag/" + encodeURIComponent(config.clarityProjectId));
    clarityStarted = true;
  }
}
function send(name, data){
  if(!allowed() || !started){ return; }
  var params = Object.assign({}, campaign, data, {
    send_to:config.ga4MeasurementId, page_location:pageUrl(), page_referrer:previous,
    page_title:location.pathname === "/order-status.html" ? "ROBAT — Order status" : document.title
  });
  gtag("event", name, params);
  if(clarityStarted && name !== "page_view" && name !== "purchase"){ window.clarity("event", name); }
}
function once(key, name, data){
  if(!allowed() || !started || seen[key]){ return; }
  seen[key] = true;
  send(name, data);
}
function page(){
  var path = location.pathname;
  if(current !== path){
    if(current){ previous = location.origin + current; }
    current = path;
    seen = {};
  }
  start();
  if(started && allowed()){
    gtag("set", { page_location:pageUrl(), page_referrer:previous,
      page_title:location.pathname === "/order-status.html" ? "ROBAT — Order status" : document.title });
  }
  once("page", "page_view", {});
}
function ecommerceItem(line){
  if(!line || !products[line.slug]){ return null; }
  return {
    item_id:line.slug, item_name:products[line.slug], item_brand:"ROBAT",
    item_variant:String(line.color || "") + (line.size ? " / " + line.size : ""),
    price:Number(line.price), quantity:Number(line.qty || 1)
  };
}
function ecommerce(lines){
  return (lines || []).map(ecommerceItem).filter(function(item){
    return item && Number.isFinite(item.price) && item.price >= 0 && item.quantity > 0;
  });
}
function purchase(order){
  // Only a response from verify-payment reaches this entry point.
  if(!order || order.payment_status !== "paid" || order.is_test !== false ||
     !/^ROBAT-[0-9A-Z-]+$/.test(order.order_number) || order.fulfilment_status === "cancelled" ||
     order.stock_review_status === "cancelled"){ return; }
  pendingPurchase = order;
  if(!allowed() || !started){ return; }
  var id = order.order_number;
  if(seen["purchase:" + id]){ return; }
  seen["purchase:" + id] = true;
  function record(){
    var paid = read(PURCHASE_KEY) || {};
    if(paid[id]){ return; }
    var items = (order.items || []).map(function(line){
      var slug = Object.keys(products).filter(function(key){ return products[key] === line.name; })[0];
      return { slug:slug, color:line.color, size:line.size, qty:line.qty, price:line.unit_ngn };
    });
    var value = Number(order.subtotal_ngn), shipping = Number(order.shipping_ngn);
    if(!Number.isFinite(value) || value < 0 || !Number.isFinite(shipping) || shipping < 0){ return; }
    send("purchase", {
      transaction_id:id, currency:"NGN", value:value, shipping:shipping,
      items:ecommerce(items), stock_review:order.stock_review_status === "pending"
    });
    paid[id] = Date.now();
    // Keep the browser ledger bounded. GA4 also deduplicates transaction_id.
    var keys = Object.keys(paid).sort(function(a,b){ return paid[b] - paid[a]; }).slice(0,200);
    var kept = {};
    keys.forEach(function(key){ kept[key] = paid[key]; });
    write(PURCHASE_KEY, kept);
  }
  if(navigator.locks){ navigator.locks.request("robat-analytics-purchase", record).catch(function(){}); }
  else { record(); }
}
function clearCookies(){
  document.cookie.split(";").forEach(function(cookie){
    var name = cookie.trim().split("=")[0];
    if(!/^(_ga($|_)|_clck$|_clsk$)/.test(name)){ return; }
    ["", "; Domain=" + location.hostname, "; Domain=.robatfit.com"].forEach(function(domain){
      document.cookie = name + "=; Max-Age=0; Path=/" + domain + "; SameSite=Lax; Secure";
    });
  });
}
function choose(value){
  var wasStarted = started;
  consent = value;
  write(CONSENT_KEY, value);
  var panel = document.getElementById("analytics-consent");
  if(panel){ panel.remove(); }
  if(!value){
    if(started){
      window["ga-disable-" + config.ga4MeasurementId] = true;
      gtag("consent", "update", { analytics_storage:"denied" });
    }
    if(clarityStarted){ window.clarity("consentv2", { analytics_Storage:"denied", ad_Storage:"denied" }); }
    clearCookies();
    if(wasStarted){ location.reload(); }
    return;
  }
  if(wasStarted){ return; }
  page();
  document.dispatchEvent(new Event("robat:analytics-ready"));
  if(pendingPurchase){ purchase(pendingPurchase); }
}
function preferences(){
  if(document.getElementById("analytics-consent")){ return; }
  var panel = document.createElement("section");
  panel.id = "analytics-consent";
  panel.setAttribute("aria-label", "Analytics preferences");
  panel.innerHTML = '<p>Allow Google Analytics and Microsoft Clarity to help us understand visits, shopping activity and how the site is used? <a href="/privacy/">Privacy Policy</a></p>' +
    '<div><button type="button" class="btn" data-analytics-consent="false">Decline</button>' +
    '<button type="button" class="btn solid" data-analytics-consent="true">Allow analytics</button></div>';
  document.body.appendChild(panel);
}
function safe(fn){
  return function(){
    try { return fn.apply(null, arguments); } catch(e){}
  };
}
document.addEventListener("click", function(e){
  var button = e.target.closest && e.target.closest("[data-analytics-consent], [data-analytics-preferences]");
  if(!button){ return; }
  if(button.hasAttribute("data-analytics-preferences")){ preferences(); }
  else { safe(choose)(button.getAttribute("data-analytics-consent") === "true"); }
});
window.addEventListener("storage", function(e){
  if(e.key === CONSENT_KEY){ consent = read(CONSENT_KEY); location.reload(); }
});
var api = {
  page:page,
  privateNavigation:function(path){ return consent === true && (sensitive(path) || sensitive(location.pathname)); },
  preferences:preferences,
  viewItem:function(line){
    var items = ecommerce([line]);
    if(items.length){ once("product:" + line.slug, "view_item", { currency:"NGN", value:items[0].price, items:items }); }
  },
  added:function(line, preorder){
    var items = ecommerce([line]);
    if(!items.length){ return; }
    var data = { currency:"NGN", value:items[0].price * items[0].quantity, items:items };
    if(preorder){ send("preorder_click", data); }
    send("add_to_cart", data);
  },
  checkout:function(lines, value){
    once("checkout", "begin_checkout", { currency:"NGN", value:value, items:ecommerce(lines) });
  },
  purchase:purchase
};
window.RobatAnalytics = {};
Object.keys(api).forEach(function(key){ window.RobatAnalytics[key] = safe(api[key]); });
// The main router supplies pageviews after it has set the page title.
if(!document.getElementById("app")){ page(); }
if(consent !== true && consent !== false){ preferences(); }
})();
