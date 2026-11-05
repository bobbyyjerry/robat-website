/* ============================================================
   ROBAT — STORE (cart, preorder, checkout, currency)
   ------------------------------------------------------------
   Talks to your Supabase project:
     - reads products / stock / shipping fees / settings (public, read-only)
     - sends orders to the secure "create-order" function, which
       RECALCULATES every price on the server and starts Paystack.
   Nothing here is trusted for money: prices shown in the browser are
   for display only. No secret keys live in this file (the publishable
   key below is public by design and is limited by database rules).
   ============================================================ */
(function(){
"use strict";

var CFG = (window.ROBAT_CONFIG && window.ROBAT_CONFIG.supabase) || {};
var REST = (CFG.url || "") + "/rest/v1/";
var FN = (CFG.url || "") + "/functions/v1/";
var SIZE_ORDER = ["XXS","XS","S","M","L","XL","XXL","XXXL"];
var CART_KEY = "robat_cart_v1";
var CUR_KEY = "robat_currency";
var KEY_STORE = "robat_checkout_key";
var WHATSAPP = (window.ROBAT_CONFIG && window.ROBAT_CONFIG.contact && window.ROBAT_CONFIG.contact.whatsappNumberIntl) || "";

/* ---------- tiny safe helpers ---------- */
function esc(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function lsGet(k){ try { return window.localStorage.getItem(k); } catch(e){ return null; } }
function lsSet(k,v){ try { window.localStorage.setItem(k,v); } catch(e){} }
function ssGet(k){ try { return window.sessionStorage.getItem(k); } catch(e){ return null; } }
function ssSet(k,v){ try { window.sessionStorage.setItem(k,v); } catch(e){} }
function round2(n){ return Math.round(n * 100) / 100; }

/* ---------- state ---------- */
var S = { status:"idle", promise:null, products:{}, zones:[], settings:{} };
var currency = (lsGet(CUR_KEY) === "NGN") ? "NGN" : "USD";
var cart = loadCart();
var checkoutBusy = false;

function loadCart(){
  try {
    var raw = JSON.parse(lsGet(CART_KEY) || "[]");
    if(!Array.isArray(raw)){ return []; }
    return raw.filter(function(l){
      return l && typeof l.slug === "string" && typeof l.color === "string" && typeof l.size === "string" && l.qty >= 1 && l.qty <= 10;
    }).slice(0, 10);
  } catch(e){ return []; }
}
function saveCart(){ lsSet(CART_KEY, JSON.stringify(cart)); refreshAll(); }
function cartCount(){ return cart.reduce(function(n,l){ return n + l.qty; }, 0); }

/* ---------- catalogue ---------- */
function api(path){
  return fetch(REST + path, { headers: { apikey: CFG.publishableKey, Accept: "application/json" } }).then(function(r){
    if(!r.ok){ throw new Error("HTTP " + r.status); }
    return r.json();
  });
}
function loadCatalog(force){
  if(S.promise && !force){ return S.promise; }
  if(!CFG.url || !CFG.publishableKey){ S.status = "error"; return Promise.resolve(); }
  S.status = S.status === "ready" ? "ready" : "loading";
  S.promise = Promise.all([
    api("products?select=*&active=eq.true&order=sort_order"),
    api("product_colors?select=*&order=sort_order"),
    api("variants?select=product_id,color,size,stock,reserved"),
    api("shipping_zones?select=*&active=eq.true&order=state"),
    api("settings?select=key,value")
  ]).then(function(res){
    var byId = {}, products = {};
    res[0].forEach(function(p){
      byId[p.id] = p.slug;
      products[p.slug] = {
        id:p.id, slug:p.slug, name:p.name, kind:p.kind,
        priceUsd:Number(p.price_usd),
        preorderUsd:p.preorder_price_usd == null ? null : Number(p.preorder_price_usd),
        preorderOn:!!p.preorder_enabled, discount:Number(p.discount_percent || 0),
        colors:[], stock:{}, sizes:[]
      };
    });
    res[1].forEach(function(c){
      var slug = byId[c.product_id];
      if(slug && c.status !== "hidden"){ products[slug].colors.push({ name:c.name, status:c.status }); }
    });
    res[2].forEach(function(v){
      var slug = byId[v.product_id];
      if(!slug){ return; }
      var p = products[slug];
      p.stock[v.color + "|" + v.size] = Math.max(0, v.stock - v.reserved);
      if(p.sizes.indexOf(v.size) === -1){ p.sizes.push(v.size); }
    });
    Object.keys(products).forEach(function(k){
      products[k].sizes.sort(function(a,b){
        var ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
      });
    });
    var settings = {};
    res[4].forEach(function(s){ settings[s.key] = s.value; });
    S.products = products; S.zones = res[3]; S.settings = settings; S.status = "ready";
    refreshAll();
  }).catch(function(){
    S.status = (S.status === "ready") ? "ready" : "error";
    S.promise = null;
    refreshAll();
  });
  return S.promise;
}
function rate(){ var r = Number(S.settings.usd_ngn_rate); return r > 0 ? r : 0; }
function checkoutOpen(){ return S.status === "ready" && S.settings.checkout_enabled === true && rate() > 0; }

/* ---------- pricing (display only — the server recalculates) ---------- */
function unitUsd(p){
  var base = (p.preorderOn && p.preorderUsd != null) ? p.preorderUsd : p.priceUsd;
  return round2(base * (1 - p.discount / 100));
}
function unitNgn(p){ return Math.round(unitUsd(p) * rate()); }
function isPreorder(p){ return p.preorderOn && p.preorderUsd != null; }
function fmtUsd(n){ n = round2(n); return "$" + (n % 1 === 0 ? String(n) : n.toFixed(2)); }
function fmtNgn(n){ return "₦" + Math.round(n).toLocaleString("en-NG"); }
/* a USD amount, shown in whichever currency the visitor picked */
function showUsd(usd){
  if(currency === "NGN" && rate() > 0){ return fmtNgn(usd * rate()); }
  return fmtUsd(usd);
}
/* a Naira amount, shown in whichever currency the visitor picked */
function showNgn(ngn){
  if(currency === "NGN" || rate() <= 0){ return fmtNgn(ngn); }
  return "≈ " + fmtUsd(ngn / rate());
}
function lineInfo(l){
  var p = S.products[l.slug];
  var info = { line:l, p:p, ok:false, reason:"" };
  if(!p){ info.reason = "No longer available"; return info; }
  var col = null;
  p.colors.forEach(function(c){ if(c.name === l.color){ col = c; } });
  if(!col || col.status !== "available"){ info.reason = "This colour isn’t available"; return info; }
  var avail = p.stock[l.color + "|" + l.size];
  if(avail == null){ info.reason = "This size isn’t available"; return info; }
  if(avail < 1){ info.reason = "Sold out"; return info; }
  if(avail < l.qty){ info.reason = "Only " + avail + " left"; return info; }
  info.ok = true; info.unitUsd = unitUsd(p); info.unitNgn = unitNgn(p);
  return info;
}
/* what a cart line costs, in the visitor's chosen currency (matches the server's rounding) */
function lineDisplay(info){
  return currency === "NGN" ? fmtNgn(info.unitNgn * info.line.qty) : fmtUsd(info.unitUsd * info.line.qty);
}
function subtotalDisplay(t){
  if(currency === "NGN"){ return fmtNgn(t.subtotalNgn); }
  var usd = 0; t.infos.forEach(function(i){ if(i.ok){ usd += i.unitUsd * i.line.qty; } });
  return fmtUsd(usd);
}
function cartTotals(zoneState){
  var infos = cart.map(lineInfo), sub = 0, allOk = infos.length > 0;
  infos.forEach(function(i){ if(i.ok){ sub += i.unitNgn * i.line.qty; } else { allOk = false; } });
  var zone = null;
  S.zones.forEach(function(z){ if(z.state === zoneState){ zone = z; } });
  var ship = zone ? zone.fee_ngn : null;
  return { infos:infos, subtotalNgn:sub, shippingNgn:ship, totalNgn: ship == null ? null : sub + ship, zone:zone, allOk:allOk };
}

/* ---------- cart actions ---------- */
function addToCart(slug, color, size, qty){
  var found = null;
  cart.forEach(function(l){ if(l.slug === slug && l.color === color && l.size === size){ found = l; } });
  if(found){ found.qty = Math.min(10, found.qty + qty); }
  else { cart.push({ slug:slug, color:color, size:size, qty:Math.min(10, qty) }); }
  saveCart();
}
function setQty(i, qty){
  qty = parseInt(qty, 10);
  if(!(qty >= 1)){ qty = 1; }
  if(qty > 10){ qty = 10; }
  if(cart[i]){ cart[i].qty = qty; saveCart(); }
}
function removeLine(i){ cart.splice(i, 1); saveCart(); }

/* ---------- mounts ---------- */
function refreshAll(){
  renderNav();
  document.querySelectorAll("[data-store-panel]").forEach(renderPanel);
  document.querySelectorAll("[data-store-price]").forEach(renderPriceTag);
  var c = document.getElementById("store-cart"); if(c && !c.dataset.busy){ renderCart(c); }
  var k = document.getElementById("store-checkout"); if(k && !checkoutBusy){ renderCheckoutIfNeeded(k); }
  document.querySelectorAll("[data-store-policy]").forEach(renderPolicy);
  document.querySelectorAll("[data-store-shipping]").forEach(renderShipping);
}
function mount(root){
  root = root || document;
  var k = document.getElementById("store-checkout"); if(k){ delete k.dataset.built; }
  var fresh = !!(document.getElementById("store-cart") || document.getElementById("store-checkout"));
  loadCatalog(fresh); /* cart + checkout always re-read live stock and prices */
  refreshAll();
}

/* ---------- nav: currency switch + cart link ---------- */
function renderNav(){
  document.querySelectorAll("[data-store-nav]").forEach(function(el){
    var n = cartCount();
    var showSwitch = rate() > 0;
    var html = "";
    if(showSwitch){
      html += '<div class="cur-switch" role="group" aria-label="Currency">' +
        '<button type="button" data-cur="USD" aria-pressed="' + (currency === "USD") + '">USD</button>' +
        '<button type="button" data-cur="NGN" aria-pressed="' + (currency === "NGN") + '">NGN</button></div>';
    }
    html += '<a href="#/cart" class="cart-link" aria-label="Cart, ' + n + (n === 1 ? " item" : " items") + '">Cart<span class="cart-count" aria-hidden="true">' + n + '</span></a>';
    if(el.dataset.sig !== html){ el.innerHTML = html; el.dataset.sig = html; }
  });
}
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-cur]");
  if(!b){ return; }
  currency = b.getAttribute("data-cur") === "NGN" ? "NGN" : "USD";
  lsSet(CUR_KEY, currency);
  refreshAll();
  var again = document.querySelector('[data-store-nav] [data-cur="' + currency + '"]');
  if(again){ again.focus(); }
});

