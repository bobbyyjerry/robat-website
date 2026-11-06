/* ROBAT admin — talks to Supabase directly. Every request carries the
   logged-in admin's token; the database rules (row level security) decide
   what that person may read or change. No secret keys live here.
   All text is written with textContent (never innerHTML) so customer-supplied
   text can never run as code. */
(function(){
"use strict";
var CFG = (window.ROBAT_CONFIG && window.ROBAT_CONFIG.supabase) || {};
var SKEY = "robat_admin_session";
var session = null;
var root = document.getElementById("admin-root");
var statusEl = document.getElementById("admin-status");
var userEl = document.getElementById("admin-user");
var currentTab = "orders";
var SIZE_ORDER = ["XXS","XS","S","M","L","XL","XXL","XXXL"];

/* ---------- tiny DOM helper ---------- */
function h(tag, props){
  var e = document.createElement(tag);
  props = props || {};
  Object.keys(props).forEach(function(k){
    var v = props[k];
    if(v == null || v === false && k !== "checked" && k !== "disabled"){ return; }
    if(k === "class"){ e.className = v; }
    else if(k === "text"){ e.textContent = v; }
    else if(k.indexOf("on") === 0){ e.addEventListener(k.slice(2), v); }
    else if(k === "for"){ e.htmlFor = v; }
    else if(k === "value" || k === "checked" || k === "disabled" || k === "type" || k === "min" || k === "max" || k === "step" || k === "rows" || k === "maxLength"){ e[k] = v; }
    else { e.setAttribute(k, v); }
  });
  for(var i = 2; i < arguments.length; i++){
    var c = arguments[i];
    if(c == null || c === false){ continue; }
    if(Array.isArray(c)){ c.forEach(function(x){ if(x){ e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); } }); }
    else { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
  }
  return e;
}
function clear(n){ while(n.firstChild){ n.removeChild(n.firstChild); } }
function say(msg, isErr){ statusEl.textContent = msg || ""; statusEl.classList.toggle("is-error", !!isErr); }
function money(n){ return "₦" + Math.round(n).toLocaleString("en-NG"); }
function field(label, input, id){ return h("div", { class:"of-field" }, h("label", { for:id, text:label }), input); }

/* ---------- auth + api ---------- */
function saveSession(){ try { sessionStorage.setItem(SKEY, JSON.stringify(session)); } catch(e){} }
function loadSession(){ try { session = JSON.parse(sessionStorage.getItem(SKEY) || "null"); } catch(e){ session = null; } }
function authCall(path, body){
  return fetch(CFG.url + "/auth/v1/" + path, {
    method:"POST", headers:{ apikey:CFG.publishableKey, "Content-Type":"application/json" }, body:JSON.stringify(body)
  }).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, body:j }; }); });
}
function refresh(){
  if(!session || !session.refresh_token){ return Promise.resolve(false); }
  return authCall("token?grant_type=refresh_token", { refresh_token:session.refresh_token }).then(function(r){
    if(r.ok && r.body.access_token){ session = { access_token:r.body.access_token, refresh_token:r.body.refresh_token, email:session.email }; saveSession(); return true; }
    return false;
  }).catch(function(){ return false; });
}
function rest(method, path, body, prefer, retried){
  var headers = { apikey:CFG.publishableKey, Authorization:"Bearer " + (session ? session.access_token : CFG.publishableKey), "Content-Type":"application/json" };
  if(prefer){ headers.Prefer = prefer; }
  return fetch(CFG.url + "/rest/v1/" + path, { method:method, headers:headers, body: body == null ? undefined : JSON.stringify(body) }).then(function(r){
    if(r.status === 401 && !retried){
      return refresh().then(function(ok){ if(ok){ return rest(method, path, body, prefer, true); } signOut("Your session expired. Please log in again."); throw new Error("expired"); });
    }
    if(!r.ok){ return r.text().then(function(t){ var m = ""; try { m = JSON.parse(t).message; } catch(e){} throw new Error(m || ("Request failed (" + r.status + ")")); }); }
    if(r.status === 204 || method !== "GET" && (prefer || "").indexOf("return=representation") === -1){ return null; }
    return r.json();
  });
}
function signOut(msg){
  session = null; try { sessionStorage.removeItem(SKEY); } catch(e){}
  clear(userEl); renderLogin(); say(msg || "", false);
}

