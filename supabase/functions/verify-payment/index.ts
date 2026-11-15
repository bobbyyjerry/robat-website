// ROBAT — verify-payment
// Called by the order-status page after the customer returns from Paystack.
// Asks Paystack directly for the real result and only marks the order paid
// if reference, amount and currency all match. Reaching the page proves nothing.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "");

function allowedOrigin(req: Request): string {
  let origin = "";
  try { origin = new URL(SITE_URL).origin; } catch (_) { /* */ }
  const extra = (Deno.env.get("EXTRA_ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const reqOrigin = req.headers.get("origin") ?? "";
  return [origin, ...extra].includes(reqOrigin) ? reqOrigin : origin;
}
function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(req),
    "Access-Control-Allow-Headers": "content-type, apikey, authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });
}
async function rpc(name: string, args: Record<string, unknown>) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const text = await r.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch (_) { /* */ }
  return { ok: r.ok, data };
}

// ---------------- receipt email (via Resend) ----------------
// Sent once per paid order. If RESEND_API_KEY / RECEIPT_FROM are not set,
// nothing is sent and payments carry on working normally.
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RECEIPT_FROM = Deno.env.get("RECEIPT_FROM") ?? ""; // e.g. ROBAT <orders@robatfit.com>
const RECEIPT_REPLY_TO = Deno.env.get("RECEIPT_REPLY_TO") ?? "info@robatfit.com";
const RECEIPT_SITE = (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "");
const BIZ = { name: "ROBAT FIT LTD", rc: "RC 9863999", address: "46, Royal Palm Drive, Ikoyi, Lagos, Nigeria", email: "info@robatfit.com" };