/* ---------- price tags (shop cards, product header) ---------- */
function renderPriceTag(el){
  var p = S.products[el.getAttribute("data-store-price")];
  if(S.status !== "ready" || !p){ el.textContent = ""; return; }
  if(isPreorder(p)){
    el.innerHTML = 'Preorder <strong>' + esc(showUsd(unitUsd(p))) + '</strong> <s class="price-was">' + esc(showUsd(p.priceUsd)) + '</s>';
  } else {
    el.innerHTML = '<strong>' + esc(showUsd(unitUsd(p))) + '</strong>';
  }
}

/* ---------- product page purchase panel ---------- */
function renderPanel(el){
  var slug = el.getAttribute("data-store-panel");
  var sel = el._sel || (el._sel = { color:"", size:"", qty:1 });
  if(S.status === "idle" || S.status === "loading"){ el.innerHTML = '<p class="of-note" role="status">Loading availability…</p>'; return; }
  if(S.status === "error"){
    el.innerHTML = '<p class="of-note" role="status">We couldn’t load availability right now. Please refresh the page, or <a class="link" href="https://wa.me/' + esc(WHATSAPP) + '">message us on WhatsApp</a>.</p>';
    return;
  }
  var p = S.products[slug];
  if(!p){ el.innerHTML = '<p class="of-note">This product isn’t available to order right now.</p>'; return; }
  var html = '';
  html += '<div class="store-price" aria-live="polite">';
  if(isPreorder(p)){
    html += '<span class="badge">Preorder</span> <span class="price-now">' + esc(showUsd(unitUsd(p))) + '</span> <s class="price-was" aria-label="Original price">' + esc(showUsd(p.priceUsd)) + '</s>';
  } else {
    html += '<span class="price-now">' + esc(showUsd(unitUsd(p))) + '</span>';
  }
  if(p.discount > 0){ html += ' <span class="badge">' + esc(String(p.discount)) + '% off</span>'; }
  html += '</div>';
  if(rate() > 0){
    html += '<p class="of-note">You pay in Naira at checkout: ' + esc(fmtNgn(unitNgn(p))) + ' per item (at $1 = ' + esc(fmtNgn(rate())) + '). Delivery is added at checkout.</p>';
  }
  if(!checkoutOpen()){
    html += '<p class="of-note" role="status">Ordering opens soon. Questions? <a class="link" href="https://wa.me/' + esc(WHATSAPP) + '">Message us on WhatsApp</a>.</p>';
    el.innerHTML = html; return;
  }
  var availColors = p.colors.filter(function(c){ return c.status === "available"; });
  if(!sel.color || !availColors.some(function(c){ return c.name === sel.color; })){ sel.color = availColors.length ? availColors[0].name : ""; }
  html += '<form class="store-add" novalidate>';
  html += '<fieldset class="of-group"><legend class="of-label">Colour</legend><div class="of-options">';
  p.colors.forEach(function(c){
    if(c.status === "available"){
      html += '<label class="of-chip"><input type="radio" name="color" value="' + esc(c.name) + '"' + (c.name === sel.color ? " checked" : "") + '><span>' + esc(c.name) + '</span></label>';
    } else {
      html += '<label class="of-chip"><input type="radio" name="color" value="' + esc(c.name) + '" disabled><span>' + esc(c.name) + '<span class="soon">Coming Soon</span></span></label>';
    }
  });
  html += '</div></fieldset>';
  html += '<fieldset class="of-group"><legend class="of-label">Size</legend><div class="of-options" data-sizes></div></fieldset>';
  html += '<div class="of-field" style="max-width:140px;"><label for="sq-' + esc(slug) + '">Quantity</label><input id="sq-' + esc(slug) + '" type="number" name="qty" min="1" max="10" value="' + esc(String(sel.qty)) + '"></div>';
  html += '<div><button type="submit" class="btn solid block">Add To Cart</button>';
  html += '<p class="of-msg form-status" role="status" aria-live="polite" data-msg></p></div>';
  html += '<p class="of-note">' + esc(S.settings.delivery_note || "Delivery timelines will be confirmed after your order.") + '</p>';
  html += '</form>';
  el.innerHTML = html;
  paintSizes(el, p);
}
function paintSizes(el, p){
  var sel = el._sel, box = el.querySelector("[data-sizes]");
  if(!box){ return; }
  var anyAvail = false, firstAvail = "";
  p.sizes.forEach(function(s){ if((p.stock[sel.color + "|" + s] || 0) > 0){ anyAvail = true; if(!firstAvail){ firstAvail = s; } } });
  if(!sel.size || (p.stock[sel.color + "|" + sel.size] || 0) < 1){ sel.size = firstAvail; }
  var html = "";
  p.sizes.forEach(function(s){
    var left = p.stock[sel.color + "|" + s] || 0;
    var dis = left < 1;
    html += '<label class="of-chip"><input type="radio" name="size" value="' + esc(s) + '"' + (dis ? " disabled" : "") + (s === sel.size && !dis ? " checked" : "") + '><span>' + esc(s) + (dis ? '<span class="soon">Sold out</span>' : '') + '</span></label>';
  });
  if(!p.sizes.length || !anyAvail){ html = '<p class="of-note">Currently sold out in this colour.</p>'; }
  box.innerHTML = html;
  var btn = el.querySelector('button[type="submit"]');
  if(btn){ if(!anyAvail){ btn.setAttribute("aria-disabled", "true"); btn.disabled = true; } else { btn.removeAttribute("aria-disabled"); btn.disabled = false; } }
}
document.addEventListener("change", function(e){
  var panel = e.target.closest && e.target.closest("[data-store-panel]");
  if(!panel){ return; }
  var p = S.products[panel.getAttribute("data-store-panel")];
  if(!p){ return; }
  if(e.target.name === "color"){ panel._sel.color = e.target.value; panel._sel.size = ""; paintSizes(panel, p); }
  if(e.target.name === "size"){ panel._sel.size = e.target.value; }
  if(e.target.name === "qty"){ var q = parseInt(e.target.value, 10); panel._sel.qty = q >= 1 && q <= 10 ? q : 1; }
});
document.addEventListener("submit", function(e){
  var form = e.target;
  if(!form.classList || !form.classList.contains("store-add")){ return; }
  e.preventDefault();
  var panel = form.closest("[data-store-panel]");
  var slug = panel.getAttribute("data-store-panel"), p = S.products[slug];
  var msg = form.querySelector("[data-msg]");
  function say(t, err){ msg.textContent = t; msg.classList.toggle("is-error", !!err); }
  var color = (form.querySelector('input[name="color"]:checked') || {}).value;
  var size = (form.querySelector('input[name="size"]:checked') || {}).value;
  var qty = parseInt(form.querySelector('input[name="qty"]').value, 10);
  if(!p || !color || !size){ say("Please choose a colour and size.", true); return; }
  if(!(qty >= 1 && qty <= 10)){ say("Quantity must be between 1 and 10.", true); return; }
  var already = 0; cart.forEach(function(l){ if(l.slug === slug && l.color === color && l.size === size){ already = l.qty; } });
  var left = p.stock[color + "|" + size] || 0;
  if(already + qty > left){ say(left < 1 ? "Sorry, that size just sold out." : "Only " + left + " left in this size" + (already ? " (you already have " + already + " in your cart)." : "."), true); return; }
  addToCart(slug, color, size, qty);
  /* addToCart re-renders the panel, so look the message line up again */
  var msg2 = panel.querySelector("[data-msg]");
  if(msg2){
    msg2.classList.remove("is-error");
    msg2.textContent = "Added to your cart. ";
    var a = document.createElement("a"); a.href = "#/cart"; a.className = "link"; a.textContent = "View cart";
    msg2.appendChild(a);
  }
});