/* ---------- login ---------- */
function renderLogin(){
  clear(root); clear(userEl);
  var email = h("input", { id:"lg-email", type:"email", autocomplete:"username", required:"true" });
  var pass = h("input", { id:"lg-pass", type:"password", autocomplete:"current-password", required:"true" });
  var btn = h("button", { type:"submit", class:"btn solid", text:"Log in" });
  var form = h("form", { class:"login-box", novalidate:"true", onsubmit:function(e){
    e.preventDefault(); say("Logging in…"); btn.disabled = true;
    authCall("token?grant_type=password", { email:email.value.trim(), password:pass.value }).then(function(r){
      if(!r.ok || !r.body.access_token){ btn.disabled = false; say("Those details didn’t work. Check your email and password.", true); return; }
      session = { access_token:r.body.access_token, refresh_token:r.body.refresh_token, email:r.body.user && r.body.user.email };
      return rest("GET", "admins?select=email").then(function(rows){
        if(!rows || !rows.length){ signOut("This account is not set up as an ROBAT admin."); statusEl.classList.add("is-error"); return; }
        saveSession(); say(""); start();
      });
    }).catch(function(){ btn.disabled = false; say("Couldn’t reach the server. Try again.", true); });
  }},
    h("h1", { text:"Admin login" }),
    field("Email", email, "lg-email"), field("Password", pass, "lg-pass"), btn);
  root.appendChild(form); email.focus();
}

/* ---------- shell ---------- */
var TABS = [["orders","Orders"],["products","Products & prices"],["stock","Stock"],["shipping","Shipping"],["settings","Settings"]];
function start(){
  clear(userEl);
  userEl.appendChild(h("span", { text:session.email || "" }));
  userEl.appendChild(h("button", { type:"button", class:"link-btn", text:"Log out", onclick:function(){ signOut("You are logged out."); } }));
  showTab(currentTab);
}
function showTab(name){
  currentTab = name; clear(root);
  var tabs = h("div", { class:"tabs", role:"navigation", "aria-label":"Admin sections" });
  TABS.forEach(function(t){ tabs.appendChild(h("button", { type:"button", text:t[1], "aria-current": t[0] === name ? "page" : null, onclick:function(){ showTab(t[0]); } })); });
  var panel = h("div", { id:"panel" });
  root.appendChild(tabs); root.appendChild(panel);
  say("Loading…");
  var fn = { orders:tabOrders, products:tabProducts, stock:tabStock, shipping:tabShipping, settings:tabSettings }[name];
  fn(panel).then(function(){ say(""); }).catch(function(e){ if(e.message !== "expired"){ say("Couldn’t load: " + e.message, true); } });
}
function saveWrap(btn, p, okMsg){
  btn.disabled = true;
  return p.then(function(){ say(okMsg || "Saved."); btn.disabled = false; }).catch(function(e){ btn.disabled = false; if(e.message !== "expired"){ say("Couldn’t save: " + e.message, true); } });
}
function num(v){ var n = Number(v); return isFinite(n) ? n : NaN; }