function escHtml(s: unknown) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function naira(n: unknown) { return "₦" + Math.round(Number(n) || 0).toLocaleString("en-NG"); }
function lagosTime(iso: unknown) {
  try { return new Date(String(iso)).toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "long", timeStyle: "short" }) + " (Lagos)"; }
  catch (_) { return String(iso ?? ""); }
}
function receiptLink(o: any) {
  return RECEIPT_SITE ? `${RECEIPT_SITE}/order-status.html?o=${encodeURIComponent(o.order_number)}&t=${encodeURIComponent(o.token)}` : "";
}
function receiptText(o: any) {
  const lines = [
    o.is_test ? "TEST RECEIPT - Paystack test mode, no real money was taken.\n" : "",
    `ROBAT - Receipt for order ${o.order_number}`, "",
    `Thank you${o.name ? ", " + String(o.name).split(" ")[0] : ""}. We have received your payment.`, "",
    `Order number: ${o.order_number}`, `Date paid: ${lagosTime(o.paid_at)}`,
    `Payment method: ${o.channel ? o.channel + " (Paystack)" : "Paystack"}`, `Payment reference: ${o.reference}`, "",
    ...(o.items ?? []).map((i: any) => `${i.qty} x ${i.name} (${i.color} / ${i.size})${i.is_preorder ? " - preorder" : ""}: ${naira(i.line_ngn)}`),
    "", `Subtotal: ${naira(o.subtotal_ngn)}`, `Delivery (${o.ship_state}): ${naira(o.shipping_ngn)}`, `TOTAL PAID: ${naira(o.total_ngn)}`, "",
    `Deliver to: ${o.name}, ${o.ship_line1}, ${o.ship_city}, ${o.ship_state}. Phone: ${o.phone}`, "",
    "Delivery timelines will be confirmed after your order.",
    receiptLink(o) ? `View your order: ${receiptLink(o)}` : "", "",
    `${BIZ.name}, ${BIZ.rc}, ${BIZ.address}. Questions: ${BIZ.email}`, "Payment processed securely by Paystack.",
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}
function receiptHtml(o: any) {
  const ink = "#2a2013", paper = "#efe4cd", card = "#f6efe0", muted = "#5b4b34", accent = "#97512e", line = "#d8c9a8";
  const row = (k: string, v: string) => `<tr><td style="padding:6px 0;color:${muted};font-size:13px;">${k}</td><td style="padding:6px 0;text-align:right;font-size:13px;">${v}</td></tr>`;
  const items = (o.items ?? []).map((i: any) => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${line};font-size:14px;">${escHtml(i.name)}<br><span style="color:${muted};font-size:12px;">${escHtml(i.color)} / ${escHtml(i.size)}${i.is_preorder ? " &middot; Preorder" : ""}</span></td>
      <td style="padding:10px 0;border-bottom:1px solid ${line};text-align:center;font-size:14px;">${escHtml(i.qty)}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${line};text-align:right;font-size:14px;">${naira(i.line_ngn)}</td></tr>`).join("");
  const link = receiptLink(o);
  return `<!doctype html><html><body style="margin:0;padding:0;background:${paper};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${paper};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${card};border:1px solid ${line};font-family:Helvetica,Arial,sans-serif;color:${ink};">
<tr><td style="padding:28px 28px 8px;font-size:26px;font-weight:800;letter-spacing:2px;">ROBAT</td></tr>
${o.is_test ? `<tr><td style="padding:0 28px;"><div style="background:${ink};color:${paper};padding:10px 12px;font-size:12px;letter-spacing:1px;">TEST RECEIPT &mdash; Paystack test mode. No real money was taken.</div></td></tr>` : ""}
<tr><td style="padding:16px 28px 0;">
  <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${accent};">Receipt</div>
  <h1 style="margin:6px 0 10px;font-size:22px;">Thank you${o.name ? ", " + escHtml(String(o.name).split(" ")[0]) : ""}.</h1>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">We&#39;ve received your payment and your order is confirmed.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${row("Order number", `<strong>${escHtml(o.order_number)}</strong>`)}
    ${row("Date paid", escHtml(lagosTime(o.paid_at)))}
    ${row("Payment method", escHtml(o.channel ? String(o.channel).charAt(0).toUpperCase() + String(o.channel).slice(1) + " (Paystack)" : "Paystack"))}
    ${row("Payment reference", escHtml(o.reference))}
  </table>
</td></tr>
<tr><td style="padding:18px 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><th align="left" style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${muted};border-bottom:1px solid ${ink};padding:6px 0;">Item</th>
        <th style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${muted};border-bottom:1px solid ${ink};padding:6px 0;">Qty</th>
        <th align="right" style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${muted};border-bottom:1px solid ${ink};padding:6px 0;">Amount</th></tr>
    ${items}
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
    ${row("Subtotal", naira(o.subtotal_ngn))}
    ${row("Delivery &mdash; " + escHtml(o.ship_state), naira(o.shipping_ngn))}
    <tr><td style="padding:10px 0;border-top:1px solid ${ink};font-size:15px;font-weight:700;">Total paid</td><td style="padding:10px 0;border-top:1px solid ${ink};text-align:right;font-size:18px;font-weight:800;">${naira(o.total_ngn)}</td></tr>
  </table>
</td></tr>
<tr><td style="padding:14px 28px 0;font-size:13px;line-height:1.6;">
  <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${muted};">Delivering to</div>
  ${escHtml(o.name)}<br>${escHtml(o.ship_line1)}<br>${escHtml(o.ship_city)}, ${escHtml(o.ship_state)}<br>${escHtml(o.phone)}
  <p style="margin:14px 0 0;color:${muted};">Delivery timelines will be confirmed after your order.</p>
  ${link ? `<p style="margin:18px 0 0;"><a href="${escHtml(link)}" style="display:inline-block;background:${ink};color:${paper};padding:12px 18px;text-decoration:none;font-size:13px;letter-spacing:1px;">VIEW YOUR ORDER</a></p>` : ""}
</td></tr>
<tr><td style="padding:24px 28px 28px;font-size:11.5px;line-height:1.6;color:${muted};border-top:1px solid ${line};margin-top:20px;">
  <br>${BIZ.name} &middot; ${BIZ.rc}<br>${BIZ.address}<br>Questions? Reply to this email or write to <a href="mailto:${BIZ.email}" style="color:${accent};">${BIZ.email}</a>.<br>Payment processed securely by Paystack. ROBAT never sees your card details.
</td></tr>
</table></td></tr></table></body></html>`;
}
async function sendReceipt(orderNumber: string) {
  if (!RESEND_KEY || !RECEIPT_FROM) return; // email not set up yet
  try {
    const claim = await rpc("claim_receipt", { p_order_number: orderNumber });
    const o = claim.data;
    if (!claim.ok || !o || !o.email) return; // already sent (or not paid)
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `robat-receipt-${o.order_number}` },
      body: JSON.stringify({
        from: RECEIPT_FROM, to: [o.email], reply_to: RECEIPT_REPLY_TO,
        subject: `${o.is_test ? "[TEST] " : ""}Your ROBAT receipt — ${o.order_number}`,
        html: receiptHtml(o), text: receiptText(o),
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      console.error("receipt email failed", r.status);
      await rpc("release_receipt_claim", { p_order_number: o.order_number, p_error: `email ${r.status}: ${t.slice(0, 200)}` });
    }
  } catch (_e) {
    console.error("receipt email error");
    await rpc("release_receipt_claim", { p_order_number: orderNumber, p_error: "network error" }).catch(() => {});
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);
  if (!PAYSTACK_SECRET) return json(req, { error: "not_configured" }, 503);

  let body: any;
  try { body = await req.json(); } catch (_) { return json(req, { error: "bad_json" }, 400); }
  const orderNumber = typeof body?.order_number === "string" ? body.order_number.slice(0, 40) : "";
  let token = typeof body?.token === "string" ? body.token.slice(0, 80) : "";
  const lookupEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  if (!/^ROBAT-[0-9A-Z-]+$/.test(orderNumber) || (!token && !lookupEmail)) return json(req, { error: "not_found" }, 404);
  if (!token) {
    // "Track your order": order number + the email used at checkout
    const found = await rpc("find_order_token", { p_order_number: orderNumber, p_email: lookupEmail });
    token = typeof found.data === "string" ? found.data : "";
    if (!token) return json(req, { error: "not_found" }, 404);
  }

  let order = (await rpc("get_order_for_token", { p_order_number: orderNumber, p_token: token })).data;
  if (!order) return json(req, { error: "not_found" }, 404);

  let gatewayStatus = "";
  if (order.payment_status === "pending" || order.payment_status === "expired") {
    try {
      const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });
      const ps = await r.json().catch(() => null);
      const d = ps?.data;
      if (r.ok && ps?.status && d) {
        gatewayStatus = typeof d.status === "string" ? d.status : "";
        if (d.status === "success") {
          await rpc("mark_order_paid", {
            p_order_number: orderNumber, p_reference: String(d.reference ?? ""),
            p_amount_kobo: Number(d.amount ?? 0), p_currency: String(d.currency ?? ""),
            p_channel: typeof d.channel === "string" ? d.channel : null,
          });
        } else if (d.status === "failed") {
          await rpc("mark_order_failed", { p_order_number: orderNumber });
        }
        // "abandoned", "ongoing", "pending", "queued": leave as pending
      }
      // 4xx "reference not found" = customer never reached payment: stays pending
    } catch (_e) { /* Paystack unreachable: report pending; the webhook will settle it */ }
  }
  if (order.payment_status === "paid" || gatewayStatus === "success") {
    await sendReceipt(orderNumber); // no-op if already sent or email not configured
  }
  order = (await rpc("get_order_for_token", { p_order_number: orderNumber, p_token: token })).data ?? order;
  // gateway_status lets the page tell "still processing" apart from "closed / declined, not paid"
  return json(req, { order, gateway_status: gatewayStatus, token });
});