/* ---------- cart page ---------- */
function renderCart(el){
  if(S.status === "idle" || S.status === "loading"){ el.innerHTML = '<p class="of-note" role="status">Loading your cart…</p>'; return; }
  if(S.status === "error"){ el.innerHTML = '<p class="of-note" role="status">We couldn’t load prices right now. Please refresh the page.</p>'; return; }
  if(!cart.length){
    el.innerHTML = '<p class="lead">Your cart is empty.</p><p style="margin-top:20px;"><a href="#/shop" class="btn solid">Shop GENERA</a></p>';
    return;
  }
  var t = cartTotals(null), html = '<ul class="cart-lines">';
  t.infos.forEach(function(info, i){
    var l = info.line, p = info.p;
    html += '<li class="cart-line"><div class="cart-line-main"><strong>' + esc(p ? p.name : l.slug) + '</strong>' +
      '<span class="of-note">' + esc(l.color) + ' / ' + esc(l.size) + (p && isPreorder(p) ? ' · Preorder' : '') + '</span>';
    if(!info.ok){ html += '<span class="of-msg is-error" role="alert">' + esc(info.reason) + ' — please change or remove this item.</span>'; }
    html += '</div><div class="cart-line-qty"><label class="visually-hidden" for="cq-' + i + '">Quantity for ' + esc(p ? p.name : l.slug) + '</label>' +
      '<input id="cq-' + i + '" type="number" min="1" max="10" value="' + l.qty + '" data-qty="' + i + '"> ' +
      '<button type="button" class="link-btn" data-remove="' + i + '">Remove</button></div>' +
      '<div class="cart-line-price">' + (info.ok ? esc(lineDisplay(info)) : '—') + '</div></li>';
  });
  html += '</ul>';
  html += '<div class="cart-total"><span>Subtotal</span><strong>' + esc(t.allOk ? subtotalDisplay(t) : "—") + '</strong></div>';
  html += '<p class="of-note">Delivery fee is calculated at checkout from your delivery state. You pay in Naira (₦).</p>';
  if(checkoutOpen() && t.allOk){
    html += '<p style="margin-top:22px;"><a href="#/checkout" class="btn solid block">Go To Checkout</a></p>';
  } else if(!checkoutOpen()){
    html += '<p class="of-note" role="status">Ordering opens soon.</p>';
  }
  html += '<p style="margin-top:14px;"><a href="#/shop" class="link">Continue shopping</a></p>';
  el.innerHTML = html;
}
document.addEventListener("change", function(e){
  var q = e.target.getAttribute && e.target.getAttribute("data-qty");
  if(q != null){ setQty(parseInt(q, 10), e.target.value); }
});
document.addEventListener("click", function(e){
  var r = e.target.closest && e.target.closest("[data-remove]");
  if(r){ removeLine(parseInt(r.getAttribute("data-remove"), 10)); }
});