/* ---------- ORDERS ---------- */
function tabOrders(panel){
  return rest("GET", "orders?select=*,order_items(*)&order=created_at.desc&limit=300").then(function(orders){
    var filter = h("select", { id:"of" }, [["all","All"],["paid","Paid"],["pending","Pending"],["failed","Failed"],["expired","Expired"]].map(function(o){ return h("option", { value:o[0], text:o[1] }); }));
    var search = h("input", { id:"os", type:"text", placeholder:"Order no., name or email" });
    var refreshBtn = h("button", { type:"button", class:"btn", text:"Refresh", onclick:function(){ showTab("orders"); } });
    var wrap = h("div", { class:"table-wrap" });
    function draw(){
      clear(wrap);
      var f = filter.value, s = search.value.trim().toLowerCase();
      var rows = orders.filter(function(o){
        return (f === "all" || o.payment_status === f) &&
          (!s || (o.order_number + " " + o.customer_name + " " + o.customer_email).toLowerCase().indexOf(s) !== -1);
      });
      if(!rows.length){ wrap.appendChild(h("p", { class:"small", style:"padding:16px;", text:"No orders match." })); return; }
      var tbody = h("tbody");
      rows.forEach(function(o){
        var detail = h("tr", { hidden:"true" }, h("td", { colspan:"6" }, orderDetail(o)));
        var toggle = h("button", { type:"button", class:"link-btn", text:"Details", "aria-expanded":"false", onclick:function(){
          var open = detail.hidden; detail.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); } });
        var ful = h("select", { "aria-label":"Fulfilment status for " + o.order_number, onchange:function(){
          rest("PATCH", "orders?id=eq." + o.id, { fulfilment_status: ful.value }).then(function(){ say("Updated " + o.order_number + "."); o.fulfilment_status = ful.value; }).catch(function(e){ say("Couldn’t update: " + e.message, true); });
        }}, ["new","processing","shipped","delivered","cancelled"].map(function(s2){ return h("option", { value:s2, text:s2, selected: s2 === o.fulfilment_status ? "selected" : null }); }));
        ful.value = o.fulfilment_status;
        tbody.appendChild(h("tr", {},
          h("td", { text:new Date(o.created_at).toLocaleString("en-GB", { dateStyle:"short", timeStyle:"short" }) }),
          h("td", {}, h("strong", { text:o.order_number }), o.is_test ? h("span", { class:"badge test", text:"TEST" }) : null),
          h("td", { text:o.customer_name }),
          h("td", { text:money(o.total_ngn) }),
          h("td", {}, h("span", { class:"badge " + o.payment_status, text: o.payment_status === "pending" ? "awaiting payment" : o.payment_status }), o.review_flag ? h("span", { class:"badge flag", text:"review" }) : null),
          h("td", {}, ful, " ", toggle)));
        tbody.appendChild(detail);
      });
      wrap.appendChild(h("table", { class:"admin-table" },
        h("thead", {}, h("tr", {}, ["Date","Order","Customer","Total","Payment","Fulfilment"].map(function(c){ return h("th", { scope:"col", text:c }); }))), tbody));
    }
    filter.addEventListener("change", draw); search.addEventListener("input", draw);
    clear(panel);
    panel.appendChild(h("h1", { text:"Orders" }));
    panel.appendChild(h("p", { class:"small", text:"Payment status is set only by the server after Paystack confirms a payment — it can’t be edited here. You can update fulfilment status and add notes." }));
    panel.appendChild(h("div", { class:"toolbar" }, field("Payment", filter, "of"), field("Search", search, "os"), refreshBtn));
    panel.appendChild(wrap); draw();
  });
}
function orderDetail(o){
  var items = (o.order_items || []).map(function(i){ return i.product_name + " · " + i.color + "/" + i.size + " × " + i.qty + " — " + money(i.line_ngn) + (i.is_preorder ? " (preorder)" : ""); });
  var notes = h("textarea", { rows:3, maxLength:1000, "aria-label":"Admin notes for " + o.order_number, value:o.admin_notes || "" });
  var recheck = null;
  if(o.payment_status === "pending"){
    recheck = h("button", { type:"button", class:"btn", text:"Re-check payment with Paystack" });
    recheck.addEventListener("click", function(){
      recheck.disabled = true; say("Checking with Paystack\u2026");
      fetch(CFG.url + "/functions/v1/verify-payment", { method:"POST", headers:{ "Content-Type":"application/json", apikey:CFG.publishableKey },
        body: JSON.stringify({ order_number:o.order_number, token:o.public_token }) })
      .then(function(r){ return r.json(); })
      .then(function(j){
        var st = j && j.order ? j.order.payment_status : "unknown";
        var gw = j && j.gateway_status ? " (Paystack says: " + j.gateway_status + ")" : "";
        say(o.order_number + " is " + st + gw + ".");
        if(st !== "pending"){ showTab("orders"); } else { recheck.disabled = false; }
      }).catch(function(){ recheck.disabled = false; say("Couldn\u2019t reach the server.", true); });
    });
  }
  var save = h("button", { type:"button", class:"btn", text:"Save note" });
  save.addEventListener("click", function(){ saveWrap(save, rest("PATCH", "orders?id=eq." + o.id, { admin_notes:notes.value }), "Note saved."); });
  function dd(label, value){ return [h("dt", { text:label }), h("dd", { text:value || "—" })]; }
  return h("div", { class:"card" }, h("div", { class:"detail-grid" },
    h("dl", {}, dd("Customer", o.customer_name), dd("Email", o.customer_email), dd("Phone", o.customer_phone),
      dd("Deliver to", [o.ship_line1, o.ship_city, o.ship_state].join(", ")), dd("Delivery notes", o.ship_notes)),
    h("dl", {}, dd("Items", items.join("  |  ")), dd("Subtotal", money(o.subtotal_ngn)), dd("Delivery fee", money(o.shipping_ngn)),
      dd("Total (NGN)", money(o.total_ngn)), dd("Exchange rate used", "$1 = " + money(o.exchange_rate))),
    h("dl", {}, dd("Paystack reference", o.paystack_reference), dd("Paid at", o.paid_at ? new Date(o.paid_at).toLocaleString() : ""),
      dd("Channel", o.payment_channel), dd("Needs review?", o.review_flag), dd("Terms accepted", o.terms_accepted_at ? new Date(o.terms_accepted_at).toLocaleString() : ""),
      dd("Receipt email", o.receipt_sent_at ? "Sent " + new Date(o.receipt_sent_at).toLocaleString() : (o.receipt_error ? "Not sent \u2014 " + o.receipt_error : (o.payment_status === "paid" ? "Not sent (email receipts not set up yet)" : "\u2014"))))),
    h("div", { class:"of-field" }, h("label", { text:"Admin notes (private)" }), notes), h("div", { class:"row-actions" }, save, recheck),
    o.payment_status === "pending" ? h("p", { class:"small", text:"Pending = no payment confirmed yet. If the customer doesn\u2019t pay within 30 minutes the order becomes \u201Cexpired\u201D and its held stock is released automatically." }) : null);
}

