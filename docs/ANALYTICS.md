# ROBAT analytics

GA4 uses Measurement ID G-C7V7VVRZ6J. Clarity uses Project ID zg5220pqhq.
The Google tag loads directly through analytics.js.

## Account settings

In Google Analytics, select the ROBAT web data stream. Under Enhanced measurement,
open Page views → Advanced settings and disable Page changes based on browser history.
That setting was disabled during installation. ROBAT emits pageviews and ecommerce
events itself. A second GA4 tag for this
Measurement ID in Google Tag Manager would also duplicate data.

GA4 automatically treats purchase as a key event. Installation also created the
preorder_click key event using the Create with code option. That event
records a successful preorder Add To Cart action. The separate begin_checkout
event records entry to an available checkout form.

In Clarity, recordings and heatmaps begin after the visitor allows analytics.
Recordings exclude checkout, order tracking, receipt and Admin pages. Public
pages containing unexpected query parameters are excluded from recordings too.

## Where to look

- GA4 Realtime shows recent active visitors and their events.
- GA4 Reports → Acquisition → Traffic acquisition shows source and medium.
- GA4 ecommerce reports show view_item, add_to_cart, begin_checkout and purchase.
- Clarity shows public-page recordings, heatmaps and shopping intent events.

Social apps can remove referrers. Use tagged bio and campaign links to make
Instagram and TikTok attribution reliable. For example,
https://robatfit.com/shop/?utm_source=instagram&utm_medium=social&utm_campaign=genera
and the same URL with utm_source=tiktok. Google search referrals are detected
from the referring site. Tag values must use letters, numbers, spaces, dots,
hyphens or underscores, and must exclude personal details.

## Consent and purchase limits

Vendors load only on robatfit.com or www.robatfit.com after consent.
Analytics preferences in the footer can change the saved choice. Declining
after accepting clears accessible GA4 and Clarity first-party cookies and reloads
the page to stop recording.

The receipt page sends purchase only after verify-payment returns
payment_status paid with is_test false. Failed, pending and test
payments are excluded. Cancelled orders are excluded. A paid order awaiting
stock review includes stock_review true, because payment was received.
Revenue is the item subtotal in NGN. Shipping is a separate field.

The browser keeps a ledger of sent order references, with a Web Lock to avoid
duplicate sends from simultaneous tabs. GA4 also receives transaction_id.
Consent denial, blockers, closing the payment page before returning, or never
opening the receipt page can prevent a purchase from appearing in Analytics.
Use ROBAT Admin and Paystack for the complete payment record.

Customer names, emails, phone numbers, delivery addresses and private order
tokens are excluded from event payloads. Receipt pageviews use a generic title
and a URL without its query string. Local verification uses stub vendors and
payment fixtures so it cannot create production sales or analytics conversions.