/* ---------- checkout page ---------- */
function renderCheckoutIfNeeded(el){
  if(S.status === "idle" || S.status === "loading"){ el.innerHTML = '<p class="of-note" role="status">Loading checkout…</p>'; return; }
  if(S.status === "error"){ el.innerHTML = '<p class="of-note" role="status">We couldn’t load checkout right now. Please refresh the page.</p>'; return; }
  if(!cart.length){ el.innerHTML = '<p class="lead">Your cart is empty.</p><p style="margin-top:20px;"><a href="#/shop" class="btn solid">Shop GENERA</a></p>'; delete el.dataset.built; return; }
  if(!checkoutOpen()){ el.innerHTML = '<p class="lead" role="status">Ordering opens soon.</p><p style="margin-top:20px;"><a href="#/cart" class="btn">Back to cart</a></p>'; delete el.dataset.built; return; }
  if(el.dataset.built === "1"){ renderSummary(el); return; }
  el.dataset.built = "1";
  var states = S.zones.map(function(z){ return '<option value="' + esc(z.state) + '">' + esc(z.state) + '</option>'; }).join("");
  el.innerHTML =
    '<div class="store-grid">' +
    '<form id="checkout-form" class="store-form" novalidate>' +
      '<p class="of-msg is-error" id="co-error" role="alert" tabindex="-1"></p>' +
      '<fieldset class="of-group"><legend class="of-label">Contact</legend>' +
        '<div class="of-row"><div class="of-field"><label for="co-name">Full name</label><input id="co-name" name="name" autocomplete="name" required maxlength="100"></div>' +
        '<div class="of-field"><label for="co-phone">Phone number</label><input id="co-phone" name="phone" type="tel" autocomplete="tel" required maxlength="24"></div></div>' +
        '<div class="of-field"><label for="co-email">Email (for your order confirmation)</label><input id="co-email" name="email" type="email" autocomplete="email" required maxlength="160"></div>' +
      '</fieldset>' +
      '<fieldset class="of-group"><legend class="of-label">Delivery (Nigeria)</legend>' +
        '<div class="of-field"><label for="co-line1">Street address</label><input id="co-line1" name="line1" autocomplete="address-line1" required maxlength="200"></div>' +
        '<div class="of-row"><div class="of-field"><label for="co-city">City / Town</label><input id="co-city" name="city" autocomplete="address-level2" required maxlength="80"></div>' +
        '<div class="of-field"><label for="co-state">State</label><select id="co-state" name="state" autocomplete="address-level1" required><option value="">Select state</option>' + states + '</select></div></div>' +
        '<div class="of-field"><label for="co-notes">Delivery notes (optional)</label><textarea id="co-notes" name="notes" rows="2" maxlength="300"></textarea></div>' +
      '</fieldset>' +
      '<div class="of-field of-consent"><label><input type="checkbox" name="terms" id="co-terms"><span>I have read and agree to the <a class="link" href="#/terms" target="_blank" rel="noopener">Terms &amp; Conditions</a>, <a class="link" href="#/privacy" target="_blank" rel="noopener">Privacy Policy</a>, <a class="link" href="#/shipping-policy" target="_blank" rel="noopener">Shipping Policy</a> and <a class="link" href="#/returns-policy" target="_blank" rel="noopener">Returns Policy</a>, and I understand this is a preorder and delivery timelines will be confirmed after my order.</span></label></div>' +
      '<div><button type="submit" class="btn solid block" id="co-pay">Pay Now</button>' +
      '<p class="of-note">You will be taken to Paystack’s secure page to pay by card, bank transfer or USSD. ROBAT never sees or stores your card details.</p>' +
      '<p class="of-msg" id="co-status" role="status" aria-live="polite"></p></div>' +
    '</form>' +
    '<aside class="store-summary" aria-labelledby="co-sum-h"><h2 id="co-sum-h" class="of-label">Order summary</h2><div id="co-summary"></div></aside>' +
    '</div>';
  renderSummary(el);
}
function renderSummary(el){
  var box = el.querySelector("#co-summary");
  if(!box){ return; }
  var stateSel = el.querySelector("#co-state");
  var t = cartTotals(stateSel ? stateSel.value : "");
  var html = '<ul class="sum-lines">';
  t.infos.forEach(function(i){
    var p = i.p;
    html += '<li><span>' + esc(p ? p.name : i.line.slug) + ' · ' + esc(i.line.color) + '/' + esc(i.line.size) + ' × ' + i.line.qty + (i.ok ? '' : ' <em class="is-error">(' + esc(i.reason) + ')</em>') + '</span><span>' + (i.ok ? esc(lineDisplay(i)) : '—') + '</span></li>';
  });
  html += '</ul>';
  html += '<div class="sum-row"><span>Subtotal</span><span>' + esc(fmtNgn(t.subtotalNgn)) + (currency === "USD" ? ' <small>(' + esc(showNgn(t.subtotalNgn)) + ')</small>' : '') + '</span></div>';
  html += '<div class="sum-row"><span>Delivery' + (t.zone ? ' — ' + esc(t.zone.state) : '') + '</span><span>' + (t.shippingNgn == null ? 'Select your state' : esc(fmtNgn(t.shippingNgn))) + '</span></div>';
  if(t.zone && t.zone.est_delivery){ html += '<p class="of-note">Estimated delivery: ' + esc(t.zone.est_delivery) + '</p>'; }
  else { html += '<p class="of-note">' + esc(S.settings.delivery_note || "Delivery timelines will be confirmed after your order.") + '</p>'; }
  html += '<div class="sum-row sum-total"><span>Total to pay</span><strong>' + (t.totalNgn == null ? '—' : esc(fmtNgn(t.totalNgn))) + '</strong></div>';
  if(currency === "USD" && t.totalNgn != null){ html += '<p class="of-note">About ' + esc(fmtUsd(t.totalNgn / rate())) + ' at $1 = ' + esc(fmtNgn(rate())) + '</p>'; }
  html += '<p class="of-note">Payment is taken in Naira (₦). Prices in USD are converted at the rate above.</p>';
  box.innerHTML = html;
  var pay = el.querySelector("#co-pay");
  if(pay){ pay.textContent = t.totalNgn == null ? "Pay Now" : "Pay Now — " + fmtNgn(t.totalNgn); }
}
document.addEventListener("change", function(e){
  if(e.target && e.target.id === "co-state"){ var el = document.getElementById("store-checkout"); if(el){ renderSummary(el); } }
});
function uuid(){
  if(window.crypto && crypto.randomUUID){ return crypto.randomUUID(); }
  return "k" + Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
document.addEventListener("submit", function(e){
  if(!e.target || e.target.id !== "checkout-form"){ return; }
  e.preventDefault();
  var form = e.target, el = document.getElementById("store-checkout");
  var err = form.querySelector("#co-error"), status = form.querySelector("#co-status"), pay = form.querySelector("#co-pay");
  function fail(msg){ err.textContent = msg; status.textContent = ""; err.focus(); }
  err.textContent = "";
  if(checkoutBusy){ return; }
  if(navigator.onLine === false){ fail("You appear to be offline. Please reconnect and try again."); return; }
  var fd = new FormData(form), v = function(k){ return String(fd.get(k) || "").trim(); };
  var need = [["name","your full name"],["phone","your phone number"],["email","your email"],["line1","your street address"],["city","your city"],["state","your delivery state"]];
  for(var i = 0; i < need.length; i++){ if(!v(need[i][0])){ fail("Please enter " + need[i][1] + "."); form.elements[need[i][0]].focus(); return; } }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))){ fail("Please enter a valid email address."); form.elements.email.focus(); return; }
  if(!/^[+0-9()\-\s]{7,24}$/.test(v("phone"))){ fail("Please enter a valid phone number."); form.elements.phone.focus(); return; }
  if(!form.elements.terms.checked){ fail("Please tick the box to agree to the terms before paying."); form.elements.terms.focus(); return; }
  var t = cartTotals(v("state"));
  if(!t.allOk){ fail("Some items in your cart are no longer available. Please go back to your cart."); return; }
  if(t.totalNgn == null){ fail("Please select your delivery state."); return; }

  var payload = {
    accept_terms: true,
    customer: { name:v("name"), email:v("email"), phone:v("phone"), line1:v("line1"), city:v("city"), state:v("state"), notes:v("notes") },
    items: cart.map(function(l){ return { slug:l.slug, color:l.color, size:l.size, qty:l.qty }; }),
    expected_total_ngn: t.totalNgn
  };
  /* one idempotency key per unchanged checkout, so a double-click or a
     "Back" from Paystack can never create a second order */
  var sig = JSON.stringify([payload.items, payload.customer.state, payload.customer.email, payload.expected_total_ngn]);
  var stored = null; try { stored = JSON.parse(ssGet(KEY_STORE) || "null"); } catch(x){}
  if(!stored || stored.sig !== sig){ stored = { sig:sig, key:uuid() }; ssSet(KEY_STORE, JSON.stringify(stored)); }
  payload.idempotency_key = stored.key;

  checkoutBusy = true; pay.disabled = true; pay.setAttribute("aria-disabled", "true");
  window.setTimeout(function(){ delete form.dataset.retried; }, 5000);
  status.textContent = "Securing your order…";
  fetch(FN + "create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: CFG.publishableKey },
    body: JSON.stringify(payload)
  }).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return { status:r.status, body:j }; }); })
  .then(function(res){
    var b = res.body || {};
    if(res.status === 200 && typeof b.authorization_url === "string" && /^https:\/\/checkout\.paystack\.com\//.test(b.authorization_url)){
      status.textContent = "Redirecting you to Paystack…";
      window.location.href = b.authorization_url;
      window.setTimeout(function(){ checkoutBusy = false; pay.disabled = false; pay.removeAttribute("aria-disabled"); }, 6000);
      return;
    }
    checkoutBusy = false; pay.disabled = false; pay.removeAttribute("aria-disabled");
    if((b.error === "order_closed" || b.error === "already_paid") && !form.dataset.retried){
      /* the previous attempt with this exact cart expired, failed or was already paid:
         start a fresh order instead of getting stuck on the old one */
      try { window.sessionStorage.removeItem(KEY_STORE); } catch(x){}
      form.dataset.retried = "1";
      status.textContent = "Starting a fresh checkout\u2026";
      window.setTimeout(function(){ form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable:true })); }, 50);
      return;
    }
    if(b.error === "price_changed"){
      return loadCatalog(true).then(function(){ renderSummary(el); fail("Prices or delivery fees were just updated. Please review your new total and press Pay Now again."); });
    }
    if(b.error === "out_of_stock" || b.error === "item_unavailable"){ return loadCatalog(true).then(function(){ fail(b.message || "An item is no longer available."); }); }
    fail(b.message || "We couldn’t start your payment. Please try again.");
  }).catch(function(){
    checkoutBusy = false; pay.disabled = false; pay.removeAttribute("aria-disabled");
    fail("We couldn’t reach the server. Check your connection and try again. You have not been charged.");
  });
});