/* ---------- PRODUCTS & PRICES ---------- */
function tabProducts(panel){
  return Promise.all([rest("GET", "products?select=*&order=sort_order"), rest("GET", "product_colors?select=*&order=sort_order")]).then(function(res){
    var products = res[0], colors = res[1];
    clear(panel);
    panel.appendChild(h("h1", { text:"Products & prices" }));
    panel.appendChild(h("p", { class:"small", text:"Prices are in US dollars. Customers pay in Naira at the rate set under Settings. Photos and descriptions are part of the website design and aren’t edited here." }));
    products.forEach(function(p){
      var id = "p-" + p.id;
      var name = h("input", { id:id+"n", type:"text", value:p.name, maxLength:80 });
      var price = h("input", { id:id+"p", type:"number", min:"0", step:"0.01", value:String(p.price_usd) });
      var pre = h("input", { id:id+"pp", type:"number", min:"0", step:"0.01", value:p.preorder_price_usd == null ? "" : String(p.preorder_price_usd) });
      var disc = h("input", { id:id+"d", type:"number", min:"0", max:"99", step:"0.5", value:String(p.discount_percent || 0) });
      var preOn = h("input", { id:id+"po", type:"checkbox", checked:!!p.preorder_enabled });
      var active = h("input", { id:id+"a", type:"checkbox", checked:!!p.active });
      var save = h("button", { type:"button", class:"btn solid", text:"Save " + p.name });
      save.addEventListener("click", function(){
        var body = { name:name.value.trim(), price_usd:num(price.value), preorder_price_usd: pre.value === "" ? null : num(pre.value),
          discount_percent:num(disc.value || 0), preorder_enabled:preOn.checked, active:active.checked, updated_at:new Date().toISOString() };
        if(!body.name || !(body.price_usd >= 0) || (body.preorder_price_usd !== null && !(body.preorder_price_usd >= 0)) || !(body.discount_percent >= 0 && body.discount_percent < 100)){ say("Please check the numbers — prices can’t be negative and discount must be under 100%.", true); return; }
        saveWrap(save, rest("PATCH", "products?id=eq." + p.id, body), p.name + " saved. Customers see it within a minute.");
      });
      var colorBox = h("div", {});
      colors.filter(function(c){ return c.product_id === p.id; }).forEach(function(c){
        var sel = h("select", { "aria-label":"Status of " + c.name + " for " + p.name }, [["available","Available to buy"],["coming_soon","Coming soon (can’t be bought)"],["hidden","Hidden"]].map(function(o){ return h("option", { value:o[0], text:o[1] }); }));
        sel.value = c.status;
        sel.addEventListener("change", function(){ rest("PATCH", "product_colors?id=eq." + c.id, { status:sel.value }).then(function(){ say(c.name + " set to " + sel.value.replace("_"," ") + "."); }).catch(function(e){ say("Couldn’t save: " + e.message, true); }); });
        colorBox.appendChild(h("div", { class:"toolbar" }, h("strong", { text:c.name }), sel));
      });
      var newName = h("input", { type:"text", "aria-label":"New colour name for " + p.name, placeholder:"New colour", maxLength:30 });
      var addBtn = h("button", { type:"button", class:"btn", text:"Add colour" });
      addBtn.addEventListener("click", function(){
        var n = newName.value.trim(); if(!n){ return; }
        saveWrap(addBtn, rest("POST", "product_colors", { product_id:p.id, name:n, status:"coming_soon", sort_order:99 }).then(function(){ showTab("products"); }), n + " added as Coming Soon.");
      });
      panel.appendChild(h("section", { class:"card", "aria-labelledby":id+"h" },
        h("h2", { id:id+"h", text:p.name }),
        h("div", { class:"grid-2" }, field("Display name", name, id+"n"), field("Original price (USD)", price, id+"p"), field("Preorder price (USD)", pre, id+"pp"), field("Extra discount (%)", disc, id+"d")),
        h("div", { class:"row-actions" }, h("label", {}, preOn, " Preorder pricing is on"), h("label", {}, active, " Show this product in the shop")),
        h("p", { class:"small", text:"When preorder pricing is on, customers see the preorder price with the original price crossed out." }),
        h("div", { class:"row-actions" }, save),
        h("h3", { text:"Colours" }), colorBox, h("div", { class:"toolbar" }, newName, addBtn)));
    });
  });
}

