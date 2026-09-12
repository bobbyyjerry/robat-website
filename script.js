(function(){
"use strict";

/* ============================================================
   BRAND MARK — the actual ROBAT "R" logo (user-supplied),
   embedded as data URIs. Black variant for light/sand
   backgrounds (nav, footer); cream variant for the dark hero
   watermark.
   ============================================================ */
var MARK_BLACK = "images/logo-black.png";
var MARK_CREAM = "images/logo-cream.png";

/* ============================================================
   CAMPAIGN PHOTOGRAPHY — real ROBAT lifestyle/campaign imagery
   (user-supplied), embedded as data URIs. Used as cover-fit
   backgrounds on the .visual "proof sheet" frame wherever real
   photography exists; slots without a matching photo keep the
   gradient placeholder system.
   ============================================================ */
var PHOTO_HOME_HERO = "images/home-hero.jpg";
var PHOTO_BRAND_CAMPAIGN = "images/brand-campaign.jpg";
var PHOTO_EDITORIAL_TRAINING = "images/editorial-training.jpg";
var PHOTO_EDITORIAL_LIFESTYLE = "images/editorial-lifestyle.jpg";
var PHOTO_ABOUT_HERO = "images/about-hero.jpg";
var PHOTO_ABOUT_PEOPLE = "images/about-people.jpg";
var PHOTO_ABOUT_PROGRESS = "images/about-progress.jpg";
var PHOTO_SHORT_FRONT = "images/short-front.jpg";
var PHOTO_SHORT_BACK = "images/short-back.jpg";
var PHOTO_SHORT_WORN = "images/short-worn.jpg";
var PHOTO_SHIRT_WORN = "images/shirt-worn.jpg";
var PHOTO_SHIRT_FRONT = "images/shirt-front.jpg";
var PHOTO_SHIRT_BACK = "images/shirt-back.jpg";
var PHOTO_FULL_OUTFIT = "images/full-outfit.jpg";

/* ============================================================
   VISUAL PLACEHOLDER SYSTEM
   Stands in for campaign photography the brand doesn't have yet.
   Every slot carries a plain mono caption so nothing is presented
   as a finished photograph; swap the markup in visual() for real
   <img> tags once photography is delivered.
   ============================================================ */
function visual(opts){
  opts = opts || {};
  if(!opts.photo){ return ""; }
  var cls = "visual has-photo" + (opts.className ? " " + opts.className : "") + (opts.small ? " small" : "");
  var styleParts = ["background-image:url('" + opts.photo + "')"];
  if(opts.ratio){ styleParts.push("aspect-ratio:" + opts.ratio); }
  if(opts.gridRow){ styleParts.push("grid-row:" + opts.gridRow); }
  var style = ' style="' + styleParts.join(";") + '"';
  return '<div class="' + cls + '"' + style + ' data-visual="1">' +
    '<span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>' +
    '<span class="visual-caption">' + (opts.caption || "") + '</span>' +
    '</div>';
}

/* ============================================================
   JOURNAL CONTENT
   Original brand-voice essays — not sourced from anywhere.
   ============================================================ */
var ARTICLES = [
  {
    slug: "on-progress",
    tag: "ENTRY 01",
    tone: "b",
    title: "On Progress",
    dek: "Why we built a philosophy pillar around something that never actually finishes.",
    body: [
      "Progress is the hardest of the three words to design for, because it refuses to hold still. People is a group you can picture. Purpose is a line you can write down and stand behind. Progress is a direction, not a destination — which makes it a strange thing to put at the center of a brand.",
      "We kept it anyway, because it is the truest word we have for what actually happens inside a training session. Nobody walks into a gym already finished. The whole point of showing up is that you are not done, and you are choosing to close the gap by one more rep, one more set, one more early morning, instead of waiting for motivation to close it for you.",
      "That is the version of progress ROBAT is built around — not a highlight reel, not a transformation photo, but the unglamorous middle part where the work actually happens. A garment cannot make that part easier. What it can do is stay out of the way: no seam that rubs on rep forty, no fabric that traps heat on the fifth round, no fit that shifts when the position gets awkward. Engineering in service of a session nobody is filming.",
      "So when we say Progress, we do not mean a finish line. We mean the version of you that is still being built, one ordinary session at a time — and a brand that is trying to keep pace with that, rather than get ahead of it."
    ]
  },
  {
    slug: "fabric-first",
    tag: "ENTRY 02",
    tone: "c",
    title: "Why We Start With Fabric",
    dek: "Most brands start with a look. ROBAT starts with how a garment behaves under load.",
    body: [
      "It would be faster to start with a silhouette. Pick a cut, pick a colorway, pick a logo placement, and work backward until something is ready to photograph. A lot of gymwear gets built exactly that way, and it is usually possible to tell — the garment looks right standing still and stops behaving the moment a body starts moving through a real range of motion.",
      "We start further back than that, with the fabric itself: how it stretches, how much of that stretch it gives back after the two-hundredth rep instead of the first, how it manages heat and moisture across a forty-five minute session rather than a five-minute fitting-room mirror. None of that is visible in a product photo. All of it is what a garment is actually judged on by the person wearing it.",
      "Fit and construction get layered on top of that foundation, not the other way around. A pattern is only as good as the material it is cut from, and a seam is only as strong as its weakest point under the specific stresses a squat, a pull-up, or a sprint actually put on it. Fabric first is slower. It is also the only order that produces a garment that still performs after the newness has worn off.",
      "This is the same reason GENERA, our first generation of product, is still in development rather than already on the site. We would rather take the time to get the fabric right than ship a silhouette that only works in a photograph."
    ]
  },
  {
    slug: "training-beyond-the-gym",
    tag: "ENTRY 03",
    tone: "d",
    title: "Training Beyond The Gym",
    dek: "The habits built on the platform rarely stay on the platform.",
    body: [
      "Nobody leaves discipline at the door on the way out of a gym. The same person who shows up for the early session tends to show up early for everything else, too — the same person who tracks a lift tends to track other things that matter to them. Training does not stay contained to the hour it happens in.",
      "That is the thinking behind Purpose before polish, and behind building ROBAT as a brand for the whole day rather than just the workout inside it. A garment that only works in the gym is solving half the problem. One built to move from a training session into the rest of a normal day — without changing, without standing out for the wrong reasons — is solving the one people actually have.",
      "It also changes what \"performance\" means to us. Performance is not only how a fabric handles a heavy set. It is whether the same piece still feels right three hours later, worn somewhere that has nothing to do with training at all. Quiet enough to disappear on the body, considered enough to hold up under real use — that is the standard, on the platform and off it."
    ]
  },
  {
    slug: "why-no-products-yet",
    tag: "ENTRY 04",
    tone: "b",
    title: "Why We Don't Have Products Yet",
    dek: "The honest answer, and why we&#39;d rather give you that than a countdown timer.",
    body: [
      "The easiest thing we could do right now is put a countdown clock on this page. Manufactured urgency is a well-worn playbook — it works, it drives signups, and it costs nothing to build. We are not doing it, and the reason is the same one behind every placeholder image on this site: we would rather show you exactly where things stand than dress up an unfinished process as a finished one.",
      "Where things actually stand is this. GENERA, ROBAT&#39;s first generation of product, is in development. Fabric is being selected and tested. Patterns are being cut and worn. None of that is done in a way we would put our name on yet, so none of it is on this site pretending otherwise — every placeholder image says so plainly in its caption, and the product timeline gets the same treatment.",
      "We understand this is a slower way to build a brand than launching first and fixing problems in public. It is also the only way we know to make sure the first thing you can actually buy from ROBAT holds up to the standard the rest of this site claims to have. A shirt is easy to ship. A shirt worth wearing after the fortieth wash takes longer, and we would rather take that time before asking for your money than after.",
      "So this page will stay honest instead of exciting for a while longer. If that is frustrating, the Journal and the newsletter are the two places real updates land first — not a hype cycle, just what is actually true, when it becomes true."
    ]
  },
  {
    slug: "fewer-better-things",
    tag: "ENTRY 05",
    tone: "d",
    title: "The Case For Fewer, Better Things",
    dek: "Why ROBAT starts with one generation of two garments instead of twenty SKUs.",
    body: [
      "There is a version of this brand that launches with a full range on day one — five colorways, three fits, a matching jacket, a hat. It photographs well as a grid. It is also, almost always, a sign that none of the individual pieces got the attention a single, well-built garment actually requires.",
      "GENERA is deliberately narrow: one generation, two garments, built to the same standard and sharing one design language. Not because a wider range is a bad idea eventually, but because it is much harder to compromise on fabric, fit and construction when there are only two things to get right instead of twenty. Depth before breadth is a constraint we are choosing on purpose, not a limitation we are working around.",
      "It also makes the brand easier to hold accountable. When there are only two products, there is nowhere to hide a weak one inside a large catalog — every piece has to earn its place, the same standard the Purpose pillar asks of every seam and panel. A second generation will only exist once the first one has actually proven it belongs.",
      "This is slower, and it means ROBAT will look smaller than brands that launched with everything at once. We think that is a reasonable trade for a first generation you can actually trust."
    ]
  }
];
function getArticle(slug){
  for(var i=0;i<ARTICLES.length;i++){ if(ARTICLES[i].slug === slug) return ARTICLES[i]; }
  return null;
}

/* ============================================================
   PILLARS — People / Progress / Purpose, each its own page
   ============================================================ */
var PILLARS = [
  {
    slug: "people", tag: "01 &mdash; People", title: "People", tone: "a", photo: PHOTO_ABOUT_PEOPLE,
    dek: "The people who train, move and wear ROBAT &mdash; and the discipline they show up with.",
    body: [
      "People come first because a garment is only as good as how it behaves on someone actually training in it. Before a fabric or a fit decision gets made, the question is what a real body needs across a real session &mdash; not what looks convincing in a still photograph.",
      "That means paying attention to the parts other brands skip: how a seam sits under a loaded bar, whether a hem stays put through a sprint, whether a fabric still feels good on the fortieth wear instead of just the first. Small details, but they are the difference between a garment that survives a training life and one that only survives a fitting room.",
      "It also shapes how ROBAT talks about itself. No aspirational-only imagery standing in for the people who actually show up to train &mdash; the goal is a brand that looks like the gym it is meant to be worn in. Discipline, not decoration.",
      "People. Progress. Purpose. only works as a philosophy if People is not just the first word on a page. It has to be the starting condition for every other decision the brand makes, and it is."
    ]
  },
  {
    slug: "progress", tag: "02 &mdash; Progress", title: "Progress", tone: "b", photo: PHOTO_ABOUT_PROGRESS,
    dek: "The middle of the work, not the finish line &mdash; the thing the brand is actually built to keep pace with.",
    body: [
      "Progress is the hardest of the three pillars to point at, because it never resolves into a single image. There is no finish line to photograph, no before-and-after that captures what showing up for the two-hundredth session actually feels like.",
      "That is exactly why it sits at the center of the brand. Most of what happens inside a training session is unglamorous and repetitive &mdash; the extra rep nobody records, the early morning nobody posts about. ROBAT is designed for that version of progress, not the highlight-reel version.",
      "In practice, that means engineering decisions get made for the ordinary rep, not the personal record. A seam has to hold up on set four just as well as set one. A fabric has to manage heat across the full session, not just look good walking in.",
      "The Journal has a longer essay on this exact idea, written the same way the brand is built &mdash; one honest paragraph at a time, not a highlight reel."
    ]
  },
  {
    slug: "purpose", tag: "03 &mdash; Purpose", title: "Purpose", tone: "c", photo: null,
    dek: "Nothing on a ROBAT garment is decoration. Every detail has to earn its place.",
    body: [
      "Purpose is the pillar that gets tested last on every decision, and it is the strictest one. Before a panel, a seam, a print or a supplier gets approved, the question is simple: what is this actually for?",
      "That standard cuts things a lot of gymwear keeps by default &mdash; branding for the sake of branding, a panel added because it photographs well rather than because it does anything, a feature that exists to fill a spec sheet instead of solve a real problem.",
      "It is a slower way to design, because saying no to something takes longer than saying yes to everything. But it is the only way we know to end up with a garment where every part of it can answer the same question honestly.",
      "Purpose before polish is not a slogan here &mdash; it is closer to a filter every single design choice has to pass through before it is allowed to exist on a ROBAT product."
    ]
  }
];
function getPillar(slug){
  for(var i=0;i<PILLARS.length;i++){ if(PILLARS[i].slug === slug) return PILLARS[i]; }
  return null;
}

/* ============================================================
   VALUES — Six Values, No Exceptions, each its own page
   ============================================================ */
var VALUES = [
  {
    slug: "discipline", num: "01", title: "Discipline",
    short: "Showing up for the unglamorous parts, on the training floor and in how we build.",
    body: [
      "Discipline is the value that gets talked about least and practiced most. It is not the highlight-reel version &mdash; the personal record, the finished product shot &mdash; it is the unglamorous middle: the early session, the extra wear-test round, the fabric supplier that gets rejected because it was almost good enough.",
      "We hold the brand to the same standard we are asking a training floor to hold itself to. If it is too early to confirm a launch date honestly, we say that instead of inventing one. If a placeholder photo is still a placeholder, it says so, in the open, on the page.",
      "That is what discipline means here &mdash; not intensity for its own sake, but consistency applied to the parts of the work nobody is watching."
    ]
  },
  {
    slug: "craft", num: "02", title: "Craft",
    short: "Getting the fabric, fit and finishing right before anything ships.",
    body: [
      "Craft is the reason GENERA is still in development rather than already for sale. It would be faster to ship a first collection based on how it looks in a lookbook. It is slower, and more honest, to hold it back until the fabric, fit and construction actually earn the ROBAT name.",
      "In practice, craft shows up in the details nobody outside the process ever sees &mdash; a flatlock seam chosen over a cheaper one because it holds up better under a loaded movement, a pattern re-cut because it looked right on paper but not on a real body in a real squat.",
      "It is a slower way to build a brand. We think it is the only way to build one that is still worth wearing after the newness wears off."
    ]
  },
  {
    slug: "honesty", num: "03", title: "Honesty",
    short: "Placeholder photography stays labelled as a placeholder. We&#39;d rather be plain than pretend.",
    body: [
      "Honesty is the value that shapes this entire site more than any other. Every image that is not yet real photography stays plainly captioned instead of pretending to be a finished campaign. Every page that does not yet have a confirmed date says so plainly instead of inventing one.",
      "It would be easy to dress an early-stage brand up as a finished one &mdash; better-looking photos borrowed from elsewhere, a countdown clock, a launch date picked to create urgency. We are choosing not to, on the theory that a brand people can trust from day one is worth more than a brand that looks impressive on day one.",
      "That is also why this page exists as a real, separate page instead of a single paragraph buried on the About tab. If honesty is a value we claim, it has to be visible in how the site itself is built, not just in what it says about itself."
    ]
  },
  {
    slug: "community", num: "04", title: "Community",
    short: "Built for the people who train, not at them.",
    body: [
      "Community, at ROBAT, does not mean an audience to sell to. It means the people whose training sessions the brand is actually trying to serve &mdash; the ones testing early samples, reading the Journal, and telling us honestly when a fit or a fabric does not hold up.",
      "That shapes the tone of everything from this site to the eventual product itself. No gatekept early access reserved for the loudest accounts &mdash; the Journal and the newsletter exist specifically so real updates land with everyone at the same time.",
      "A brand built for the people who train, rather than at them, has to actually listen to what training looks like for the people wearing it. That is the standard community is held to here."
    ]
  },
  {
    slug: "consistency", num: "05", title: "Consistency",
    short: "The same standard on day one thousand as on day one.",
    body: [
      "Consistency is the value most easily lost as a brand grows, which is exactly why it is written down here. The standard applied to the first ROBAT garment has to be the same standard applied to the hundredth &mdash; not a looser version once the brand has an audience to forgive it.",
      "In practice, that means the same wear-testing process for every future design, the same refusal to ship something before it is ready, and the same honest labeling of what is and is not finished, regardless of how much pressure there is to move faster.",
      "It is easier to hold a standard on day one, when there is nothing yet to protect. The real test is holding it once there is something to lose &mdash; and that is the test this value is meant to keep the brand honest against."
    ]
  },
  {
    slug: "growth", num: "06", title: "Growth",
    short: "The brand keeps training too &mdash; nothing here is considered finished.",
    body: [
      "Growth is the value that keeps the other five from calcifying into a fixed set of rules. Discipline, craft, honesty, community and consistency are not meant to freeze ROBAT in place &mdash; they are meant to be the standard the brand keeps training against as it changes.",
      "That applies to the product roadmap, the fabric choices, and this site itself. Nothing here &mdash; including the pages you are reading right now &mdash; is considered a finished, permanent statement. It is the current, honest snapshot of where the brand actually stands.",
      "A brand that claims to be built around progress has to be willing to keep progressing itself, including in ways that are uncomfortable or slower than a competitor moving faster and cutting more corners."
    ]
  }
];
function getValue(slug){
  for(var i=0;i<VALUES.length;i++){ if(VALUES[i].slug === slug) return VALUES[i]; }
  return null;
}

/* ============================================================
   PROFILES — Who It's For, each its own page
   ============================================================ */
var PROFILES = [
  {
    slug: "lifter", tag: "Strength", title: "The Lifter",
    short: "Fit that holds through a heavy set, not just standing still.",
    body: [
      "The Lifter is training for load &mdash; a heavy squat, a heavy pull, a heavy press. The garment has to disappear under that load rather than fight it: no seam that digs in at the bottom of a rep, no fabric that restricts the exact range of motion the lift needs.",
      "That is why ROBAT patterns are tested against real training positions instead of a standing mannequin. A garment that looks right standing still and binds at the bottom of a squat has failed the only test that actually matters to a lifter.",
      "This is one of the four ways we think about who ends up wearing a ROBAT garment &mdash; not a marketing persona, but a real pattern of how a body moves under real load."
    ]
  },
  {
    slug: "all-rounder", tag: "Functional", title: "The All-Rounder",
    short: "Built for whatever the workout of the day throws at it.",
    body: [
      "The All-Rounder does not train the same way twice. One day is a barbell session, the next is conditioning, the one after that is something closer to a sport. The garment has to keep up with that unpredictability instead of being optimized for a single movement pattern.",
      "That means fit and fabric decisions get tested across a range of movements, not just one lift or one drill, before either is approved. Versatility is treated as a real design requirement, not an afterthought bolted onto a garment built for something narrower.",
      "It is one of the four training profiles ROBAT designs against &mdash; a reminder that most training does not fit neatly into a single category, and the gear should not force it to."
    ]
  },
  {
    slug: "engine", tag: "Endurance", title: "The Engine",
    short: "Engineered for heat and moisture management over long sessions.",
    body: [
      "The Engine trains for duration &mdash; the long conditioning piece, the extended session, the workout measured in time rather than load. Heat and moisture management stop being a comfort feature at that point and start being the difference between finishing strong and finishing early.",
      "That is why fabric selection weighs how a material performs across a forty-five minute session, not just how it feels in the first five minutes. A fabric that traps heat is a real problem for this kind of training, even if it tests fine in a quick fitting.",
      "This profile keeps long-session performance from getting deprioritized in favor of garments optimized only for short, high-intensity work."
    ]
  },
  {
    slug: "everyday", tag: "Everyday", title: "The Rest Of The Day",
    short: "Quiet enough to wear far beyond the gym.",
    body: [
      "The Rest Of The Day is the profile that reflects something we noticed early: training habits do not stay contained to the hour they happen in, and neither should the clothing built for them. A garment that only works inside a gym is solving half the problem.",
      "That is why ROBAT is designed to move from a training session into an ordinary afternoon without changing and without standing out for the wrong reasons &mdash; quiet enough to disappear on the body, considered enough to hold up under real use either way.",
      "It is the profile behind the idea, explored further in the Journal, that performance is not only about a heavy set &mdash; it is about whether the same piece still feels right three hours later, worn somewhere that has nothing to do with training at all."
    ]
  }
];
function getProfile(slug){
  for(var i=0;i<PROFILES.length;i++){ if(PROFILES[i].slug === slug) return PROFILES[i]; }
  return null;
}

/* ============================================================
   ENGINEERED ITEMS — Fabric / Fit / Construction / Function /
   Durability / Comfort, each its own page
   ============================================================ */
var ENGINEERED_ITEMS = [
  {
    slug: "fabric", t: "Fabric", tone: "c",
    c: "Every ROBAT fabric is selected for how it performs under load &mdash; stretch that recovers, weight that disappears, and a hand-feel built for repeat wear, not a single photoshoot.",
    body: [
      "Fabric is the first decision made on every ROBAT design, not the last. Before a silhouette or a colorway is chosen, the material itself has to prove it can stretch under load and recover afterward, manage heat and moisture across a full session, and still feel right on the fortieth wear.",
      "None of that is visible in a product photo. All of it is what a fabric is actually judged on by the person wearing it, which is why fabric testing happens against real training sessions rather than a lab spec sheet alone.",
      "The Journal has a full essay on why fabric comes first at ROBAT, and what it costs the brand &mdash; in time, mostly &mdash; to build in that order instead of starting with a look and working backward."
    ]
  },
  {
    slug: "fit", t: "Fit", tone: "a",
    c: "ROBAT is patterned around real training positions &mdash; the squat, the pull, the sprint &mdash; so the fit holds its shape through the full range of motion, not just standing still.",
    body: [
      "Fit is tested in motion, not at rest. A pattern that looks correct on a standing mannequin can still fail the moment a body loads into a squat, reaches overhead, or sprints &mdash; which is exactly the range of motion a training garment actually has to survive.",
      "That means every ROBAT pattern goes through multiple wear-test rounds against real training positions before it is considered finished, with adjustments made based on what testing shows rather than what looks right on paper.",
      "The goal is a fit that disappears during training &mdash; no re-adjusting mid-set, no fabric bunching at the worst possible moment, no seam that only becomes a problem once a body is actually moving."
    ]
  },
  {
    slug: "construction", t: "Construction", tone: "b",
    c: "Flatlock seams, reinforced stress points and clean interior finishing. Construction most people never see, but every body can feel.",
    body: [
      "Construction is the part of a garment nobody photographs and everybody eventually notices &mdash; usually the moment it fails. A seam that looks identical to a better one in a product shot can behave completely differently under the specific stress a heavy pull or a loaded squat puts on it.",
      "That is why stress points get reinforced individually rather than uniformly, and why interior finishing gets the same attention as anything visible from the outside. A garment that looks finished on the outside and frays on the inside is not actually finished.",
      "Good construction is invisible when it works. It only becomes visible when it fails &mdash; which is the entire reason it gets tested this carefully before anything ships."
    ]
  },
  {
    slug: "function", t: "Function", tone: "d",
    c: "Ventilation, storage, fit &mdash; every design decision on a ROBAT garment answers a training need first. Form follows what the work requires.",
    body: [
      "Function comes before styling in every decision, not after it. A ventilation panel, a storage pocket, a seam placement &mdash; each one has to answer a real training need before it is allowed to also look good. Decoration added for its own sake gets cut.",
      "That ordering is a deliberate constraint, not a limitation. It is much easier to design something that looks intentional when every element on it is actually doing something, instead of half the garment existing purely to fill a spec sheet or a mood board.",
      "The result, when it works, is a garment that reads as considered rather than busy &mdash; every visible detail present because it is doing real work, not because it was easy to add."
    ]
  },
  {
    slug: "durability", t: "Durability", tone: "c",
    c: "Built to survive the wash, the gym floor and the season after this one. Durability is a design spec, not an afterthought.",
    body: [
      "Durability gets treated as a design requirement from the very first sample, not a quality-control check applied at the end. A fabric or a construction method has to prove it survives repeated washing, real gym-floor contact and a full season of actual use before it is approved.",
      "That standard rules out some materials and finishes that look and feel great in the first week but degrade fast after that &mdash; the kind of shortcut that is easy to miss in a short test window and expensive to discover after a customer already owns the garment.",
      "A garment that survives the wash, the gym floor and the season after this one is the actual bar. Anything that does not clear it does not ship, regardless of how it performed in week one."
    ]
  },
  {
    slug: "comfort", t: "Comfort", tone: "a",
    c: "Technical doesn&#39;t mean stiff. ROBAT is built to disappear on the body &mdash; quiet enough to wear far beyond the gym.",
    body: [
      "Comfort is not treated as the opposite of technical performance &mdash; it is one of its requirements. A fabric that manages heat and moisture perfectly but feels stiff or scratchy against skin has still failed, because nobody keeps training in a garment that is unpleasant to wear.",
      "That is why hand-feel gets evaluated alongside stretch, recovery and durability during fabric selection, not as a separate, softer category considered only once the technical boxes are checked.",
      "The goal is a garment technical enough to hold up to real training and comfortable enough to disappear on the body doing it &mdash; quiet enough, in fact, to keep wearing well beyond the session it was built for."
    ]
  }
];
function getEngineeredItem(slug){
  for(var i=0;i<ENGINEERED_ITEMS.length;i++){ if(ENGINEERED_ITEMS[i].slug === slug) return ENGINEERED_ITEMS[i]; }
  return null;
}

/* ============================================================
   FAQS — every FAQ question is its own page
   ============================================================ */
var FAQS = [
  {
    slug: "material-choices", category: "engineered", q: "What guides ROBAT\u2019s material choices?",
    body: [
      "How a fabric performs under real training load comes before how it looks in a flat lay. That means stretch and recovery under load, heat and moisture management across a full session, and hand-feel that still holds up on the fortieth wear &mdash; evaluated in that order, before a material is ever considered for a ROBAT garment.",
      "Materials that photograph well but underperform in actual training get ruled out early, even when they would be the easier, cheaper choice. The full reasoning behind this approach is in the Journal, in the essay on why the brand starts with fabric instead of a silhouette."
    ]
  },
  {
    slug: "fit-testing", category: "engineered", q: "How is fit actually tested?",
    body: [
      "Every pattern is tested against real training positions &mdash; squatting, pulling, sprinting &mdash; across multiple wear-test rounds, not just standing still on a mannequin. A fit that looks correct at rest can still fail the moment a body loads into a real movement, which is the exact failure ROBAT patterns are tested to catch before anything ships.",
      "Adjustments get made based on what wear-testing actually shows, not what looks right on paper. That is slower than approving a pattern from a single fitting, but it is the only process that catches a problem before a customer does."
    ]
  },
  {
    slug: "durability-meaning", category: "engineered", q: "What does \u2018durability\u2019 mean at ROBAT?",
    body: [
      "A garment that survives the wash, the gym floor and the season after this one. Durability is treated as a design spec from day one &mdash; evaluated alongside fabric and construction choices &mdash; rather than something checked only at the end of development.",
      "That standard rules out materials and finishes that look and feel great for the first few wears but degrade quickly after that, even when they would be cheaper or faster to bring to market."
    ]
  },
  {
    slug: "availability", category: "engineered", q: "Will ROBAT products be available to buy?",
    body: [
      "Yes &mdash; GENERA, ROBAT&#39;s first generation of product, launches October 31, 2026. It is a limited, intentional first release rather than a wide launch, built the same slow way as everything else on this site.",
      "The Journal and the newsletter are the two places real updates land first as the date gets closer &mdash; not a countdown clock, just what is actually true."
    ]
  },
  {
    slug: "manufacturing", category: "engineered", q: "Where does ROBAT manufacture?",
    body: [
      "We are finalizing manufacturing partners as part of the GENERA development process. That means mills willing to run small first batches for real wear-testing before any bulk order, rather than simply the ones with the lowest minimums.",
      "This page &mdash; and the Engineered page more broadly &mdash; will be updated with specifics once partners are properly confirmed, not before. We would rather confirm it once than announce something early and walk it back later."
    ]
  },
  {
    slug: "stay-updated", category: "engineered", q: "How can I stay updated?",
    body: [
      "The Journal and the newsletter are the two places real updates land first &mdash; no follower-only drops, no hype countdowns, no early access reserved for the loudest accounts.",
      "Both exist specifically so that anyone following the brand&#39;s actual progress hears about it at the same time, whether that is a fabric update, a manufacturing decision, or eventually a launch date."
    ]
  },
  {
    slug: "launch-date", category: "contact", q: "When does ROBAT launch?",
    body: [
      "31.10.2026",
      "The beginning of something built differently.",
      "ROBAT makes its first appearance with GENERA &mdash; the opening chapter of what&#39;s to come.",
      "Limited. Intentional. Made to move.",
      "This is only the beginning."
    ]
  },
  {
    slug: "international-shipping", category: "contact", q: "Do you ship internationally?",
    body: [
      "Shipping details, rates and destinations have not been finalized yet, so they are confirmed directly rather than listed here as if they were settled. Placing an order through the Shop opens a WhatsApp message to ROBAT with your details, and shipping is confirmed with you personally from there.",
      "Once GENERA is closer to launch, full shipping and availability details will be added here and to the Engineered page at the same time."
    ]
  },
  {
    slug: "early-access", category: "contact", q: "Can I get early access or a sample?",
    body: [
      "Not yet. There is no early-access program or sample list running right now, and we are not going to open one just to create a sense of exclusivity before the product is actually ready.",
      "The newsletter and the Journal are the best ways to hear first when that changes &mdash; updates go out to everyone following at the same time, not to a gated list."
    ]
  }
];
function getFaq(slug){
  for(var i=0;i<FAQS.length;i++){ if(FAQS[i].slug === slug) return FAQS[i]; }
  return null;
}

/* ============================================================
   PRODUCTS — GENERA, ROBAT's first release
   ============================================================ */
var PRODUCTS = [
  {
    slug: "performance-shirt",
    name: "GENERA Performance Shirt",
    tag: "GENERA \u2014 01",
    short: "A training top cut for full range of motion, built before it was styled.",
    body: [
      "The Performance Shirt is the first top in the GENERA line \u2014 cut for range of motion under real load, in a fabric chosen for how it holds up three hours into a session, not how it looks on a hanger.",
      "It ships as part of GENERA, ROBAT&#39;s first generation of product: limited, intentional, and built the same slow way as everything else on this site."
    ],
    sizes: ["M","L","XL","XXL","XXXL"],
    colors: [
      {name:"Black", available:true},
      {name:"Sand", available:false},
      {name:"White", available:false},
      {name:"Gray", available:false}
    ],
    photo: PHOTO_SHIRT_WORN,
    gallery: [
      {photo: PHOTO_SHIRT_WORN, caption: "GENERA PERFORMANCE SHIRT — WORN"},
      {photo: PHOTO_SHIRT_FRONT, caption: "FRONT"},
      {photo: PHOTO_SHIRT_BACK, caption: "BACK"},
      {photo: PHOTO_FULL_OUTFIT, caption: "THE FULL GENERA SET"}
    ]
  },
  {
    slug: "performance-short",
    name: "GENERA Performance Short",
    tag: "GENERA \u2014 02",
    short: "A training short engineered for squat depth, sprint stride and everything between.",
    body: [
      "The Performance Short is built to the same standard as the Shirt \u2014 tested against real training movement first, styled second.",
      "It launches alongside the Shirt as part of GENERA, the opening chapter of what ROBAT becomes next."
    ],
    sizes: ["M","L","XL","XXL","XXXL"],
    colors: [
      {name:"Black", available:true},
      {name:"Sand", available:false},
      {name:"White", available:false},
      {name:"Gray", available:false}
    ],
    photo: PHOTO_SHORT_WORN,
    gallery: [
      {photo: PHOTO_SHORT_WORN, caption: "GENERA PERFORMANCE SHORT \u2014 WORN"},
      {photo: PHOTO_SHORT_FRONT, caption: "FRONT"},
      {photo: PHOTO_SHORT_BACK, caption: "BACK"},
      {photo: PHOTO_FULL_OUTFIT, caption: "THE FULL GENERA SET"}
    ]
  }
];
function getProduct(slug){
  for(var i=0;i<PRODUCTS.length;i++){ if(PRODUCTS[i].slug === slug) return PRODUCTS[i]; }
  return null;
}

/* ============================================================
   ROUTER
   ============================================================ */
function currentRoute(){
  var h = location.hash.replace(/^#/, "") || "/";
  return h;
}

function setSEO(title, desc){
  document.title = title ? ("ROBAT — " + title) : "ROBAT — Performance Gymwear";
  var m = document.querySelector('meta[name="description"]');
  if(!m){ m = document.createElement("meta"); m.setAttribute("name","description"); document.head.appendChild(m); }
  m.setAttribute("content", desc || "ROBAT — premium performance gymwear engineered for training and everything beyond it.");
}

function render(){
  teardownGeneraExperience();
  var route = currentRoute();
  var app = document.getElementById("app");
  var html = "";
  var artMatch = route.match(/^\/journal\/([a-z0-9-]+)$/);
  var pillarMatch = route.match(/^\/about\/([a-z-]+)$/);
  var valueMatch = route.match(/^\/values\/([a-z-]+)$/);
  var profileMatch = route.match(/^\/for\/([a-z-]+)$/);
  var engItemMatch = route.match(/^\/engineered\/([a-z-]+)$/);
  var faqMatch = route.match(/^\/faq\/([a-z-]+)$/);
  var productMatch = route.match(/^\/shop\/([a-z-]+)$/);

  if(route === "/" || route === ""){
    html = pageHome(); setSEO("Engineered For More", "ROBAT is a premium performance gymwear brand. Performance built for training. Designed for everything beyond it.");
  } else if(route === "/about"){
    html = pageAbout(); setSEO("About — People. Progress. Purpose.", "ROBAT's philosophy: People. Progress. Purpose.");
  } else if(pillarMatch && getPillar(pillarMatch[1])){
    var pillar = getPillar(pillarMatch[1]);
    html = pagePillar(pillar); setSEO(pillar.title, pillar.dek);
  } else if(route === "/engineered"){
    html = pageEngineered(); setSEO("Engineered", "How ROBAT approaches fabric, fit, construction, function, durability and comfort.");
  } else if(engItemMatch && getEngineeredItem(engItemMatch[1])){
    var engItem = getEngineeredItem(engItemMatch[1]);
    html = pageEngineeredItem(engItem); setSEO(engItem.t, engItem.c);
  } else if(route === "/journal"){
    html = pageJournal(); setSEO("Journal", "Notes on training, fabric and the ROBAT philosophy.");
  } else if(artMatch && getArticle(artMatch[1])){
    var art = getArticle(artMatch[1]);
    html = pageArticle(art); setSEO(art.title, art.dek);
  } else if(valueMatch && getValue(valueMatch[1])){
    var val = getValue(valueMatch[1]);
    html = pageValue(val); setSEO(val.title, val.short);
  } else if(profileMatch && getProfile(profileMatch[1])){
    var prof = getProfile(profileMatch[1]);
    html = pageProfile(prof); setSEO(prof.title, prof.short);
  } else if(faqMatch && getFaq(faqMatch[1])){
    var faqItem = getFaq(faqMatch[1]);
    html = pageFaq(faqItem); setSEO(faqItem.q, faqItem.body[0]);
  } else if(route === "/shop"){
    html = pageShop(); setSEO("Shop", "Shop GENERA, ROBAT's first release \u2014 the Performance Shirt and Performance Short.");
  } else if(productMatch && getProduct(productMatch[1])){
    var product = getProduct(productMatch[1]);
    html = pageProduct(product); setSEO(product.name, product.short);
  } else if(route === "/contact"){
    html = pageContact(); setSEO("Contact", "Get in touch with ROBAT.");
  } else if(route === "/genera"){
    html = pageGenera(); setSEO("GENERA \u2014 Inside The Garment", "The material system behind GENERA, unlocked from the QR code inside your ROBAT garment.");
  } else {
    html = pageNotFound(); setSEO("Not Found", "Page not found.");
  }

  app.innerHTML = navHTML() + "<main>" + html + "</main>" + footerHTML();
  wireNav();
  wireNewsletterForms();
  wireShopForms();
  window.scrollTo(0,0);
  initReveal();
  if(route === "/genera"){ initGeneraExperience(); }
}

/* ============================================================
   NAV / FOOTER
   ============================================================ */
function navHTML(){
  var route = currentRoute();
  function a(href, label){
    var active = route === href ? " active" : "";
    return '<a href="#' + href + '" class="' + active.trim() + '">' + label + '</a>';
  }
  return '' +
  '<header id="nav"><div class="wrap row">' +
    '<a href="#/" class="wordmark"><img class="mark" src="' + MARK_BLACK + '" alt=""><span>ROBAT</span></a>' +
    '<nav class="nav-links">' + a("/shop","Shop") + a("/about","About") + a("/engineered","Engineered") + a("/journal","Journal") + a("/contact","Contact") + '</nav>' +
    '<div class="nav-right">' +
      '<button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>' +
    '</div>' +
  '</div></header>' +
  '<div id="mobile-menu">' +
    '<a href="#/shop">Shop</a><a href="#/about">About</a><a href="#/engineered">Engineered</a><a href="#/journal">Journal</a><a href="#/contact">Contact</a>' +
  '</div>';
}

function footerHTML(){
  return '' +
  '<footer><div class="wrap">' +
    '<div class="foot-grid">' +
      '<div>' +
        '<div class="wordmark" style="font-size:26px;margin-bottom:14px;"><img class="mark" src="' + MARK_BLACK + '" alt=""><span>ROBAT</span></div>' +
        '<p class="lead" style="font-size:13px;">People. Progress. Purpose. Premium performance gymwear engineered for training — and everything beyond it.</p>' +
      '</div>' +
      '<div><h4>Brand</h4><a href="#/shop">Shop</a><a href="#/about">About ROBAT</a><a href="#/engineered">Engineered</a><a href="#/journal">Journal</a></div>' +
      '<div><h4>Get In Touch</h4><a href="#/contact">Contact</a><a href="#/journal">Latest Notes</a></div>' +
    '</div>' +
    '<div class="foot-bottom"><span>&copy; ' + new Date().getFullYear() + ' ROBAT. ALL RIGHTS RESERVED.</span><span>PEOPLE. PROGRESS. PURPOSE.</span></div>' +
  '</div></footer>';
}

function wireNav(){
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobile-menu");
  if(burger){ burger.onclick = function(){ menu.classList.toggle("open"); }; }
  if(menu){ menu.querySelectorAll("a").forEach(function(a){ a.onclick = function(){ menu.classList.remove("open"); }; }); }
}

/* Newsletter forms have no backend on a static site, so a submission
   opens the visitor's own email client with a message pre-addressed to
   ROBAT's real inbox — an honest way to "send" it without pretending
   there is a server collecting addresses behind the scenes. */
var NEWSLETTER_EMAIL = "info@robatfit.com";
function wireNewsletterForms(){
  document.querySelectorAll(".newsletter-form").forEach(function(form){
    form.onsubmit = function(e){
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var msg = form.parentElement.querySelector(".newsletter-msg");
      var ok = input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      if(ok && input){
        var subject = encodeURIComponent("ROBAT Newsletter Signup");
        var body = encodeURIComponent("Please add me to the ROBAT list.\n\nEmail: " + input.value);
        window.location.href = "mailto:" + NEWSLETTER_EMAIL + "?subject=" + subject + "&body=" + body;
      }
      if(msg){ msg.textContent = ok ? "Opening your email client to " + NEWSLETTER_EMAIL + "..." : "Enter a valid email address."; }
      if(ok && input){ input.value = ""; }
    };
  });
}

/* Static site, no backend and no payment processor yet: the order
   form hands the full order \u2014 product, size, color, quantity and
   shipping details \u2014 to ROBAT directly over WhatsApp, where price,
   availability and payment are confirmed with the customer personally. */
var ORDER_WHATSAPP_NUMBER = "2349060569412"; // +234 906 056 9412
function wireShopForms(){
  document.querySelectorAll(".order-form").forEach(function(form){
    form.onsubmit = function(e){
      e.preventDefault();
      var msgEl = form.querySelector(".of-msg");
      var fd = new FormData(form);
      var size = fd.get("size");
      var color = fd.get("color");
      var qty = (fd.get("qty") || "1").toString().trim() || "1";
      var fullName = (fd.get("fullName") || "").toString().trim();
      var phone = (fd.get("phone") || "").toString().trim();
      var email = (fd.get("email") || "").toString().trim();
      var address = (fd.get("address") || "").toString().trim();
      var city = (fd.get("city") || "").toString().trim();
      var state = (fd.get("state") || "").toString().trim();
      var postal = (fd.get("postal") || "").toString().trim();
      var country = (fd.get("country") || "").toString().trim();

      if(!size || !color || !fullName || !phone || !address || !city || !state || !country){
        if(msgEl){ msgEl.textContent = "Please fill in every required field before continuing."; }
        return;
      }

      var product = form.getAttribute("data-product") || "ROBAT Product";
      var lines = [
        "Hi ROBAT, I'd like to place an order:",
        "",
        "Product: " + product,
        "Size: " + size,
        "Color: " + color,
        "Quantity: " + qty,
        "",
        "Shipping to:",
        fullName,
        phone,
        address,
        city + ", " + state + (postal ? " " + postal : ""),
        country
      ];
      if(email){ lines.push("", "Email: " + email); }

      var waLink = "https://wa.me/" + ORDER_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      if(msgEl){ msgEl.textContent = "Opening WhatsApp to confirm your order..."; }
      window.location.href = waLink;
    };
  });
}

/* ============================================================
   REUSABLE SECTION BUILDERS
   ============================================================ */
function newsletterHTML(){
  return '' +
  '<section><div class="wrap"><div class="newsletter reveal"><div class="inner">' +
    '<h2>Stay Close To The Build</h2>' +
    '<p>No product to sell you yet — just an occasional note when the engineering, the philosophy, or the Journal moves forward. No spam, unsubscribe anytime.</p>' +
    '<form class="newsletter-form"><input type="email" placeholder="you@email.com" aria-label="Email address" required><button class="btn" type="submit">Notify Me</button></form>' +
    '<div class="newsletter-msg"></div>' +
  '</div></div></div></section>';
}

/* ============================================================
   PAGES
   ============================================================ */
function pageHome(){
  return '' +
  '<section class="hero">' +
    visual({tone:"a", caption:"CAMPAIGN — ROBAT STUDIO", photo:PHOTO_HOME_HERO}) +
    '<div class="hero-inner">' +
      '<img class="hero-mark" src="' + MARK_CREAM + '" alt="" aria-hidden="true">' +
      '<div class="wrap">' +
      '<div class="hero-eyebrow">ROBAT — Performance Gymwear</div>' +
      '<h1>ENGINEERED<br>FOR MORE.</h1>' +
      '<p class="hero-sub">Performance built for training. Designed for everything beyond it.</p>' +
      '<div class="hero-ctas"><a href="#/shop" class="btn solid">Shop Now</a><a href="#/about" class="btn ghost">Our Philosophy</a><a href="#/engineered" class="btn ghost">Engineered</a></div>' +
    '</div></div>' +
  '</section>' +

  '<section class="stats reveal" style="padding:0;"><div class="wrap"><div class="grid">' +
    '<div class="cell"><div class="n">03</div><div class="lbl">Founding Principles</div></div>' +
    '<div class="cell"><div class="n">06</div><div class="lbl">Engineering Pillars</div></div>' +
    '<div class="cell"><div class="n">01</div><div class="lbl">Standard We Don&#39;t Compromise</div></div>' +
  '</div></div></section>' +

  '<section class="philosophy"><div class="wrap"><div class="grid">' +
    '<a href="#/about/people" class="cell reveal"><div class="num">01</div><h3>People</h3><p>The people who train, move and wear ROBAT — and the discipline they show up with.</p></a>' +
    '<a href="#/about/progress" class="cell reveal"><div class="num">02</div><h3>Progress</h3><p>The constant, unglamorous pursuit of becoming stronger and better, one session at a time.</p></a>' +
    '<a href="#/about/purpose" class="cell reveal"><div class="num">03</div><h3>Purpose</h3><p>Creating products with intention — nothing added that doesn&#39;t earn its place.</p></a>' +
  '</div></div></section>' +

  '<section><div class="wrap">' +
    '<div class="reveal" style="max-width:70ch;">' +
      '<div class="eyebrow">Engineered</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">Built From The Fabric Up</h2>' +
      '<p class="lead" style="margin-top:16px;">Every ROBAT garment starts with how it performs under load, not how it photographs. Fabric, fit and construction, engineered together — read the full approach behind it.</p>' +
      '<a href="#/engineered" class="link" style="display:inline-block;margin-top:22px;">See The Engineering</a>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="editorial-strip reveal">' +
      visual({tone:"d", caption:"TRAINING — ROBAT ATHLETES", photo:PHOTO_EDITORIAL_TRAINING}) +
      visual({tone:"b", caption:"LIFESTYLE — ROBAT BEYOND THE GYM", photo:PHOTO_EDITORIAL_LIFESTYLE}) +
    '</div>' +
  '</div></section>' +

  '<section class="statement" style="padding:88px 0;"><div class="wrap reveal">' +
    '<blockquote>We&#39;d rather show you an honest placeholder than a finished lie.</blockquote>' +
    '<cite>— The ROBAT Design Principle</cite>' +
  '</div></section>' +

  '<section><div class="wrap">' +
    '<div class="split rev reveal">' +
      visual({tone:"b", caption:"BRAND — ROBAT CAMPAIGN", ratio:"4/5", photo:PHOTO_BRAND_CAMPAIGN}) +
      '<div><div class="eyebrow">People. Progress. Purpose.</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">This Is ROBAT</h2>' +
      '<p class="lead" style="margin-top:16px;">A premium performance gymwear brand built around training, movement and progress — for the gym, and for everything after it.</p>' +
      '<a href="#/about" class="btn ghost" style="margin-top:24px;">About ROBAT</a></div>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">Journal</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.4rem);">Notes From ROBAT</h2></div><a href="#/journal" class="link">All Entries</a></div>' +
    '<div class="journal-grid reveal">' + ARTICLES.slice(0,3).map(journalCard).join("") + '</div>' +
  '</div></section>' +

  newsletterHTML() +

  '<section style="padding:0 0 64px;"><div class="wrap" style="text-align:center;">' +
    '<a href="#/genera" class="link" style="display:inline-flex; align-items:center; gap:8px; border-bottom:none;">' +
      '<span aria-hidden="true" style="color:var(--accent); font-size:10px;">&#9670;</span>' +
      'Scanned The QR Inside Your GENERA Garment? Discover GENERA' +
    '</a>' +
  '</div></section>';
}

function journalCard(art){
  return '<a href="#/journal/' + art.slug + '" class="journal-card">' +
    visual({tone:art.tone, caption:art.tag}) +
    '<div class="eyebrow">' + art.tag + '</div><h3>' + art.title + '</h3><p>' + art.dek + '</p>' +
    '<span class="link">Read The Note</span>' +
  '</a>';
}

function pageAbout(){
  return '' +
  '<section class="hero" style="min-height:60vh;">' +
    visual({tone:"d", caption:"EDITORIAL — ROBAT ATHLETES", photo:PHOTO_ABOUT_HERO}) +
    '<div class="hero-inner"><div class="wrap">' +
      '<div class="hero-eyebrow">About ROBAT</div>' +
      '<h1 style="font-size:clamp(2.4rem,6.5vw,5rem);">PEOPLE. PROGRESS.<br>PURPOSE.</h1>' +
    '</div></div>' +
  '</section>' +

  '<section><div class="wrap">' +
    '<div class="reveal" style="max-width:70ch;">' +
      '<div class="eyebrow">Origin</div>' +
      '<h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">Why ROBAT Exists</h2>' +
      '<p class="lead" style="margin-top:18px;">ROBAT started with a simple frustration: most gymwear is designed to photograph well and stops there. We wanted a brand built the other way around — one that starts with fabric, fit and construction, and only earns its look afterward. People. Progress. Purpose. is the philosophy we test every decision against, from a stitch line to a supplier to a headline on this page.</p>' +
      '<div class="eyebrow" style="margin-top:40px;">From The Founder</div>' +
      '<p class="lead" style="margin-top:18px;">ROBAT started from something personal — my own journey into fitness.</p>' +
      '<p class="lead" style="margin-top:16px;">When I began working out, the gym became more than just a place to train. It became a space for discipline, confidence, self-expression, and growth. As my passion for fitness grew, so did my interest in what I wore while training. I wanted gym wear that didn&#39;t just perform well, but looked good — something I could feel confident wearing both inside and outside the gym.</p>' +
      '<p class="lead" style="margin-top:16px;">That idea became the foundation of ROBAT: bringing fitness and fashion together.</p>' +
      '<p class="lead" style="margin-top:16px;">But I wanted ROBAT to go beyond clothing. We live in a generation where technology is constantly changing the way we interact with the world around us, and that inspired another part of the brand.</p>' +
      '<p class="lead" style="margin-top:16px;">Every ROBAT piece is designed to have its own identity. Through the QR code attached to the wear, you can scan your piece and discover more about it — its name, design, inspiration, and the story behind what you&#39;re wearing. It turns a piece of gym wear into something you can interact with.</p>' +
      '<p class="lead" style="margin-top:16px;">For me, ROBAT represents progression — physically, mentally, creatively, and technologically.</p>' +
      '<p class="lead" style="margin-top:16px;">It&#39;s for people who want to become stronger without losing their sense of style. For people who understand that discipline isn&#39;t only about what happens during a workout; it&#39;s about the mindset you carry into everything you do.</p>' +
      '<p style="margin-top:28px;font-family:var(--disp);font-weight:700;text-transform:uppercase;font-size:clamp(1.1rem,2vw,1.5rem);color:var(--paper);">ROBAT — Discipline Builds Freedom.</p>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="split reveal">' +
      visual({tone:"a", caption:"TRAINING — ROBAT ATHLETES", photo:PHOTO_ABOUT_PEOPLE}) +
      '<div><div class="eyebrow">01 — People</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">People</h2><p class="lead" style="margin-top:16px;">ROBAT is built around the people who train — the early mornings, the last set of the day, the quiet discipline in between. Every product starts with how they move, not how it photographs. <a href="#/about/people" class="link" style="margin-left:4px;">Read The People Page</a></p></div>' +
    '</div>' +
  '</div></section>' +
  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="split rev reveal">' +
      visual({tone:"b", caption:"MOVEMENT — PROGRESS IN TRAINING", photo:PHOTO_ABOUT_PROGRESS}) +
      '<div><div class="eyebrow">02 — Progress</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">Progress</h2><p class="lead" style="margin-top:16px;">Progress is rarely loud. It&#39;s the extra rep, the better form, the slightly heavier plate. ROBAT is built for the version of you that&#39;s still being built. <a href="#/about/progress" class="link" style="margin-left:4px;">Read The Progress Page</a></p></div>' +
    '</div>' +
  '</div></section>' +
  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="reveal" style="max-width:70ch;">' +
      '<div class="eyebrow">03 — Purpose</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">Purpose</h2><p class="lead" style="margin-top:16px;">Nothing on a ROBAT garment is decoration. Every panel, seam and detail is there because it earns its place. Purpose before polish. <a href="#/about/purpose" class="link" style="margin-left:4px;">Read The Purpose Page</a></p>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">Transparency</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.4rem);">Where We Are Right Now</h2></div></div>' +
    '<div class="stepper reveal">' +
      '<div class="step active"><span class="stage">Active</span><h4>Research &amp; Development</h4><p>Testing fabric, fit and construction against real training sessions before anything ships. This is where the actual time goes.</p></div>' +
      '<div class="step"><span class="stage">Next</span><h4>GENERA</h4><p>ROBAT&#39;s first generation of product — a shirt and a short, engineered together. Launching October 31, 2026.</p></div>' +
      '<div class="step"><span class="stage">Later</span><h4>Open</h4><p>The moment this site stops being just a brand story and starts being a place to actually buy something.</p></div>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">What We Hold To</div><h2>Six Values, No Exceptions</h2></div></div>' +
    '<div class="values-grid reveal">' + VALUES.map(function(v){
      return '<a class="cell" href="#/values/' + v.slug + '"><div class="num">' + v.num + '</div><h4>' + v.title + '</h4><p>' + v.short + '</p></a>';
    }).join("") +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">Who It&#39;s For</div><h2>Built For How You Actually Train</h2></div></div>' +
    '<div class="profiles reveal">' + PROFILES.map(function(p){
      return '<a class="cell" href="#/for/' + p.slug + '"><div class="eyebrow">' + p.tag + '</div><h4>' + p.title + '</h4><p>' + p.short + '</p></a>';
    }).join("") +
    '</div>' +
  '</div></section>' +

  '<section><div class="wrap"><div class="reveal" style="text-align:center;max-width:60ch;margin:0 auto;">' +
    '<h2 style="font-size:clamp(1.8rem,4vw,2.8rem);text-transform:uppercase;">Engineered To Match</h2>' +
    '<a href="#/engineered" class="btn solid" style="margin-top:24px;">See The Engineering</a>' +
  '</div></div></section>';
}

function pageEngineered(){
  var items = ENGINEERED_ITEMS;
  var steps = [
    {n:"01", t:"Research", c:"Studying real training movement — the squat, the pull, the sprint — before a single line is drawn."},
    {n:"02", t:"Prototype", c:"Cutting first samples to test fabric behavior and pattern against actual load, not a mannequin."},
    {n:"03", t:"Test", c:"Wear-testing across sessions, washes and body types until the garment stops surprising us."},
    {n:"04", t:"Refine", c:"Adjusting seams, panels and fit based on what testing actually shows, not what looks right on paper."},
    {n:"05", t:"Produce", c:"Only once fabric, fit and construction all hold up does a design move toward production."}
  ];
  return '' +
  '<section class="hero" style="min-height:56vh;">' +
    '<div class="hero-inner"><div class="wrap">' +
      '<div class="hero-eyebrow">ROBAT Approach</div>' +
      '<h1 style="font-size:clamp(2.4rem,6.5vw,5rem);">ENGINEERED.</h1>' +
      '<p class="hero-sub">Fabric, fit, construction, function, durability and comfort — engineered together, not as an afterthought.</p>' +
    '</div></div>' +
  '</section>' +
  '<section><div class="wrap">' +
    '<div class="design-rows reveal">' + items.map(function(it, i){
      var n = (i + 1 < 10 ? "0" : "") + (i + 1);
      return '<a class="design-row" href="#/engineered/' + it.slug + '"><div class="dr-num">' + n + '</div><div><h4>' + it.t + '</h4><p>' + it.c + '</p><span class="link" style="display:inline-block;margin-top:14px;">Read More</span></div></a>';
    }).join("") + '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">Process</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.4rem);">From Concept To Garment</h2></div></div>' +
    '<div class="process-rows reveal">' + steps.map(function(s){
      return '<div class="process-row"><div class="pn">' + s.n + '</div><h4>' + s.t + '</h4><p>' + s.c + '</p></div>';
    }).join("") + '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="reveal" style="max-width:70ch;">' +
      '<div class="eyebrow">Materials</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">Fabric-First, By Design</h2>' +
      '<p class="lead" style="margin-top:16px;">We choose materials before we choose a silhouette. It is a slower way to design a garment, and the only order that produces one which still performs after the newness wears off.</p>' +
      '<a href="#/journal/fabric-first" class="link" style="display:inline-block;margin-top:22px;">Read Why We Start With Fabric</a>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="reveal" style="max-width:70ch;">' +
      '<div class="eyebrow">Sourcing</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">Who We Work With</h2>' +
      '<p class="lead" style="margin-top:16px;">We are selective about who makes a ROBAT garment. That means mills willing to run small first batches for real wear-testing before any bulk order — not just the ones with the lowest minimums. It is slower and costs more early on, but it is the only way we know to actually know a fabric before putting a training session on the line with it.</p>' +
      '<p class="lead" style="margin-top:16px;">Manufacturing partners are still being finalized as part of the GENERA development process. We would rather confirm them properly than announce something early and walk it back later.</p>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">Questions</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.4rem);">Engineering Principles</h2></div></div>' +
    '<div class="faq reveal">' + FAQS.filter(function(f){ return f.category === "engineered"; }).map(function(f){
      return '<a class="faq-row" href="#/faq/' + f.slug + '"><span class="q">' + f.q + '</span><span class="arrow">&rarr;</span></a>';
    }).join("") +
    '</div>' +
  '</div></section>' +

  '<section><div class="wrap"><div class="reveal" style="text-align:center;max-width:60ch;margin:0 auto;">' +
    '<h2 style="font-size:clamp(1.8rem,4vw,2.8rem);text-transform:uppercase;">More From ROBAT</h2>' +
    '<a href="#/about" class="btn solid" style="margin-top:24px;">About ROBAT</a>' +
  '</div></div></section>';
}

function pageJournal(){
  return '' +
  '<section style="padding-top:calc(var(--nav-h) + 56px);padding-bottom:24px;"><div class="wrap reveal">' +
    '<div class="eyebrow">Journal</div>' +
    '<h1 style="font-size:clamp(2.2rem,5vw,3.6rem);text-transform:uppercase;margin-top:12px;max-width:16ch;">Notes From ROBAT</h1>' +
    '<p class="lead" style="margin-top:18px;">Short essays on training, fabric and the philosophy behind the brand — written as we build, not after the fact.</p>' +
  '</div></section>' +
  '<section style="padding-top:24px;"><div class="wrap">' +
    '<div class="journal-grid reveal">' + ARTICLES.map(journalCard).join("") + '</div>' +
  '</div></section>' +
  newsletterHTML();
}

function pageArticle(art){
  var others = ARTICLES.filter(function(a){ return a.slug !== art.slug; });
  return '' +
  '<section class="article-hero"><div class="wrap reveal">' +
    '<a href="#/journal" class="link" style="margin-bottom:20px;display:inline-block;">&larr; All Entries</a>' +
    '<div class="eyebrow tag">Journal &mdash; ' + art.tag + '</div>' +
    '<h1>' + art.title + '</h1>' +
    '<p class="lead dek">' + art.dek + '</p>' +
  '</div></section>' +
  '<section style="padding-top:40px;"><div class="wrap">' +
    '<div class="article-body reveal">' + art.body.map(function(p){ return '<p>' + p + '</p>'; }).join("") + '</div>' +
  '</div></section>' +
  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="article-more reveal">' +
      '<div class="eyebrow" style="margin-bottom:24px;">More From The Journal</div>' +
      '<div class="article-more-grid">' + others.map(journalCard).join("") + '</div>' +
    '</div>' +
  '</div></section>';
}

/* Inline Instagram glyph — no external icon font or image request. */
var IG_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.6" stroke="currentColor" stroke-width="1.6"/><circle cx="17.15" cy="6.85" r="1.15" fill="currentColor"/></svg>';

function pageContact(){
  return '' +
  '<section style="padding-top:calc(var(--nav-h) + 56px);"><div class="wrap">' +
    '<div class="reveal" style="max-width:60ch;">' +
      '<div class="eyebrow">Contact</div>' +
      '<h1 style="font-size:clamp(2.1rem,4.6vw,3.4rem);text-transform:uppercase;margin-top:12px;">Get In Touch</h1>' +
      '<p class="lead" style="margin-top:16px;">Questions about the brand, the engineering, or what&#39;s next — this is a front-end preview of ROBAT, so treat the details below as placeholders rather than a live inbox.</p>' +
      '<div class="info-list">' +
        '<div class="row"><div class="k">General</div><div class="v">info@robatfit.com<span>The official ROBAT inbox — brand questions and everything else</span></div></div>' +
        '<div class="row"><div class="k">Press</div><div class="v">info@robatfit.com<span>Media and interview requests</span></div></div>' +
        '<div class="row"><div class="k">Wholesale</div><div class="v">info@robatfit.com<span>Stockist and partnership inquiries</span></div></div>' +
        '<div class="row"><div class="k">Follow</div><div class="v"><a class="social-link" href="https://www.instagram.com/robatfit?" target="_blank" rel="noopener noreferrer" aria-label="ROBAT on Instagram">' + IG_ICON + '<span>@robatfit on Instagram</span></a></div></div>' +
      '</div>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">Before You Ask</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.4rem);">A Few Common Questions</h2></div></div>' +
    '<div class="faq reveal">' + FAQS.filter(function(f){ return f.category === "contact"; }).map(function(f){
      return '<a class="faq-row" href="#/faq/' + f.slug + '"><span class="q">' + f.q + '</span><span class="arrow">&rarr;</span></a>';
    }).join("") +
    '</div>' +
  '</div></section>' +

  newsletterHTML();
}


/* ============================================================
   Shared small-card + generic detail-page template, used by every
   dedicated sub-page (pillars, values, profiles, engineered items, FAQs)
   ============================================================ */
function miniCard(opts){
  return '<a href="' + opts.href + '" class="journal-card">' +
    visual({tone: opts.tone || "a", caption: opts.tag || "", photo: opts.photo || null}) +
    '<div class="eyebrow">' + (opts.tag || "") + '</div><h3>' + opts.title + '</h3><p>' + (opts.text || "") + '</p>' +
    '<span class="link">' + (opts.linkLabel || "Read More") + '</span>' +
  '</a>';
}

function pageDetail(opts){
  return '' +
  '<section class="article-hero"><div class="wrap reveal">' +
    '<a href="' + opts.backHref + '" class="link" style="margin-bottom:20px;display:inline-block;">&larr; ' + opts.backLabel + '</a>' +
    '<div class="eyebrow tag">' + opts.eyebrowTag + '</div>' +
    '<h1>' + opts.title + '</h1>' +
    (opts.dek ? '<p class="lead dek">' + opts.dek + '</p>' : '') +
  '</div></section>' +
  (opts.photo ?
    '<section style="padding-top:32px;"><div class="wrap">' +
      visual({tone: opts.tone || "a", caption: opts.caption || String(opts.title).toUpperCase(), ratio:"16/7", photo: opts.photo}) +
    '</div></section>'
  : '') +
  '<section style="padding-top:40px;"><div class="wrap">' +
    '<div class="article-body reveal">' + opts.body.map(function(p){ return '<p>' + p + '</p>'; }).join("") + '</div>' +
  '</div></section>' +
  ((opts.more && opts.more.length) ?
    '<section style="padding-top:0;"><div class="wrap">' +
      '<div class="article-more reveal">' +
        '<div class="eyebrow" style="margin-bottom:24px;">' + (opts.moreTitle || "More") + '</div>' +
        '<div class="article-more-grid">' + opts.more.join("") + '</div>' +
      '</div>' +
    '</div></section>'
  : '') +
  '<section><div class="wrap"><div class="reveal" style="text-align:center;max-width:60ch;margin:0 auto;">' +
    '<h2 style="font-size:clamp(1.8rem,4vw,2.8rem);text-transform:uppercase;">' + (opts.ctaTitle || "More From ROBAT") + '</h2>' +
    '<a href="' + (opts.ctaHref || "#/") + '" class="btn solid" style="margin-top:24px;">' + (opts.ctaLabel || "Explore") + '</a>' +
  '</div></div></section>';
}

function pagePillar(p){
  var others = PILLARS.filter(function(x){ return x.slug !== p.slug; });
  return pageDetail({
    backHref: "#/about", backLabel: "About ROBAT",
    eyebrowTag: "Philosophy — " + p.tag,
    title: p.title.toUpperCase(),
    dek: p.dek,
    tone: p.tone, photo: p.photo,
    caption: p.title.toUpperCase() + (p.photo ? " — ROBAT" : " — DETAIL"),
    body: p.body,
    moreTitle: "The Other Two Pillars",
    more: others.map(function(o){
      return miniCard({href:"#/about/" + o.slug, tone:o.tone, tag:o.tag, title:o.title, text:o.dek, photo:o.photo});
    }),
    ctaTitle: "See The Full Philosophy",
    ctaHref: "#/about", ctaLabel: "About ROBAT"
  });
}

function pageValue(v){
  var others = VALUES.filter(function(x){ return x.slug !== v.slug; });
  return pageDetail({
    backHref: "#/about", backLabel: "About ROBAT",
    eyebrowTag: "Value " + v.num + " Of 06",
    title: v.title.toUpperCase(),
    dek: v.short,
    tone: ["c","a","b","d","c","a"][others.length % 6],
    caption: v.title.toUpperCase() + " — DETAIL",
    body: v.body,
    moreTitle: "The Other Five Values",
    more: others.map(function(o){
      return miniCard({href:"#/values/" + o.slug, tone:"a", tag:"Value " + o.num, title:o.title, text:o.short});
    }),
    ctaTitle: "Six Values, No Exceptions",
    ctaHref: "#/about", ctaLabel: "See All Values"
  });
}

function pageProfile(pr){
  var others = PROFILES.filter(function(x){ return x.slug !== pr.slug; });
  return pageDetail({
    backHref: "#/about", backLabel: "About ROBAT",
    eyebrowTag: "Who It's For — " + pr.tag,
    title: pr.title.toUpperCase(),
    dek: pr.short,
    tone: "b",
    caption: pr.title.toUpperCase() + " — DETAIL",
    body: pr.body,
    moreTitle: "The Other Training Profiles",
    more: others.map(function(o){
      return miniCard({href:"#/for/" + o.slug, tone:"b", tag:o.tag, title:o.title, text:o.short});
    }),
    ctaTitle: "Built For How You Train",
    ctaHref: "#/about", ctaLabel: "About ROBAT"
  });
}

function pageEngineeredItem(it){
  var others = ENGINEERED_ITEMS.filter(function(x){ return x.slug !== it.slug; });
  return pageDetail({
    backHref: "#/engineered", backLabel: "Engineered",
    eyebrowTag: "Engineering Pillar",
    title: it.t.toUpperCase(),
    dek: it.c,
    tone: it.tone,
    caption: it.t.toUpperCase() + " — CLOSE-UP",
    body: it.body,
    moreTitle: "The Other Engineering Pillars",
    more: others.map(function(o){
      return miniCard({href:"#/engineered/" + o.slug, tone:o.tone, tag:"Engineered", title:o.t, text:o.c});
    }),
    ctaTitle: "See The Full Approach",
    ctaHref: "#/engineered", ctaLabel: "Engineered"
  });
}

function productCard(p){
  return '<a href="#/shop/' + p.slug + '" class="journal-card">' +
    visual({tone: "a", caption: p.name.toUpperCase(), photo: p.photo || null}) +
    '<div class="eyebrow">' + p.tag + '</div><h3>' + p.name + '</h3><p>' + p.short + '</p>' +
    '<span class="link">Shop ' + p.name.replace("GENERA ", "") + '</span>' +
  '</a>';
}

function pageShop(){
  return '' +
  '<section class="hero" style="min-height:50vh;">' +
    '<div class="hero-inner"><div class="wrap">' +
      '<div class="hero-eyebrow">GENERA \u2014 First Release</div>' +
      '<h1 style="font-size:clamp(2.4rem,6.5vw,5rem);">SHOP.</h1>' +
      '<p class="hero-sub">ROBAT&#39;s first generation of product. Limited. Intentional. Made to move.</p>' +
    '</div></div>' +
  '</section>' +

  '<section><div class="wrap">' +
    '<div class="journal-grid reveal">' + PRODUCTS.map(productCard).join("") + '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="reveal" style="max-width:70ch;">' +
      '<div class="eyebrow">Availability</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.6rem);text-transform:uppercase;margin-top:12px;">Limited First Run</h2>' +
      '<p class="lead" style="margin-top:16px;">GENERA launches October 31, 2026 in Black only, with additional colorways to follow. Pricing has not been finalized yet, so orders are confirmed directly rather than sold through an automated checkout \u2014 place an order below and the next step opens a WhatsApp message to ROBAT with everything filled in.</p>' +
      '<a href="#/faq/launch-date" class="link" style="display:inline-block;margin-top:22px;">More On The Launch</a>' +
    '</div>' +
  '</div></section>';
}

function productSizeChips(sizes){
  return sizes.map(function(s, i){
    return '<label class="of-chip"><input type="radio" name="size" value="' + s + '"' + (i === 0 ? " checked required" : "") + '><span>' + s + '</span></label>';
  }).join("");
}

function productColorChips(colors){
  return colors.map(function(c){
    if(!c.available){
      return '<label class="of-chip"><input type="radio" name="color" value="' + c.name + '" disabled><span>' + c.name + '<span class="soon">Coming Soon</span></span></label>';
    }
    return '<label class="of-chip"><input type="radio" name="color" value="' + c.name + '" checked required><span>' + c.name + '</span></label>';
  }).join("");
}

function pageProduct(p){
  var others = PRODUCTS.filter(function(x){ return x.slug !== p.slug; });
  return '' +
  '<section class="article-hero"><div class="wrap reveal">' +
    '<a href="#/shop" class="link" style="margin-bottom:20px;display:inline-block;">&larr; Shop</a>' +
    '<div class="eyebrow tag">' + p.tag + '</div>' +
    '<h1>' + p.name.toUpperCase() + '</h1>' +
    '<p class="lead dek">' + p.short + '</p>' +
  '</div></section>' +

  (p.gallery && p.gallery.length ?
    '<section style="padding-top:32px;"><div class="wrap">' +
      '<div class="product-gallery reveal">' +
        visual({className:"g-main", gridRow:"1 / span " + (p.gallery.length - 1), photo:p.gallery[0].photo, caption:p.gallery[0].caption}) +
        p.gallery.slice(1).map(function(g){ return visual({className:"g-sub", photo:g.photo, caption:g.caption}); }).join("") +
      '</div>' +
    '</div></section>'
  : (p.photo ?
    '<section style="padding-top:32px;"><div class="wrap">' +
      visual({ratio:"16/9", photo:p.photo, caption:p.name.toUpperCase()}) +
    '</div></section>'
  : '')) +

  '<section style="padding-top:32px;"><div class="wrap">' +
    '<div class="article-body reveal">' + p.body.map(function(par){ return "<p>" + par + "</p>"; }).join("") + '</div>' +
    '<p class="price-tag reveal">Price: To Be Announced \u2014 confirmed before GENERA launches on October 31, 2026.</p>' +
  '</div></section>' +

  '<section style="padding-top:8px;"><div class="wrap">' +
    '<div class="section-head reveal"><div><div class="eyebrow">Place An Order</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.4rem);">Reserve Yours</h2></div></div>' +
    '<p class="lead reveal">Choose a size and color and fill in your shipping details. There is no online payment yet \u2014 continuing opens a WhatsApp message to ROBAT with your full order pre-filled, so price, availability and payment can be confirmed with you directly.</p>' +
    '<form class="order-form reveal" data-product="' + p.name + '">' +
      '<div class="of-group"><div class="of-label">Size</div><div class="of-options">' + productSizeChips(p.sizes) + '</div></div>' +
      '<div class="of-group"><div class="of-label">Color</div><div class="of-options">' + productColorChips(p.colors) + '</div></div>' +
      '<div class="of-field" style="max-width:140px;"><label>Quantity</label><input type="number" name="qty" min="1" max="10" value="1" required></div>' +
      '<div class="of-group"><div class="of-label">Shipping Details</div>' +
        '<div class="of-row">' +
          '<div class="of-field"><label>Full Name</label><input type="text" name="fullName" autocomplete="name" required></div>' +
          '<div class="of-field"><label>Phone Number</label><input type="tel" name="phone" autocomplete="tel" required></div>' +
        '</div>' +
        '<div class="of-row">' +
          '<div class="of-field"><label>Email (Optional)</label><input type="email" name="email" autocomplete="email"></div>' +
          '<div class="of-field"><label>Country</label><input type="text" name="country" autocomplete="country-name" required></div>' +
        '</div>' +
        '<div class="of-field"><label>Address Line</label><input type="text" name="address" autocomplete="street-address" required></div>' +
        '<div class="of-row">' +
          '<div class="of-field"><label>City</label><input type="text" name="city" autocomplete="address-level2" required></div>' +
          '<div class="of-field"><label>State / Region</label><input type="text" name="state" autocomplete="address-level1" required></div>' +
        '</div>' +
        '<div class="of-field" style="max-width:220px;"><label>Postal Code</label><input type="text" name="postal" autocomplete="postal-code"></div>' +
      '</div>' +
      '<div><button type="submit" class="btn solid block">Continue To Payment</button>' +
        '<p class="of-msg"></p>' +
      '</div>' +
    '</form>' +
  '</div></section>' +

  (others.length ?
    '<section style="padding-top:0;"><div class="wrap">' +
      '<div class="article-more reveal">' +
        '<div class="eyebrow" style="margin-bottom:24px;">More From The Shop</div>' +
        '<div class="article-more-grid">' + others.map(productCard).join("") + '</div>' +
      '</div>' +
    '</div></section>'
  : '') +

  '<section><div class="wrap"><div class="reveal" style="text-align:center;max-width:60ch;margin:0 auto;">' +
    '<h2 style="font-size:clamp(1.8rem,4vw,2.8rem);text-transform:uppercase;">Questions Before You Order?</h2>' +
    '<a href="#/contact" class="btn solid" style="margin-top:24px;">Contact ROBAT</a>' +
  '</div></div></section>';
}

function pageFaq(f){
  var isEng = f.category === "engineered";
  var backHref = isEng ? "#/engineered" : "#/contact";
  var backLabel = isEng ? "Engineered" : "Contact";
  var others = FAQS.filter(function(x){ return x.slug !== f.slug && x.category === f.category; });
  return pageDetail({
    backHref: backHref, backLabel: backLabel,
    eyebrowTag: "FAQ — " + (isEng ? "Engineering" : "Contact"),
    title: f.q,
    tone: "a",
    caption: "FAQ",
    body: f.body,
    moreTitle: "More Questions",
    more: others.map(function(o){
      return miniCard({href:"#/faq/" + o.slug, tone:"a", tag:"FAQ", title:o.q, text:o.body[0]});
    }),
    ctaTitle: "Still Have Questions?",
    ctaHref: "#/contact", ctaLabel: "Contact ROBAT"
  });
}

/* ============================================================
   GENERA QR EXPERIENCE — the product page a customer lands on
   after scanning the QR code printed inside a GENERA garment.
   Reached only by direct link (not in the nav), so it is built
   as one more route + page function like every other page here,
   just with its own small reveal/count-up/parallax layer scoped
   to the gx- prefixed classes above.
   ============================================================ */
function gxStat(v, suffix, label){
  return '<div class="gx-spec-stat"><div class="v"><span class="gx-count" data-target="' + v + '" data-suffix="' + (suffix || "") + '">0' + (suffix || "") + '</span></div><div class="l">' + label + '</div></div>';
}
function gxSysStat(v, suffix, label){
  return '<div class="gx-sys-stat"><div class="v"><span class="gx-count" data-target="' + v + '" data-suffix="' + (suffix || "") + '">0' + (suffix || "") + '</span></div><div class="l">' + label + '</div></div>';
}

function gxSpecCard(spec){
  return '' +
  '<div class="gx-spec gx-reveal">' +
    '<div>' +
      '<div class="gx-spec-label">' + spec.label + '</div>' +
      '<div class="gx-spec-code">' + spec.code + '</div>' +
    '</div>' +
    '<div>' +
      '<div class="gx-spec-stats">' +
        spec.stats.map(function(s){ return gxStat(s.v, s.suffix, s.l); }).join("") +
        (spec.tag ? '<span class="gx-tagpill">' + spec.tag + '</span>' : "") +
      '</div>' +
      '<div class="gx-spec-desc">' + spec.desc.map(function(p){ return '<p>' + p + '</p>'; }).join("") + '</div>' +
    '</div>' +
  '</div>';
}

function gxSystemCard(item, idx){
  return '' +
  '<div class="gx-system-card gx-reveal" style="transition-delay:' + (idx * 0.12).toFixed(2) + 's;">' +
    '<div class="gx-sys-index">' + item.num + '</div>' +
    '<div class="gx-sys-num">' + item.num + ' / ' + item.code + '</div>' +
    '<h3>' + item.title + '</h3>' +
    '<div class="gx-sys-stats">' + item.stats.map(function(s){ return gxSysStat(s.v, s.suffix, s.l); }).join("") + '</div>' +
    '<div class="gx-sys-used">Used In<b>' + item.used + '</b></div>' +
  '</div>';
}

function pageGenera(){
  var shirtSpecs = [
    {
      label: "MAIN FABRIC \u2014 S04", code: "S04",
      stats: [ {v:92,suffix:"%",l:"Polyester"}, {v:8,suffix:"%",l:"Spandex"}, {v:185,suffix:"",l:"GSM"} ],
      tag: "4-Way Stretch",
      desc: [
        "The foundation of the GENERA Short Sleeve. A structured polyester-spandex fabric designed to move naturally with the body.",
        "Its 4-way stretch construction provides flexibility across multiple directions while maintaining the structured GENERA silhouette."
      ]
    },
    {
      label: "SIDE MESH \u2014 DA05", code: "DA05",
      stats: [ {v:93,suffix:"%",l:"Polyester"}, {v:7,suffix:"%",l:"Spandex"}, {v:135,suffix:"",l:"GSM"} ],
      tag: "Eyelet Mesh",
      desc: [
        "Positioned along the sides of the garment, the lighter DA05 eyelet mesh creates dedicated ventilation areas while maintaining stretch and flexibility."
      ]
    }
  ];
  var shortsSpecs = [
    {
      label: "MAIN FABRIC \u2014 S01", code: "S01",
      stats: [ {v:94,suffix:"%",l:"Polyester"}, {v:6,suffix:"%",l:"Spandex"}, {v:120,suffix:"",l:"GSM"} ],
      tag: "4-Way Stretch Woven",
      desc: [
        "A lightweight woven fabric selected for lower-body movement.",
        "Its 4-way stretch construction allows the shorts to move naturally across multiple directions during training while maintaining a clean athletic silhouette."
      ]
    },
    {
      label: "SIDE MESH \u2014 DA05", code: "DA05",
      stats: [ {v:93,suffix:"%",l:"Polyester"}, {v:7,suffix:"%",l:"Spandex"}, {v:135,suffix:"",l:"GSM"} ],
      tag: "Eyelet Mesh",
      desc: [
        "The GENERA shorts incorporate the same DA05 eyelet mesh system used in the Short Sleeve, creating ventilation zones and maintaining a consistent material language throughout the GENERA set."
      ]
    }
  ];
  var system = [
    { num:"01", code:"S04", title:"STRUCTURE", used:"GENERA Short Sleeve",
      stats:[ {v:92,suffix:"%",l:"Polyester"}, {v:8,suffix:"%",l:"Spandex"}, {v:185,suffix:"",l:"GSM"} ] },
    { num:"02", code:"S01", title:"MOVEMENT", used:"GENERA Shorts",
      stats:[ {v:94,suffix:"%",l:"Polyester"}, {v:6,suffix:"%",l:"Spandex"}, {v:120,suffix:"",l:"GSM"} ] },
    { num:"03", code:"DA05", title:"AIRFLOW", used:"GENERA Short Sleeve + Shorts",
      stats:[ {v:93,suffix:"%",l:"Polyester"}, {v:7,suffix:"%",l:"Spandex"}, {v:135,suffix:"",l:"GSM"} ] }
  ];

  return '' +
  '<section class="gx-hero">' +
    '<div class="gx-hero-top wrap gx-reveal"><span class="gx-tag">ROBAT / GENERA</span></div>' +
    '<div class="gx-hero-center wrap gx-reveal">' +
      '<div class="gx-hero-parallax">' +
        '<h1 class="gx-hero-headline">YOU&#39;RE WEARING<br>GENERA.</h1>' +
        '<p class="gx-hero-sub">This isn&#39;t a care label.<br>It&#39;s the story of what you&#39;re wearing.</p>' +
      '</div>' +
    '</div>' +
    '<div class="gx-hero-bottom wrap gx-reveal">' +
      '<button type="button" id="gx-scroll-btn" class="gx-scroll-cue"><span>DISCOVER WHAT GENERA IS MADE OF</span><span class="gx-arrow">&darr;</span></button>' +
    '</div>' +
  '</section>' +

  '<section id="gx-start"><div class="wrap">' +
    '<div class="gx-reveal" style="max-width:66ch;">' +
      '<div class="eyebrow">Genera / Material System</div>' +
      '<h2 class="gx-h2" style="margin-top:14px;">BUILT WITH<br>PURPOSE.</h2>' +
    '</div>' +
    '<div class="gx-rule" style="margin:32px 0;"></div>' +
    '<div class="gx-reveal" style="max-width:66ch;">' +
      '<p class="lead">GENERA was designed around movement.</p>' +
      '<p class="lead" style="margin-top:18px;">Every fabric was selected for a purpose \u2014 structure where you need it, stretch where you move, and mesh where the body needs greater airflow.</p>' +
      '<p class="lead" style="margin-top:18px;">This is what&#39;s behind what you&#39;re wearing.</p>' +
    '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="gx-reveal">' +
      '<div class="eyebrow">Garment 01</div>' +
      '<h2 class="gx-h2" style="margin-top:10px;">GENERA<br>SHORT SLEEVE</h2>' +
    '</div>' +
    '<div class="gx-spec-list" style="margin-top:44px;">' + shirtSpecs.map(gxSpecCard).join("") + '</div>' +
  '</div></section>' +

  '<section class="statement" style="padding:80px 0;"><div class="wrap gx-reveal">' +
    '<blockquote>STRUCTURE.<br>STRETCH.<br>AIRFLOW.</blockquote>' +
  '</div></section>' +

  '<section><div class="wrap">' +
    '<div class="gx-reveal">' +
      '<div class="eyebrow">Garment 02</div>' +
      '<h2 class="gx-h2" style="margin-top:10px;">GENERA<br>SHORTS</h2>' +
    '</div>' +
    '<div class="gx-spec-list" style="margin-top:44px;">' + shortsSpecs.map(gxSpecCard).join("") + '</div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="section-head gx-reveal"><div><div class="eyebrow">The Material System</div><h2 class="gx-h2" style="margin-top:10px;">THE GENERA<br>SYSTEM.</h2></div></div>' +
    '<div class="gx-system-grid">' + system.map(gxSystemCard).join("") + '</div>' +
  '</div></section>' +

  '<section><div class="wrap">' +
    '<div class="gx-stack">' +
      '<div class="gx-stack-line gx-reveal">EVERY MATERIAL.</div>' +
      '<div class="gx-stack-line gx-reveal" style="transition-delay:.08s;">EVERY PANEL.</div>' +
      '<div class="gx-stack-line gx-reveal" style="transition-delay:.16s;">EVERY DETAIL.</div>' +
      '<div class="gx-stack-line gx-reveal" style="transition-delay:.24s;color:var(--accent);">HAS A PURPOSE.</div>' +
    '</div>' +
    '<div class="gx-reveal" style="max-width:58ch;margin-top:46px;">' +
      '<p class="lead">GENERA isn&#39;t built from a single fabric.</p>' +
      '<p class="lead" style="margin-top:16px;">Different parts of the garment have different jobs.</p>' +
      '<p class="lead" style="margin-top:16px;">Structure.<br>Movement.<br>Ventilation.</p>' +
      '<p class="lead" style="margin-top:16px;">Multiple materials.<br>One system.</p>' +
    '</div>' +
    '<div class="gx-reveal" style="margin-top:28px;"><span class="gx-genera-word">GENERA.</span></div>' +
  '</div></section>' +

  '<section style="padding-top:0;"><div class="wrap">' +
    '<div class="gx-found gx-reveal">' +
      '<span class="gx-found-badge">&#9670; Verified Via Garment QR</span>' +
      '<h2 class="gx-h2" style="margin-top:18px;font-size:clamp(1.7rem,4.4vw,2.8rem);">YOU FOUND IT.</h2>' +
      '<p class="lead" style="margin:18px auto 0;">The QR inside your GENERA piece connects the physical product to ROBAT&#39;s digital world.</p>' +
      '<p class="lead" style="margin:14px auto 0;">What you&#39;re wearing has a story.<br>Now you know what&#39;s behind it.</p>' +
    '</div>' +
  '</div></section>' +

  '<section class="gx-final">' +
    '<div class="wrap gx-reveal">' +
      '<div class="gx-final-word">GENERA</div>' +
      '<p class="gx-final-tag">ENGINEERED FOR MOVEMENT.<br>DESIGNED BY ROBAT.</p>' +
      '<img class="gx-final-logo" src="' + MARK_CREAM + '" alt="ROBAT">' +
      '<div class="gx-final-copy">ROBAT &copy; 2026</div>' +
    '</div>' +
  '</section>';
}

/* ---- scroll-driven behavior for the GENERA page only: real
   IntersectionObserver reveals + count-up + a touch of parallax,
   all torn down on route change so no listener leaks onto other
   pages (every other page keeps the sitewide no-op .reveal). ---- */
var GX_OBSERVER = null;
var GX_SCROLL_HANDLER = null;
var GX_REDUCED_MOTION = false;

function teardownGeneraExperience(){
  if(GX_OBSERVER){ GX_OBSERVER.disconnect(); GX_OBSERVER = null; }
  if(GX_SCROLL_HANDLER){ window.removeEventListener("scroll", GX_SCROLL_HANDLER); GX_SCROLL_HANDLER = null; }
}

function gxAnimateCount(el){
  var target = parseFloat(el.getAttribute("data-target")) || 0;
  var suffix = el.getAttribute("data-suffix") || "";
  if(GX_REDUCED_MOTION){ el.textContent = target + suffix; return; }
  var start = null;
  var duration = 900;
  function step(ts){
    if(start === null){ start = ts; }
    var p = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if(p < 1){ requestAnimationFrame(step); }
  }
  requestAnimationFrame(step);
}

function initGeneraExperience(){
  teardownGeneraExperience();
  GX_REDUCED_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var revealEls = document.querySelectorAll(".gx-reveal, .gx-rule");
  if(!("IntersectionObserver" in window) || GX_REDUCED_MOTION){
    revealEls.forEach(function(el){
      el.classList.add("in-view");
      el.querySelectorAll(".gx-count").forEach(function(c){ gxAnimateCount(c); });
    });
  } else {
    GX_OBSERVER = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in-view");
          entry.target.querySelectorAll(".gx-count").forEach(function(c){
            if(!c.getAttribute("data-counted")){
              c.setAttribute("data-counted", "1");
              gxAnimateCount(c);
            }
          });
          GX_OBSERVER.unobserve(entry.target);
        }
      });
    }, {threshold:0.35, rootMargin:"0px 0px -8% 0px"});
    revealEls.forEach(function(el){ GX_OBSERVER.observe(el); });
  }

  var scrollBtn = document.getElementById("gx-scroll-btn");
  if(scrollBtn){
    scrollBtn.onclick = function(){
      var target = document.getElementById("gx-start");
      if(target){ target.scrollIntoView({behavior: GX_REDUCED_MOTION ? "auto" : "smooth", block:"start"}); }
    };
  }

  var heroEl = document.querySelector(".gx-hero");
  var parallaxEl = document.querySelector(".gx-hero-parallax");
  if(heroEl && parallaxEl && !GX_REDUCED_MOTION){
    var heroH = heroEl.offsetHeight || 800;
    GX_SCROLL_HANDLER = function(){
      var y = window.scrollY || window.pageYOffset;
      var progress = Math.min(Math.max(y / heroH, 0), 1);
      parallaxEl.style.transform = "translateY(" + (progress * 60) + "px)";
      parallaxEl.style.opacity = String(1 - progress);
    };
    window.addEventListener("scroll", GX_SCROLL_HANDLER, {passive:true});
  }
}

function pageNotFound(){
  return '<section class="not-found"><div class="wrap"><div class="eyebrow">404</div><h2 style="text-transform:uppercase;margin-top:10px;">Page Not Found</h2><a href="#/" class="btn solid" style="margin-top:24px;">Back To ROBAT</a></div></section>';
}

/* ============================================================
   REVEAL — intentionally a no-op. Content renders fully visible
   at rest on every route; nothing depends on scroll or observer
   timing to become readable.
   ============================================================ */
function initReveal(){}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
render();

})();