/* ---------- policy / shipping pages fed by the admin page ---------- */
function renderPolicy(el){
  if(S.status !== "ready"){ el.textContent = S.status === "error" ? "We couldn’t load this right now. Please refresh." : "Loading…"; return; }
  var text = String(S.settings.returns_policy || "").trim();
  el.textContent = "";
  if(!text){
    var p0 = document.createElement("p");
    p0.textContent = "ROBAT’s return and refund policy has not been finalised yet and will be published here. Until then, please contact info@robatfit.com before sending anything back.";
    el.appendChild(p0); return;
  }
  text.split(/\n{2,}/).forEach(function(par){ var p = document.createElement("p"); p.style.marginTop = "14px"; p.textContent = par; el.appendChild(p); });
}
function renderShipping(el){
  if(S.status !== "ready"){ el.textContent = S.status === "error" ? "We couldn’t load this right now. Please refresh." : "Loading…"; return; }
  var html = '<p>We currently deliver within Nigeria only. Delivery fees are charged in Naira and added automatically at checkout based on your state.</p>' +
    '<table class="store-table"><thead><tr><th scope="col">State</th><th scope="col">Fee</th><th scope="col">Estimated delivery</th></tr></thead><tbody>';
  S.zones.forEach(function(z){ html += '<tr><td>' + esc(z.state) + '</td><td>' + esc(fmtNgn(z.fee_ngn)) + '</td><td>' + esc(z.est_delivery || "To be confirmed") + '</td></tr>'; });
  html += '</tbody></table><p class="of-note">' + esc(S.settings.delivery_note || "Delivery timelines will be confirmed after your order.") + '</p>';
  el.innerHTML = html;
}