/* ---------- STOCK ---------- */
function tabStock(panel){
  return Promise.all([rest("GET", "products?select=id,name,sort_order&order=sort_order"), rest("GET", "product_colors?select=*&order=sort_order"), rest("GET", "variants?select=*"),
      rest("GET", "bundle_components?select=*").catch(function(){ return []; })]).then(function(res){
    var products = res[0], colors = res[1], variants = res[2], bundles = res[3] || [];
    clear(panel);
    panel.appendChild(h("h1", { text:"Stock" }));
    panel.appendChild(h("p", { class:"small", text:"Type how many you can sell for each colour and size. 0 means sold out. “Held” = in someone’s checkout right now (released after 30 minutes if unpaid). Changes save as soon as you leave the box." }));
    products.forEach(function(p){
      var comps = bundles.filter(function(b){ return b.bundle_id === p.id; });
      if(comps.length){ panel.appendChild(bundleStockCard(p, comps, products, colors, variants)); return; }
      var cols = colors.filter(function(c){ return c.product_id === p.id; });
      var vs = variants.filter(function(v){ return v.product_id === p.id; });
      var sizes = []; vs.forEach(function(v){ if(sizes.indexOf(v.size) === -1){ sizes.push(v.size); } });
      sizes.sort(function(a,b){ var x = SIZE_ORDER.indexOf(a), y = SIZE_ORDER.indexOf(b); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y) || a.localeCompare(b); });
      var head = h("tr", {}, h("th", { scope:"col", text:"Colour" }), sizes.map(function(s){ return h("th", { scope:"col", text:s }); }));
      var tbody = h("tbody");
      cols.forEach(function(c){
        var tr = h("tr", {}, h("th", { scope:"row", text:c.name + (c.status === "available" ? "" : " (" + c.status.replace("_"," ") + ")") }));
        sizes.forEach(function(s){
          var v = vs.filter(function(x){ return x.color === c.name && x.size === s; })[0];
          var inp = h("input", { type:"number", min:"0", step:"1", value:String(v ? v.stock : 0), "aria-label":p.name + " " + c.name + " size " + s + " stock" });
          inp.addEventListener("change", function(){
            var n = parseInt(inp.value, 10);
            if(!(n >= 0) || n > 100000){ say("Stock must be a whole number, 0 or more.", true); inp.value = String(v ? v.stock : 0); return; }
            rest("POST", "variants?on_conflict=product_id,color,size", { product_id:p.id, color:c.name, size:s, stock:n }, "resolution=merge-duplicates").then(function(){
              if(v){ v.stock = n; } say(p.name + " " + c.name + " " + s + " set to " + n + "."); }).catch(function(e){ say("Couldn’t save: " + e.message, true); });
          });
          tr.appendChild(h("td", {}, inp, v && v.reserved > 0 ? h("div", { class:"small", text:v.reserved + " held" }) : null));
        });
        tbody.appendChild(tr);
      });
      var newSize = h("input", { type:"text", "aria-label":"New size for " + p.name, placeholder:"New size, e.g. S", maxLength:8 });
      var addSize = h("button", { type:"button", class:"btn", text:"Add size" });
      addSize.addEventListener("click", function(){
        var s = newSize.value.trim().toUpperCase(); if(!s || sizes.indexOf(s) !== -1){ say("Enter a new size that isn’t already listed.", true); return; }
        var rows = cols.map(function(c){ return { product_id:p.id, color:c.name, size:s, stock:0 }; });
        if(!rows.length){ say("Add a colour first.", true); return; }
        saveWrap(addSize, rest("POST", "variants?on_conflict=product_id,color,size", rows, "resolution=merge-duplicates").then(function(){ showTab("stock"); }), "Size " + s + " added.");
      });
      panel.appendChild(h("section", { class:"card" }, h("h2", { text:p.name }),
        h("div", { class:"table-wrap" }, h("table", { class:"admin-table" }, h("thead", {}, head), tbody)),
        h("div", { class:"toolbar", style:"margin-top:14px;" }, newSize, addSize)));
    });
  });
}

