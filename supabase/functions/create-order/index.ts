// ROBAT — create-order
// Validates the cart, recalculates every price ON THE SERVER, reserves stock,
// saves the order as "pending" and asks Paystack for a payment link.
// Never trusts amounts from the browser. The Paystack secret key lives only in
// this function's secrets (PAYSTACK_SECRET_KEY) — never in website files.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "");
const IP_SALT = Deno.env.get("IP_SALT") ?? "robat";

function allowedOrigin(req: Request): string {
  let origin = "";
  try { origin = new URL(SITE_URL).origin; } catch (_) { /* not configured */ }
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
  try { data = JSON.parse(text); } catch (_) { /* keep null */ }
  return { ok: r.ok, status: r.status, data, text };
}
async function readOrderHold(orderNumber: string) {
  const query = new URLSearchParams({ order_number: `eq.${orderNumber}`, select: "payment_status,expires_at,paystack_authorization_url" });
  const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?${query}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) throw new Error("Order hold lookup failed");
  const [hold] = await r.json();
  const expiresAt = Date.parse(hold?.expires_at);
  if (!Number.isFinite(expiresAt)) throw new Error("Order hold expiry missing");
  return { status: hold.payment_status, expiresAt, authorizationUrl: hold.paystack_authorization_url };
}
async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const str = (v: unknown, min: number, max: number) => {
  if (typeof v !== "string") return null;
  const t = v.trim().replace(/[\u0000-\u001f\u007f]/g, " ");
  return t.length >= min && t.length <= max ? t : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);
  if (!PAYSTACK_SECRET || !SITE_URL) return json(req, { error: "not_configured", message: "Payments are not configured yet." }, 503);
  if (Number(req.headers.get("content-length") ?? 0) > 20000) return json(req, { error: "too_large" }, 413);

  let body: any;
  try { body = await req.json(); } catch (_) { return json(req, { error: "bad_json" }, 400); }

  // ---- validate input (shape only; prices are NEVER read from the browser) ----
  const key = str(body?.idempotency_key, 16, 64);
  if (!key || !/^[A-Za-z0-9-]+$/.test(key)) return json(req, { error: "bad_request", message: "Invalid request." }, 400);
  if (body?.accept_terms !== true) return json(req, { error: "terms_required", message: "Please accept the terms to continue." }, 400);

  const c = body?.customer ?? {};
  const name = str(c.name, 2, 100);
  const email = str(c.email, 5, 160);
  const phone = str(c.phone, 7, 24);
  const line1 = str(c.line1, 5, 200);
  const city = str(c.city, 2, 80);
  const state = str(c.state, 2, 40);
  const notes = c.notes ? str(c.notes, 0, 300) : "";
  if (!name || !email || !phone || !line1 || !city || !state || notes === null)
    return json(req, { error: "invalid_details", message: "Please check your contact and delivery details." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(req, { error: "invalid_details", message: "Please enter a valid email address." }, 400);
  if (!/^[+0-9()\-\s]{7,24}$/.test(phone)) return json(req, { error: "invalid_details", message: "Please enter a valid phone number." }, 400);

  if (!Array.isArray(body?.items) || body.items.length < 1 || body.items.length > 10)
    return json(req, { error: "bad_cart", message: "Your cart is empty or invalid." }, 400);
  const items: { slug: string; color: string; size: string; qty: number }[] = [];
  for (const it of body.items) {
    const slug = str(it?.slug, 2, 60), color = str(it?.color, 2, 30), size = str(it?.size, 1, 10);
    const qty = Number(it?.qty);
    if (!slug || !color || !size || !Number.isInteger(qty) || qty < 1 || qty > 10)
      return json(req, { error: "bad_cart", message: "Your cart contains an invalid item." }, 400);
    items.push({ slug, color, size, qty });
  }
  const expected = Number.isInteger(body?.expected_total_ngn) ? body.expected_total_ngn : null;

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const ipHash = await sha256Hex(IP_SALT + ip);

  // ---- create the order + reserve stock (all prices computed inside the database) ----
  const created = await rpc("create_order_tx", {
    p_items: items,
    p_customer: { name, email, phone, line1, city, state, notes },
    p_idempotency_key: key,
    p_expected_total: expected,
    p_ip_hash: ipHash,
    p_is_test: PAYSTACK_SECRET.startsWith("sk_test_"),
  });
  if (!created.ok) {
    const msg: string = created.data?.message ?? "";
    const m = msg.match(/ROBAT:([A-Z_]+)(?::(.*))?/);
    const code = m?.[1] ?? "";
    if (code === "PRICE_CHANGED") return json(req, { error: "price_changed", total_ngn: Number(m?.[2]), message: "Prices or delivery fees were updated. Please review your total." }, 409);
    if (code === "OUT_OF_STOCK") return json(req, { error: "out_of_stock", message: `Sorry, not enough stock: ${m?.[2] ?? "an item in your cart"}.` }, 409);
    if (code === "ITEM_UNAVAILABLE") return json(req, { error: "item_unavailable", message: `An item in your cart is no longer available: ${m?.[2] ?? ""}`.trim() }, 409);
    if (code === "BAD_STATE") return json(req, { error: "bad_state", message: "We can't deliver to that state yet." }, 400);
    if (code === "CHECKOUT_CLOSED" || code === "RATE_NOT_SET") return json(req, { error: "checkout_closed", message: "Checkout is not open yet." }, 503);
    if (code === "RATE_LIMIT") return json(req, { error: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." }, 429);
    if (code === "BAD_CART") return json(req, { error: "bad_cart", message: "Your cart is invalid." }, 400);
    console.error("create_order_tx failed", created.status, String(created.data?.message ?? created.text ?? "").slice(0, 200));
    return json(req, { error: "server_error", message: "Something went wrong. Please try again." }, 500);
  }
  const order = created.data;
  if (order.existing && String(order.email).toLowerCase() !== email.toLowerCase()) {
    return json(req, { error: "order_mismatch", message: "Use the email address from your original checkout to check this payment." }, 409);
  }
  const details = { order_number: order.order_number, public_token: order.public_token };
  const paid = () => json(req, { ...details, error: "already_paid", message: "This order has already been paid." }, 409);
  const closed = () => json(req, { error: "order_closed", message: "This checkout has expired. Please start again." }, 409);
  const checkUnavailable = () => json(req, {
    error: "payment_check_unavailable",
    message: "We couldn’t check your previous payment. Please try again or use Track Your Order before paying again.",
  }, 503);
  if (order.payment_status === "paid") return paid();

  if (order.existing) {
    try {
      // An older Paystack session can finish before its webhook reaches ROBAT.
      // Verify the old reference before allowing the browser to create a new one.
      const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(order.order_number)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        signal: AbortSignal.timeout(7000),
      });
      const verification = await r.json().catch(() => null);
      const transaction = verification?.data;
      if (!r.ok || verification?.status !== true || transaction?.reference !== order.order_number) {
        const neverInitialised = !order.authorization_url && (r.status === 404 ||
          (r.status === 400 && /(?:transaction|reference).*not found/i.test(String(verification?.message ?? ""))));
        if (!neverInitialised) return checkUnavailable();
      } else if (transaction.status === "success") {
        const saved = await rpc("mark_order_paid", {
          p_order_number: order.order_number, p_reference: transaction.reference,
          p_amount_kobo: Number(transaction.amount ?? 0), p_currency: String(transaction.currency ?? ""),
          p_channel: typeof transaction.channel === "string" ? transaction.channel : null,
        });
        return saved.ok && saved.data?.ok === true ? paid() : checkUnavailable();
      } else if (["pending", "ongoing", "processing", "queued"].includes(transaction.status)) {
        return json(req, { ...details, error: "payment_in_progress", message: "Your previous payment is still being checked." }, 409);
      } else if (transaction.status === "failed") {
        const failed = await rpc("mark_order_failed", { p_order_number: order.order_number });
        if (!failed.ok) return checkUnavailable();
      } else if (transaction.status !== "abandoned") {
        return checkUnavailable();
      }

      const hold = await readOrderHold(order.order_number);
      if (hold.status === "paid") return paid();
      if (hold.status !== "pending" || hold.expiresAt <= Date.now()) return closed();
      if (hold.authorizationUrl) {
        return json(req, { ...details, authorization_url: hold.authorizationUrl, total_ngn: order.total_ngn });
      }
    } catch (_) {
      return checkUnavailable();
    }
  }
  if (order.payment_status !== "pending") return closed();

  // ---- ask Paystack for the payment page ----
  const callback = `${SITE_URL}/order-status.html?o=${encodeURIComponent(order.order_number)}&t=${encodeURIComponent(order.public_token)}`;
  let ps: any;
  try {
    const r = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: order.email,
        amount: order.total_ngn * 100, // kobo
        currency: "NGN",
        reference: order.order_number,
        callback_url: callback,
        metadata: { order_number: order.order_number, store: "ROBAT FIT LTD" },
      }),
    });
    ps = await r.json();
    if (!r.ok || !ps?.status || !ps?.data?.authorization_url) {
      console.error("paystack initialize failed", r.status, String(ps?.message ?? "").slice(0, 200));
      return json(req, { error: "gateway_error", message: "We couldn't start the payment. Please try again in a moment." }, 502);
    }
  } catch (_e) {
    return json(req, { error: "gateway_error", message: "We couldn't reach the payment service. Please try again." }, 502);
  }
  await rpc("set_order_payment_init", { p_order_number: order.order_number, p_url: ps.data.authorization_url });
  return json(req, { order_number: order.order_number, public_token: order.public_token, authorization_url: ps.data.authorization_url, total_ngn: order.total_ngn });
});