/* ---------- pages (HTML strings handed to the router) ---------- */
function pageCart(){
  return '<section class="article-hero"><div class="wrap"><h1>YOUR CART</h1></div></section>' +
    '<section style="padding-top:24px;"><div class="wrap"><div id="store-cart" style="max-width:860px;"></div></div></section>';
}
function pageCheckout(){
  return '<section class="article-hero"><div class="wrap"><a href="#/cart" class="link" style="margin-bottom:20px;display:inline-block;">&larr; Cart</a><h1>CHECKOUT</h1></div></section>' +
    '<section style="padding-top:24px;"><div class="wrap"><div id="store-checkout"></div></div></section>';
}
function productPanelHTML(slug){
  return '<div class="store-panel" data-store-panel="' + esc(slug) + '"></div>';
}
function priceTagHTML(slug){ return '<span class="store-pricetag" data-store-price="' + esc(slug) + '"></span>'; }

window.RobatStore = {
  mount: mount, pageCart: pageCart, pageCheckout: pageCheckout,
  productPanelHTML: productPanelHTML, priceTagHTML: priceTagHTML,
  navHTML: function(){ return '<div class="nav-store" data-store-nav></div>'; },
  policyHTML: function(){ return '<div data-store-policy></div>'; },
  shippingHTML: function(){ return '<div data-store-shipping></div>'; }
};
})();