/* a set's stock is worked out from the pieces it is made of (read-only) */
function bundleStockCard(p, comps, products, colors, variants){
  function nameOf(id){ var x = products.filter(function(q){ return q.id === id; })[0]; return x ? x.name : "item"; }
  function free(pid, color, size){
    var v = variants.filter(function(x){ return x.product_id === pid && x.color === color && x.size === size; })[0];
    return v ? Math.max(0, v.stock - v.reserved) : null;
  }
  var sizes = [];
  variants.filter(function(v){ return v.product_id === comps[0].component_id; }).forEach(function(v){
    if(sizes.indexOf(v.size) === -1 && comps.every(function(c){ return variants.some(function(x){ return x.product_id === c.component_id && x.size === v.size; }); })){ sizes.push(v.size); }
  });
  sizes.sort(function(a,b){ var x = SIZE_ORDER.indexOf(a), y = SIZE_ORDER.indexOf(b); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y) || a.localeCompare(b); });
  var cols = colors.filter(function(c){ return c.product_id === p.id && c.status !== "hidden"; });
  var tbody = h("tbody");
  cols.forEach(function(c){
    var tr = h("tr", {}, h("th", { scope:"row", text:c.name + (c.status === "available" ? "" : " (" + c.status.replace("_"," ") + ")") }));
    sizes.forEach(function(s){
      var n = Infinity;
      comps.forEach(function(k){ var f = free(k.component_id, c.name, s); n = Math.min(n, f == null ? 0 : Math.floor(f / k.qty)); });
      tr.appendChild(h("td", { text: String(n === Infinity ? 0 : n) }));
    });
    tbody.appendChild(tr);
  });
  var made = comps.map(function(k){ return k.qty + " \u00D7 " + nameOf(k.component_id); }).join(" + ");
  return h("section", { class:"card" }, h("h2", { text:p.name }),
    h("p", { class:"small", text:"This set is made from " + made + ". Each set sold takes those pieces out of stock (same colour and size), so it has no stock of its own. Sets you can sell right now (after items held in checkouts):" }),
    h("div", { class:"table-wrap" }, h("table", { class:"admin-table" },
      h("thead", {}, h("tr", {}, h("th", { scope:"col", text:"Colour" }), sizes.map(function(s){ return h("th", { scope:"col", text:s }); }))), tbody)),
    h("p", { class:"small", text:"To sell more sets, add stock to the pieces above." }));
}

