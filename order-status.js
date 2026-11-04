/* ROBAT — order status page.
   Paystack sends the customer back here after payment. Arriving here proves
   NOTHING: this page asks the server (verify-payment), which asks Paystack
   directly and checks reference, amount and currency before saying "paid". */
(function(){
"use strict";
var CFG = (window.ROBAT_CONFIG && window.ROBAT_CONFIG.supabase) || {};
var q = new URLSearchParams(window.location.search);
var orderNumber = (q.get("o") || "").trim();
var token = (q.get("t") || "").trim();
var titleEl = document.getElementById("os-title");
var eyebrowEl = document.getElementById("os-eyebrow");
var body = document.getElementById("os-body");
var attempts = 0, MAX_ATTEMPTS = 8;

function ngn(n){ return "₦" + Math.round(n).toLocaleString("en-NG"); }
function el(tag, cls, text){ var e = document.createElement(tag); if(cls){ e.className = cls; } if(text != null){ e.textContent = text; } return e; }
function clear(){ while(body.firstChild){ body.removeChild(body.firstChild); } }
function show(eyebrow, title, nodes){
  eyebrowEl.textContent = eyebrow; titleEl.textContent = title; document.title = title + " — ROBAT";
  clear(); nodes.forEach(function(n){ body.appendChild(n); });
  titleEl.focus({ preventScroll: true });
}
function link(href, text, cls){ var a = el("a", cls || "link", text); a.href = href; return a; }
function contactLine(){
  var p = el("p", "of-note");
  p.appendChild(document.createTextNode("Questions? Email "));
  p.appendChild(link("mailto:info@robatfit.com", "info@robatfit.com"));
  p.appendChild(document.createTextNode(" and quote your order number."));
  return p;
}
function summary(o){
  var wrap = el("div", "os-summary");
  var ul = el("ul", "sum-lines");
  (o.items || []).forEach(function(i){
    var li = el("li");
    li.appendChild(el("span", null, i.name + " · " + i.color + "/" + i.size + " × " + i.qty + (i.is_preorder ? " (preorder)" : "")));
    li.appendChild(el("span", null, ngn(i.line_ngn)));
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  [["Subtotal", o.subtotal_ngn], ["Delivery" + (o.ship_state ? " — " + o.ship_state : ""), o.shipping_ngn]].forEach(function(r){
    var row = el("div", "sum-row"); row.appendChild(el("span", null, r[0])); row.appendChild(el("span", null, ngn(r[1]))); wrap.appendChild(row);
  });
  var tot = el("div", "sum-row sum-total"); tot.appendChild(el("span", null, "Total paid")); tot.appendChild(el("strong", null, ngn(o.total_ngn))); wrap.appendChild(tot);
  return wrap;
}

function freshCheckout(){ try { window.sessionStorage.removeItem("robat_checkout_key"); } catch(e){} }
function fmtDate(iso){
  if(!iso){ return ""; }
  try { return new Date(iso).toLocaleString("en-GB", { timeZone:"Africa/Lagos", dateStyle:"long", timeStyle:"short" }) + " (Lagos)"; }
  catch(e){ return String(iso); }
}
function kv(k, v){ var r = el("div", "sum-row"); r.appendChild(el("span", null, k)); r.appendChild(el("span", null, v || "\u2014")); return r; }
function receipt(o){
  var box = el("section", "os-receipt"); box.setAttribute("aria-label", "Receipt");
  var head = el("div", "os-receipt-head");
  head.appendChild(el("div", "os-receipt-brand", "ROBAT"));
  head.appendChild(el("div", "of-label", "Receipt"));
  box.appendChild(head);
  box.appendChild(kv("Order number", o.order_number));
  box.appendChild(kv("Date paid", fmtDate(o.paid_at)));
  box.appendChild(kv("Payment method", o.channel ? o.channel.charAt(0).toUpperCase() + o.channel.slice(1) + " (Paystack)" : "Paystack"));
  box.appendChild(kv("Payment reference", o.reference));
  box.appendChild(summary(o));
  var to = el("div", "os-receipt-to");
  to.appendChild(el("div", "of-label", "Delivering to"));
  [o.name, o.ship_line1, [o.ship_city, o.ship_state].filter(Boolean).join(", "), o.phone].forEach(function(line){ if(line){ to.appendChild(el("div", null, line)); } });
  box.appendChild(to);
  var biz = (window.ROBAT_CONFIG && window.ROBAT_CONFIG.brand) || {};
  box.appendChild(el("p", "os-receipt-biz", [biz.legalName || "ROBAT FIT LTD", biz.registrationNumber, biz.address, "info@robatfit.com"].filter(Boolean).join(" \u00B7 ") + ". Payment processed by Paystack."));
  return box;
}
function render(o, gateway){
  if(o.payment_status === "paid"){
    try { window.localStorage.removeItem("robat_cart_v1"); window.sessionStorage.removeItem("robat_checkout_key"); } catch(e){}
    var nodes = [];
    if(o.is_test){ var tb = el("p", "of-msg is-error", "TEST ORDER \u2014 this was paid with Paystack test mode. No real money was taken."); tb.setAttribute("role", "alert"); nodes.push(tb); }
    nodes.push(el("p", "lead", "Thank you" + (o.name ? ", " + o.name.split(" ")[0] : "") + ". Your payment has been verified and your order is confirmed."));
    nodes.push(receipt(o));
    nodes.push(el("p", "of-note", o.receipt_sent
      ? "We\u2019ve emailed a copy of this receipt to " + (o.email || "you") + ". If you can\u2019t find it, check your spam folder."
      : "Keep this receipt: use the button below to print it or save it as a PDF."));
    nodes.push(el("p", "of-note", "Delivery timelines will be confirmed after your order, and we will contact you using the details you gave us."));
    nodes.push(contactLine());
    var actions = el("div", "os-actions");
    var printBtn = el("button", "btn solid", "Print / save receipt as PDF"); printBtn.type = "button";
    printBtn.addEventListener("click", function(){ window.print(); });
    actions.appendChild(printBtn);
    actions.appendChild(link("index.html#/shop", "Continue shopping", "btn"));
    nodes.push(actions);
    show("Order confirmed", "Payment confirmed", nodes);
    return true;
  }
  if(o.payment_status === "failed"){
    freshCheckout();
    show("Order status", "Payment failed", [
      el("p", "lead", "Your payment didn’t go through, so no order was placed and you have not been charged by us. Your cart is still saved."),
      link("index.html#/cart", "Back to cart and try again", "btn solid"), contactLine()]);
    return true;
  }
  if(o.payment_status === "expired"){
    freshCheckout();
    show("Order status", "This checkout expired", [
      el("p", "lead", "We held your items for a short time but didn’t receive a payment, so the hold was released. Your cart is still saved."),
      link("index.html#/cart", "Back to cart", "btn solid"), contactLine()]);
    return true;
  }
  if(gateway === "abandoned" || gateway === "failed"){
    /* Paystack says nothing was paid on this attempt (window closed, card declined, or cancelled) */
    freshCheckout();
    show("Order status", "Payment not completed", [
      el("p", "lead", "Your payment wasn\u2019t completed \u2014 for example the card was declined or the payment window was closed. You have not been charged. Your cart is still saved."),
      link("index.html#/cart", "Back to cart and try again", "btn solid"), contactLine()]);
    return true;
  }
  return false; /* still processing */
}

function showPendingFinal(o){
  var num = el("p", "os-number"); num.appendChild(document.createTextNode("Order number: ")); num.appendChild(el("strong", null, o ? o.order_number : orderNumber));
  show("Order status", "Payment pending", [
    el("p", "lead", "We haven’t received confirmation of your payment yet. This can take a few minutes with bank transfers or if you closed the payment page early."),
    el("p", null, "Please don’t pay a second time. If money left your account, your order will be confirmed automatically once Paystack tells us — you can refresh this page in a few minutes."),
    num, contactLine(), link("index.html#/cart", "Back to cart", "btn")]);
}
function showProblem(msg){
  show("Order status", "We couldn’t check this order", [
    el("p", "lead", msg), contactLine(), link("index.html", "Back to ROBAT", "btn")]);
}

function check(){
  attempts++;
  fetch(CFG.url + "/functions/v1/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: CFG.publishableKey },
    body: JSON.stringify({ order_number: orderNumber, token: token })
  }).then(function(r){
    if(r.status === 404){ throw { notFound: true }; }
    if(!r.ok){ throw new Error("HTTP " + r.status); }
    return r.json();
  }).then(function(j){
    var o = j && j.order;
    if(!o){ throw { notFound: true }; }
    if(render(o, j.gateway_status)){ return; }
    if(attempts < MAX_ATTEMPTS){
      body.firstChild && (body.firstChild.textContent = "Still waiting for confirmation from Paystack… (" + attempts + "/" + MAX_ATTEMPTS + ")");
      window.setTimeout(check, 3000);
    } else { showPendingFinal(o); }
  }).catch(function(e){
    if(e && e.notFound){ showProblem("This link isn’t valid, or the order could not be found."); return; }
    if(attempts < MAX_ATTEMPTS){ window.setTimeout(check, 4000); return; }
    showProblem("We couldn’t reach our server to check your payment. If you have paid, your order is safe — please contact us with your order number.");
  });
}

if(!/^ROBAT-[0-9A-Z-]+$/.test(orderNumber) || !token || !CFG.url){
  showProblem("This link isn’t valid. If you were trying to check an order, open the link from your payment confirmation again.");
} else { check(); }
})();