/* ---------- SHIPPING ---------- */
function tabShipping(panel){
  return rest("GET", "shipping_zones?select=*&order=state").then(function(zones){
    clear(panel);
    panel.appendChild(h("h1", { text:"Shipping" }));
    panel.appendChild(h("p", { class:"small", text:"Fees are in Naira and are added automatically at checkout based on the customer’s state. Untick “On” to stop delivering to a location. Estimated delivery text is optional — leave it empty until confirmed." }));
    var tbody = h("tbody");
    zones.forEach(function(z){ tbody.appendChild(zoneRow(z)); });
    panel.appendChild(h("div", { class:"table-wrap" }, h("table", { class:"admin-table" },
      h("thead", {}, h("tr", {}, ["Location","Fee (₦)","Estimated delivery","On",""].map(function(c){ return h("th", { scope:"col", text:c }); }))), tbody)));
    var st = h("input", { id:"nz-s", type:"text", maxLength:40 }), fee = h("input", { id:"nz-f", type:"number", min:"0", step:"100", value:"10000" });
    var add = h("button", { type:"button", class:"btn solid", text:"Add location" });
    add.addEventListener("click", function(){
      var s = st.value.trim(); var f = parseInt(fee.value, 10);
      if(!s || !(f >= 0)){ say("Enter a location name and a fee.", true); return; }
      saveWrap(add, rest("POST", "shipping_zones", { state:s, fee_ngn:f, active:true }).then(function(){ showTab("shipping"); }), s + " added.");
    });
    panel.appendChild(h("section", { class:"card", style:"margin-top:20px;" }, h("h2", { text:"Add a delivery location" }),
      h("div", { class:"grid-2" }, field("Location name", st, "nz-s"), field("Fee (₦)", fee, "nz-f")), h("div", { class:"row-actions" }, add)));
  });
}
function zoneRow(z){
  var fee = h("input", { type:"number", min:"0", step:"100", value:String(z.fee_ngn), "aria-label":"Fee for " + z.state });
  var est = h("input", { type:"text", value:z.est_delivery || "", maxLength:80, "aria-label":"Estimated delivery for " + z.state, placeholder:"e.g. 3–5 working days" });
  var on = h("input", { type:"checkbox", checked:!!z.active, "aria-label":z.state + " delivery on" });
  var save = h("button", { type:"button", class:"btn", text:"Save" });
  save.addEventListener("click", function(){
    var f = parseInt(fee.value, 10); if(!(f >= 0)){ say("Fee must be a number, 0 or more.", true); return; }
    saveWrap(save, rest("PATCH", "shipping_zones?id=eq." + z.id, { fee_ngn:f, est_delivery:est.value.trim() || null, active:on.checked }), z.state + " saved.");
  });
  return h("tr", {}, h("th", { scope:"row", text:z.state }), h("td", {}, fee), h("td", {}, est), h("td", {}, on), h("td", {}, save));
}

/* ---------- SETTINGS ---------- */
function tabSettings(panel){
  return rest("GET", "settings?select=*").then(function(rows){
    var S = {}; rows.forEach(function(r){ S[r.key] = r.value; });
    clear(panel);
    panel.appendChild(h("h1", { text:"Settings" }));
    function upsert(key, value, isPublic){ return rest("POST", "settings?on_conflict=key", { key:key, value:value, is_public:isPublic !== false }, "resolution=merge-duplicates"); }

    var rate = h("input", { id:"s-rate", type:"number", min:"0", step:"0.01", value:String(S.usd_ngn_rate || 0) });
    var rSave = h("button", { type:"button", class:"btn solid", text:"Save exchange rate" });
    rSave.addEventListener("click", function(){ var r = num(rate.value); if(!(r >= 0)){ say("Enter a number, 0 or more.", true); return; } saveWrap(rSave, upsert("usd_ngn_rate", r), "Exchange rate saved."); });
    panel.appendChild(h("section", { class:"card" }, h("h2", { text:"USD to NGN exchange rate" }),
      h("p", { class:"small", text:"How many Naira equal $1. Customers see prices in USD (or NGN) and always pay in Naira at this rate. Orders keep the rate they were placed at. Checkout can’t open while this is 0." }),
      field("₦ per $1", rate, "s-rate"), h("div", { class:"row-actions" }, rSave)));

    var open = h("input", { id:"s-open", type:"checkbox", checked:S.checkout_enabled === true });
    var oSave = h("button", { type:"button", class:"btn solid", text:"Save checkout setting" });
    oSave.addEventListener("click", function(){ saveWrap(oSave, upsert("checkout_enabled", open.checked), open.checked ? "Checkout is OPEN to customers." : "Checkout is closed."); });
    panel.appendChild(h("section", { class:"card" }, h("h2", { text:"Checkout open" }),
      h("div", { class:"warn", text:"Tick this only when you’re ready for customers to order. If the Paystack key on the server is still a TEST key, payments are fake: orders will carry a black TEST badge and no real money moves. Don’t publicise the shop until you’ve switched to the live key." }),
      h("label", {}, open, " Customers can place orders"), h("div", { class:"row-actions" }, oSave)));

    var note = h("textarea", { id:"s-note", rows:2, maxLength:300, value:S.delivery_note || "" });
    var nSave = h("button", { type:"button", class:"btn solid", text:"Save delivery note" });
    nSave.addEventListener("click", function(){ saveWrap(nSave, upsert("delivery_note", note.value.trim()), "Delivery note saved."); });
    panel.appendChild(h("section", { class:"card" }, h("h2", { text:"Delivery timeline note" }),
      h("p", { class:"small", text:"Shown at checkout and on the shipping page when a location has no estimate of its own." }),
      field("Text", note, "s-note"), h("div", { class:"row-actions" }, nSave)));

    var pol = h("textarea", { id:"s-pol", rows:12, maxLength:8000, value:S.returns_policy || "" });
    var pSave = h("button", { type:"button", class:"btn solid", text:"Save returns policy" });
    pSave.addEventListener("click", function(){ saveWrap(pSave, upsert("returns_policy", pol.value.trim()), "Returns policy saved — it’s live on the Returns page now."); });
    panel.appendChild(h("section", { class:"card" }, h("h2", { text:"Returns & refunds policy" }),
      h("p", { class:"small", text:"Write your policy here when it’s ready. Leave a blank line between paragraphs. Until you save something, the Returns page says the policy isn’t finalised. Have a qualified lawyer review it." }),
      field("Policy text", pol, "s-pol"), h("div", { class:"row-actions" }, pSave)));
  });
}

/* ---------- boot ---------- */
if(!CFG.url){ say("Store connection isn’t configured (config.js).", true); }
else {
  loadSession();
  if(session && session.access_token){
    rest("GET", "admins?select=email").then(function(rows){ if(rows && rows.length){ start(); } else { signOut(""); } }).catch(function(){ signOut(""); });
  } else { renderLogin(); }
}
})();
