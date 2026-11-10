/* VELORA — application (hash router, cart, wishlist, filters, layers) */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const eur = (n) => "€" + n.toLocaleString("en-US");
const ic = (d, x = "") => `<svg viewBox="0 0 24 24" aria-hidden="true" ${x}>${d}</svg>`;
const I = {
  search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'), user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>'),
  heart: ic('<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>'),
  bag: ic('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'), menu: ic('<path d="M4 8h16M4 16h16"/>'),
  x: ic('<path d="M6 6l12 12M18 6 6 18"/>'), plus: ic('<path d="M12 5v14M5 12h14"/>'), minus: ic('<path d="M5 12h14"/>'),
};
const MAX = 10;
const validIds = (ids) => Array.isArray(ids) ? [...new Set(ids.map(Number).filter((id) => ProductService.byId(id)))].slice(0, 8) : [];
const S = { cart: [], wish: validIds(WishlistService.load()), recent: validIds(RecentlyViewedService.load()), f: { q: "", sizes: [], colors: [], price: "", avail: false, sort: "featured", cat: "all", type: "all" }, panel: false };
const sel = { pdp: null, qv: null };
S.cart = (Array.isArray(CartService.load()) ? CartService.load() : []).filter((i) => i && ProductService.byId(+i.id)).map((i) => {
  const p = ProductService.byId(+i.id);
  return { id: p.id, color: p.colors.some((c) => c.n === i.color) ? i.color : p.colors[0].n, size: p.sizes.includes(i.size) ? i.size : p.sizes[0], qty: Math.min(MAX, Math.max(1, Math.floor(+i.qty) || 1)) };
});
CartService.save(S.cart); WishlistService.save(S.wish); RecentlyViewedService.save(S.recent);

/* ---------- layers ---------- */
let lastFocus = null, layer = null;
const L = { drawer: $("#drawer"), search: $("#searchOv"), modal: $("#modal"), mob: $("#mobnav"), scrim: $("#scrim") };
function openLayer(el, scrim = false) {
  closeLayers(true); lastFocus = document.activeElement; layer = el; el.classList.add("on");
  if (scrim) L.scrim.classList.add("on");
  document.body.style.overflow = "hidden"; $("#menuBtn").setAttribute("aria-expanded", el === L.mob);
  setTimeout(() => (el.querySelector("[autofocus],input,button,a") || el).focus(), 60);
}
function closeLayers(keep) {
  Object.values(L).forEach((e) => e.classList.remove("on")); layer = null; document.body.style.overflow = "";
  $("#menuBtn").setAttribute("aria-expanded", "false"); if (!keep && lastFocus) lastFocus.focus?.();
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && layer) closeLayers();
  if (e.key === "Tab" && layer) {
    const f = $$('a[href],button:not(:disabled),input,select,summary', layer).filter((x) => x.offsetParent);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2600); }
function modal(html, cls = "") { L.modal.innerHTML = `<div class="mb ${cls}"><button class="ib x" data-act="close" aria-label="Close">${I.x}</button>${html}</div>`; openLayer(L.modal); }
L.modal.addEventListener("click", (e) => { if (e.target === L.modal) closeLayers(); });

/* ---------- cart / wishlist ---------- */
const keyOf = (i) => `${i.id}|${i.color}|${i.size}`;
const totals = () => { const sub = S.cart.reduce((a, i) => a + ProductService.byId(i.id).price * i.qty, 0); const ship = !sub || sub >= 500 ? 0 : 25; return { sub, ship, total: sub + ship, n: S.cart.reduce((a, i) => a + i.qty, 0) }; };
const shippingProgress = (sub) => sub >= 500
  ? '<p class="ship-note" role="status">Your order qualifies for complimentary shipping.</p>'
  : `<div class="ship-progress"><p class="ship-note">You are ${eur(500 - sub)} away from complimentary shipping.</p><div class="ship-track" role="progressbar" aria-label="Progress toward complimentary shipping" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, sub / 5)}"><span style="width:${Math.min(100, sub / 5)}%"></span></div></div>`;
function saveCart() { CartService.save(S.cart); badges(); $("#drawer").innerHTML = drawerHtml(); if (cur === "cart") $("#app").innerHTML = cartPage(); }
function badges() { const n = totals().n, w = S.wish.length; [["#ccount", n], ["#wcount", w]].forEach(([s, v]) => { const b = $(s); b.textContent = v; b.dataset.n = v; }); }
function addToCart(id, color, size, qty) {
  const ex = S.cart.find((i) => keyOf(i) === `${id}|${color}|${size}`);
  if (ex) ex.qty = Math.min(MAX, ex.qty + qty); else S.cart.push({ id, color, size, qty: Math.min(MAX, qty) });
  saveCart();
}
function toggleWish(id) { S.wish = S.wish.includes(id) ? S.wish.filter((x) => x !== id) : [...S.wish, id]; WishlistService.save(S.wish); badges(); syncWish(); if (cur === "wishlist") $("#app").innerHTML = wishPage(); return S.wish.includes(id); }
function syncWish() { $$('[data-act="wish"]').forEach((b) => { const on = S.wish.includes(+b.dataset.id); b.setAttribute("aria-pressed", on); if (b.dataset.lbl !== undefined) b.textContent = on ? "In your wishlist" : "Add to wishlist"; }); }

/* ---------- components ---------- */
const dots = (p) => `<div class="dots" aria-label="Colors: ${p.colors.map((c) => c.n).join(", ")}">${p.colors.map((c) => `<span class="dot" style="background:${c.h}" title="${c.n}"></span>`).join("")}</div>`;
const isNew = (p) => (new Date("2026-11-10") - new Date(p.createdAt)) / 864e5 < 30;
const card = (p) => `<article class="card rv"><div class="pw"><a class="ph" href="#/product/${p.slug}" aria-label="${esc(p.name)}"><img src="${p.images[0]}" alt="${esc(p.name)} — front" loading="lazy" width="400" height="500"><img src="${p.images[1]}" alt="${esc(p.name)} — detail" loading="lazy" width="400" height="500"></a>
${!p.inStock ? '<span class="tag">Sold out</span>' : isNew(p) ? '<span class="tag">New</span>' : ""}
<button class="ib wish" data-act="wish" data-id="${p.id}" aria-pressed="${S.wish.includes(p.id)}" aria-label="Toggle wishlist: ${esc(p.name)}">${I.heart}</button>
<button class="qv" data-act="qv" data-id="${p.id}">Quick View</button></div>
<div class="meta"><div><a class="nm" href="#/product/${p.slug}">${esc(p.name)}</a>${dots(p)}</div><span>${eur(p.price)}</span></div></article>`;
const sectionHead = (e, t, l, h) => `<div class="sh rv"><div><p class="eyebrow">${e}</p><h2>${t}</h2></div>${l ? `<a class="link" href="${h}">${l}</a>` : ""}</div>`;

function buyHtml(ctx) {
  const s = sel[ctx], p = s.p;
  return `<div><div class="row"><span class="eyebrow">Color — ${p.colors[s.color].n}</span></div><div class="chips">${p.colors.map((c, i) => `<button class="sw" data-act="color" data-ctx="${ctx}" data-v="${i}" aria-pressed="${i === s.color}" aria-label="${c.n}"><i style="background:${c.h}"></i></button>`).join("")}</div></div>
<div><div class="row"><span class="eyebrow">Size${s.size ? " — " + s.size : ""}</span><button class="link" data-act="sizeguide" data-ctx="${ctx}">Size guide</button></div>
<div class="chips" role="group" aria-label="Size">${p.sizes.map((z) => `<button class="chip" data-act="size" data-ctx="${ctx}" data-v="${z}" aria-pressed="${z === s.size}">${z}</button>`).join("")}</div><p class="err" role="alert">${s.err || ""}</p></div>
<div class="row"><span class="eyebrow">Quantity</span><div class="qty"><button data-act="qty" data-ctx="${ctx}" data-d="-1" aria-label="Decrease quantity" ${s.qty <= 1 ? "disabled" : ""}>${I.minus}</button><span aria-live="polite">${s.qty}</span><button data-act="qty" data-ctx="${ctx}" data-d="1" aria-label="Increase quantity" ${s.qty >= MAX ? "disabled" : ""}>${I.plus}</button></div></div>
<div class="acts"><button class="btn full" data-act="add" data-ctx="${ctx}" ${p.inStock ? "" : "disabled"}>${p.inStock ? "Add to bag" : "Sold out"}</button>
<button class="btn ghost full" data-act="wish" data-id="${p.id}" data-lbl aria-pressed="${S.wish.includes(p.id)}">${S.wish.includes(p.id) ? "In your wishlist" : "Add to wishlist"}</button></div>`;
}
const cartItem = (i) => { const p = ProductService.byId(i.id), c = p.colors.find((x) => x.n === i.color) || p.colors[0]; const k = esc(keyOf(i));
  return `<div class="it"><a class="ph" href="#/product/${p.slug}"><img src="${p.images[0]}" alt="${esc(p.name)}" width="96" height="120"></a>
<div><a class="nm" href="#/product/${p.slug}">${esc(p.name)}</a><small>${c.n} · ${esc(i.size)}</small><small>${eur(p.price)}</small>
<div class="qty" style="margin:.6rem 0"><button data-act="cqty" data-k="${k}" data-d="-1" aria-label="Decrease quantity of ${esc(p.name)}" ${i.qty <= 1 ? "disabled" : ""}>${I.minus}</button><span aria-live="polite">${i.qty}</span><button data-act="cqty" data-k="${k}" data-d="1" aria-label="Increase quantity of ${esc(p.name)}" ${i.qty >= MAX ? "disabled" : ""}>${I.plus}</button></div>
<button class="rm" data-act="rm" data-k="${k}">Remove</button></div><strong style="font-weight:400">${eur(p.price * i.qty)}</strong></div>`; };
const emptyBag = '<div class="empty"><h3>Your bag is empty</h3><p class="muted" style="margin-bottom:1.5rem">Discover pieces made to last.</p><a class="btn" href="#/shop" data-act="close">Continue shopping</a></div>';
function drawerHtml() { const t = totals();
  return `<header><h2 style="font-size:1.6rem">Shopping Bag (${t.n})</h2><button class="ib" data-act="close" aria-label="Close bag">${I.x}</button></header>
<div class="items">${S.cart.length ? S.cart.map(cartItem).join("") : emptyBag}</div>
${S.cart.length ? `<footer><div class="row"><span>Subtotal</span><span>${eur(t.sub)}</span></div>${shippingProgress(t.sub)}<p class="muted" style="font-size:.8rem">${t.ship ? "Shipping €25" : "Complimentary shipping"}</p>
<button class="btn full" data-act="checkout">Checkout</button><a class="btn ghost full" href="#/cart" data-act="close">View bag</a><button class="link" data-act="close">Continue shopping</button></footer>` : ""}`; }
function cartPage() { const t = totals();
  return `<div class="wrap"><div class="ph-head"><p class="eyebrow">Your selection</p><h1>Shopping Bag</h1></div>${S.cart.length ? `<div class="cartpg"><div class="items">${S.cart.map(cartItem).join("")}<a class="link" style="margin-top:2rem;align-self:flex-start" href="#/shop">Continue shopping</a></div>
<aside class="sum" aria-label="Order summary"><h3>Summary</h3><div class="row"><span>Subtotal</span><span>${eur(t.sub)}</span></div>${shippingProgress(t.sub)}<div class="row"><span>Shipping</span><span>${t.ship ? eur(t.ship) : "Free"}</span></div><div class="row tot"><span>Estimated total</span><span>${eur(t.total)}</span></div>
<button class="btn full" data-act="checkout">Checkout</button><p class="muted" style="font-size:.75rem">Demonstration only — no payment is processed.</p></aside></div>` : emptyBag}</div>`; }
function wishPage() { const l = S.wish.map((id) => ProductService.byId(id)).filter(Boolean);
  return `<div class="wrap"><div class="ph-head"><p class="eyebrow">Saved pieces</p><h1>Wishlist</h1></div>${l.length ? `<div class="grid" style="padding-bottom:var(--s5)">${l.map((p) => card(p).replace('class="card rv"', 'class="card rv in"') + "").join("")}</div>` : '<div class="empty"><h3>Nothing saved yet</h3><p class="muted" style="margin-bottom:1.5rem">Tap the heart on any piece to keep it here.</p><a class="btn" href="#/shop">Discover the collection</a></div>'}</div>`; }
function recentlyViewed(exceptId, heading = "Recently viewed") { const l = S.recent.filter((id) => id !== exceptId).slice(0, 4).map((id) => ProductService.byId(id)).filter(Boolean);
  return l.length ? `<section class="sec wrap">${sectionHead("Your edit", heading, "View all pieces", "#/shop")}<div class="grid">${l.map((p) => card(p).replace('class="card rv"', 'class="card rv in"')).join("")}</div></section>` : ""; }

/* ---------- pages ---------- */
const newsletter = `<section class="sec nl"><div class="wrap" style="text-align:center"><p class="eyebrow">Newsletter</p><h2>Letters from the Atelier</h2><p class="muted" style="margin-top:1rem">Early access to collections and private events.</p>
<form id="nlForm" novalidate><div style="flex:1;text-align:left"><label class="l" for="nlEmail">Email address</label><input id="nlEmail" type="email" autocomplete="email" placeholder="you@example.com" aria-describedby="nlErr"><div class="err" id="nlErr" role="alert"></div></div><button class="btn" type="submit">Subscribe</button></form></div></section>`;
function home() {
  const nw = [...PRODUCTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4), bs = [2, 13, 16, 19].map((id) => ProductService.byId(id));
  return `<section class="hero"><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=90" alt="Editorial fashion campaign in warm autumn light" fetchpriority="high" decoding="async"><div class="in"><p class="eyebrow">Autumn / Winter 2026</p><h1>Quiet <em>Authority</em></h1><p>Considered silhouettes, exceptional materials. Pieces made to outlast the season.</p><a class="btn" href="#/shop">Explore collection</a></div><span class="scroll">Scroll</span></section>
<section class="sec wrap">${sectionHead("Just landed", "New Arrivals", "View all", "#/shop/new")}<div class="grid">${nw.map(card).join("")}</div></section>
<section class="sec wrap" style="padding-top:0">${sectionHead("Curated", "Featured Collections")}<div class="cols rv">
<a class="col" href="#/shop/women"><div class="ph"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85" alt="Women's collection" loading="lazy"></div><span>Women</span></a>
<a class="col" href="#/shop/men"><div class="ph"><img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85" alt="Men's collection" loading="lazy"></div><span>Men</span></a>
<a class="col" href="#/shop/shoes"><div class="ph"><img src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85" alt="The VELORA footwear collection" loading="lazy"></div><span>Shoes</span></a></div></section>
<section class="edit"><div class="ph"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85" alt="Editorial study in silhouette and tonal light" loading="lazy"></div><div class="tx rv"><p class="eyebrow" style="color:var(--champ)">The Campaign</p><h2>Shape, shadow, <em>stillness</em></h2><p style="opacity:.8;max-width:40ch">Photographed in the soft light of late autumn — a study in proportion and restraint.</p><a class="btn light" href="#/shop/new">Shop the story</a></div></section>
<section class="sec wrap">${sectionHead("Most loved", "Best Sellers", "Shop all", "#/shop")}<div class="grid">${bs.map(card).join("")}</div></section>${recentlyViewed(null)}
<section class="sec wrap"><div class="phil rv"><p class="eyebrow">Philosophy</p><h2 style="margin:1rem 0 2rem">Luxury is the absence of <em>noise</em>.</h2><p class="muted">We design fewer pieces, in better materials, with deliberate proportion. Every garment is made to be worn for years, not seasons.</p><a class="link" style="display:inline-block;margin-top:2rem" href="#/about">Our story</a></div></section>${newsletter}`;
}
const allColors = Object.values(PRODUCTS.reduce((m, p) => (p.colors.forEach((c) => (m[c.n] = c)), m), {}));
function filtered() { const f = S.f, q = f.q.trim().toLowerCase(); let r = PRODUCTS.filter((p) => (f.cat === "all" || p.category === f.cat) && (f.type === "all" || p.type === f.type) && (!q || `${p.name} ${p.material} ${p.category} ${p.type} ${p.description}`.toLowerCase().includes(q)) && (!f.sizes.length || f.sizes.some((s) => p.sizes.includes(s))) && (!f.colors.length || p.colors.some((c) => f.colors.includes(c.n))) && (!f.price || (f.price === "a" ? p.price < 500 : f.price === "b" ? p.price >= 500 && p.price < 1000 : p.price >= 1000)) && (!f.avail || p.inStock));
  const o = { newest: (a, b) => b.createdAt.localeCompare(a.createdAt), "low": (a, b) => a.price - b.price, "high": (a, b) => b.price - a.price, featured: (a, b) => b.featured - a.featured || a.id - b.id }; return r.sort(o[f.sort]); }
const dirty = () => { const f = S.f; return f.q || f.sizes.length || f.colors.length || f.price || f.avail || f.type !== "all"; };
function shop() { const f = S.f, t = f.type === "footwear" ? "Shoes" : f.type === "accessory" ? "Accessories" : f.sort === "newest" && f.cat === "all" ? "New Arrivals" : { all: "The Collection", women: "Women", men: "Men" }[f.cat];
  const filterSizes = [...new Set(PRODUCTS.filter((p) => (f.cat === "all" || p.category === f.cat) && (f.type === "all" || p.type === f.type)).flatMap((p) => p.sizes))];
  const categories = [{ label: "All", href: "#/shop", active: f.cat === "all" && f.type === "all" }, { label: "Women", href: "#/shop/women", active: f.cat === "women" }, { label: "Men", href: "#/shop/men", active: f.cat === "men" }, { label: "Shoes", href: "#/shop/shoes", active: f.type === "footwear" }, { label: "Accessories", href: "#/shop/accessories", active: f.type === "accessory" }];
  return `<div class="wrap"><div class="ph-head"><p class="eyebrow">VELORA</p><h1>${t}</h1><nav class="cats" aria-label="Categories">${categories.map((c) => `<a href="${c.href}" class="${c.active ? "on" : ""}" ${c.active ? 'aria-current="page"' : ""}>${c.label}</a>`).join("")}</nav></div>
<div class="bar"><div><label class="l" for="fq">Search</label><input id="fq" type="search" placeholder="Search products" value="${esc(f.q)}"></div>
<div><label class="l" for="sort">Sort</label><select id="sort"><option value="featured">Featured</option><option value="newest">Newest</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></div>
<button class="btn ghost" data-act="ftoggle" aria-expanded="${S.panel}" aria-controls="panel">Filters</button></div>
<div class="panel ${S.panel ? "open" : ""}" id="panel"><div><h4>Size</h4><div class="chips">${filterSizes.map((z) => `<button class="chip" data-act="fsize" data-v="${z}" aria-pressed="${f.sizes.includes(z)}">${z}</button>`).join("")}</div></div>
<div><h4>Color</h4><div class="chips">${allColors.map((c) => `<button class="sw" data-act="fcolor" data-v="${c.n}" aria-label="${c.n}"><i style="background:${c.h}"></i></button>`).join("")}</div></div>
<div><h4>Price</h4><select id="fprice" aria-label="Price range"><option value="">All prices</option><option value="a">Under €500</option><option value="b">€500 – €1,000</option><option value="c">€1,000 and over</option></select></div>
<div><h4>Availability</h4><label style="display:flex;gap:.6rem;align-items:center;min-height:44px"><input type="checkbox" id="favail"> In stock only</label></div></div>
<div class="count"><span id="count" aria-live="polite"></span><button class="link" data-act="clear" id="clr">Clear all filters</button></div>
<div class="grid" id="grid" style="padding-bottom:var(--s5)">${'<div class="skel"></div>'.repeat(8)}</div></div>`; }
async function updateShop() { await ProductService.all(); const r = filtered(), f = S.f;
  $("#grid").innerHTML = r.length ? r.map(card).join("") : '<div class="empty"><h3>No pieces match your selection</h3><p class="muted" style="margin-bottom:1.5rem">Try removing a filter or searching for something else.</p><button class="btn" data-act="clear">Clear all filters</button></div>';
  $("#count").textContent = `${r.length} ${r.length === 1 ? "piece" : "pieces"}`; $("#clr").hidden = !dirty();
  $$('[data-act="fsize"]').forEach((b) => b.setAttribute("aria-pressed", f.sizes.includes(b.dataset.v))); $$('[data-act="fcolor"]').forEach((b) => b.setAttribute("aria-pressed", f.colors.includes(b.dataset.v)));
  $("#sort").value = f.sort; $("#fprice").value = f.price; $("#favail").checked = f.avail; reveal(); }
function pdpPage(p) { const s = sel.pdp;
  return `<div class="wrap"><nav class="eyebrow" style="padding-top:var(--s3)" aria-label="Breadcrumb"><a href="#/shop">Shop</a> / <a href="#/shop/${p.category}">${p.category}</a> / ${esc(p.name)}</nav><div class="pdp"><div class="gal" id="gal">${galHtml()}</div>
<div class="info"><div><p class="eyebrow">${p.category}</p><h1>${esc(p.name)}</h1></div><p class="price">${eur(p.price)}</p><p class="muted">${esc(p.description)}</p><div id="buy-pdp" style="display:grid;gap:var(--s3)">${buyHtml("pdp")}</div>
<div><details open><summary>Materials</summary><p>${esc(p.material)}. Dry clean or hand wash as per the label.</p></details><details><summary>Specifications</summary><ul><li>Reference: VL-${String(p.id).padStart(4, "0")}</li><li>Category: ${p.category}</li><li>Colors: ${p.colors.map((c) => c.n).join(", ")}</li><li>Sizes: ${p.sizes.join(", ")}</li></ul></details><details><summary>Shipping & Returns</summary><p>Complimentary shipping over €500, otherwise €25. Returns within 30 days, unworn with tags (demo policy).</p></details></div></div></div>
<section class="sec" style="padding-top:0">${sectionHead("You may also like", "Related Pieces")}<div class="grid">${ProductService.related(p).map(card).join("")}</div></section></div>${recentlyViewed(p.id)}`; }
function galHtml() { const s = sel.pdp, p = s.p; return `<div class="thumbs">${p.images.map((u, i) => `<button data-act="img" data-v="${i}" aria-current="${i === s.img}" aria-label="View image ${i + 1}"><img src="${u}" alt="" width="80" height="100"></button>`).join("")}</div><div class="main-img"><img src="${p.images[s.img]}" alt="${esc(p.name)} — view ${s.img + 1}" width="640" height="800"></div>`; }
const about = () => `<section class="ab-hero"><div class="tx"><p class="eyebrow">The Maison</p><h1>Made slowly, <em>worn forever</em></h1><p class="muted" style="max-width:44ch">VELORA began with a single conviction: that clothing should be quiet, exact and enduring. We work with small ateliers across Italy and Portugal to make pieces that improve with time.</p></div><div class="ph"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85" alt="A considered wardrobe styled in soft studio light"></div></section>
<section class="sec wrap"><div class="phil rv"><p class="eyebrow">Philosophy</p><h2 style="margin-top:1rem">Fewer pieces. <em>Better</em> made.</h2></div></section>
<section class="edit"><div class="ph"><img src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=85" alt="Close detail of carefully made garments" loading="lazy"></div><div class="tx rv"><p class="eyebrow" style="color:var(--champ)">Craftsmanship & Materials</p><h2>Hands that know the cloth</h2><p style="opacity:.8;max-width:42ch">Mulberry silk, Grade-A cashmere, full-grain leather and European linen — each chosen for hand-feel, longevity and honest origin. Every seam is finished by hand.</p></div></section>
<section class="sec wrap"><div class="vals rv"><div><h3>Timeless</h3><p class="muted">Silhouettes that ignore trends and reward repetition.</p></div><div><h3>Responsible</h3><p class="muted">Traceable materials, limited runs, repairs for life.</p></div><div><h3>Exacting</h3><p class="muted">Every detail is considered, then reduced.</p></div></div></section>${newsletter}`;
const collections = () => `<div class="wrap"><div class="ph-head"><p class="eyebrow">Curated</p><h1>Collections</h1></div><div class="cols collection-grid" style="padding-bottom:var(--s5)"><a class="col" href="#/shop/women"><div class="ph"><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=85" alt="Women's ready-to-wear collection"></div><span>Women</span></a><a class="col" href="#/shop/men"><div class="ph"><img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1100&q=85" alt="Men's ready-to-wear collection"></div><span>Men</span></a><a class="col" href="#/shop/shoes"><div class="ph"><img src="https://images.unsplash.com/photo-1613673720017-56e42d90fee4?auto=format&fit=crop&w=1100&q=85" alt="Leather footwear collection"></div><span>Shoes</span></a><a class="col" href="#/shop/accessories"><div class="ph"><img src="https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=1100&q=85" alt="Leather accessories collection"></div><span>Accessories</span></a></div></div>`;
const notFound = '<div class="wrap empty"><h3>Page not found</h3><a class="btn" href="#/">Return home</a></div>';
const errView = '<div class="wrap empty"><h3>Something went wrong</h3><p class="muted" style="margin-bottom:1.5rem">We could not load this page.</p><button class="btn" data-act="reload">Try again</button></div>';

/* ---------- router ---------- */
let cur = "";
function reveal() { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 }); $$(".rv:not(.in)").forEach((e) => io.observe(e)); }
async function route() {
  const [, a = "", b = ""] = (location.hash.replace(/^#/, "") || "/").split("/"); const app = $("#app"); closeLayers(true);
  app.classList.add("out"); await new Promise((r) => setTimeout(r, matchMedia("(prefers-reduced-motion:reduce)").matches ? 0 : 200));
  let html = "", title = "VELORA", after = null; cur = a || "home";
  try {
    if (!a) html = home();
    else if (a === "shop") { const nw = b === "new"; S.f.cat = ["women", "men"].includes(b) ? b : "all"; S.f.type = b === "shoes" ? "footwear" : b === "accessories" ? "accessory" : "all"; S.f.sort = nw ? "newest" : S.f.sort === "newest" && !nw ? "featured" : S.f.sort; html = shop(); title = S.f.type === "footwear" ? "Shoes" : S.f.type === "accessory" ? "Accessories" : "Shop"; after = updateShop; }
    else if (a === "product") { const p = ProductService.bySlug(b); if (p) { S.recent = [p.id, ...S.recent.filter((id) => id !== p.id)].slice(0, 8); RecentlyViewedService.save(S.recent); sel.pdp = { p, color: 0, size: p.sizes.length === 1 ? p.sizes[0] : null, qty: 1, img: 0 }; html = pdpPage(p); title = p.name; } else html = notFound; }
    else if (a === "wishlist") { html = wishPage(); title = "Wishlist"; } else if (a === "cart") { html = cartPage(); title = "Shopping Bag"; }
    else if (a === "about") { html = about(); title = "About"; } else if (a === "collections") { html = collections(); title = "Collections"; } else html = notFound;
  } catch (e) { console.error(e); html = errView; }
  app.innerHTML = html; document.title = title === "VELORA" ? "VELORA — Contemporary Luxury" : `${title} — VELORA`;
  $$(".nav a").forEach((l) => l.classList.toggle("on", l.getAttribute("href") === location.hash)); $("#mobnav").innerHTML = `<button class="ib" data-act="close" aria-label="Close menu" style="align-self:flex-end">${I.x}</button>` + $$(".nav a").map((l) => `<a href="${l.getAttribute("href")}" data-act="close">${l.textContent}</a>`).join("") + '<a href="#/wishlist" data-act="close" style="font-size:1.2rem">Wishlist</a>';
  window.scrollTo(0, 0); app.classList.remove("out"); if (after) after(); reveal(); app.focus({ preventScroll: true });
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act]"); if (!t) return; const d = t.dataset, a = d.act, s = sel[d.ctx];
  const rebuy = (c) => { $("#buy-" + c).innerHTML = buyHtml(c); };
  switch (a) {
    case "close": closeLayers(); break;
    case "menu": openLayer(L.mob, true); break;
    case "bag": $("#drawer").innerHTML = drawerHtml(); openLayer(L.drawer, true); break;
    case "search": L.search.innerHTML = `<div class="box"><div class="row"><span class="eyebrow">Search</span><button class="ib" data-act="close" aria-label="Close search">${I.x}</button></div><label class="l" for="sq">What are you looking for?</label><input id="sq" type="search" autocomplete="off" placeholder="Coat, silk, trouser…"><div class="sres" id="sres"></div></div>`; openLayer(L.search); break;
    case "account": modal('<h3>Account</h3><p class="muted" style="margin-top:1rem">Accounts and sign-in are outside the scope of this front-end demonstration.</p>', "sm"); break;
    case "info": modal(`<h3>${esc(d.t)}</h3><p class="muted" style="margin-top:1rem">${esc(d.m)}</p>`, "sm"); break;
    case "sizeguide": { const p = sel[d.ctx]?.p; const guide = p?.type === "footwear"
      ? '<h3>Footwear size guide</h3><p class="muted" style="margin-top:.6rem">Approximate foot length, measured heel to toe.</p><table><tr><th>EU</th><th>Foot length (cm)</th></tr><tr><td>36</td><td>23</td></tr><tr><td>37</td><td>23.5</td></tr><tr><td>38</td><td>24</td></tr><tr><td>39</td><td>24.5</td></tr><tr><td>40</td><td>25</td></tr><tr><td>41</td><td>25.5</td></tr><tr><td>42</td><td>26</td></tr><tr><td>43</td><td>26.5</td></tr><tr><td>44</td><td>27</td></tr><tr><td>45</td><td>27.5</td></tr></table>'
      : p?.type === "accessory" ? p.sizes[0] === "One size"
        ? '<h3>One size</h3><p class="muted" style="margin-top:.8rem">This accessory is designed to be worn or carried in a single versatile size.</p>'
        : '<h3>Belt size guide</h3><p class="muted" style="margin-top:.8rem">Choose the length closest to your current belt measurement, from the buckle pin to the hole you use most often.</p>'
      : '<h3>Size guide</h3><table><tr><th>Size</th><th>Chest (cm)</th><th>Waist (cm)</th></tr><tr><td>XS</td><td>82</td><td>64</td></tr><tr><td>S</td><td>88</td><td>70</td></tr><tr><td>M</td><td>94</td><td>76</td></tr><tr><td>L</td><td>100</td><td>82</td></tr><tr><td>XL</td><td>106</td><td>88</td></tr></table>'; modal(guide, "sm"); break; }
    case "wish": { const on = toggleWish(+d.id); toast(on ? "Saved to wishlist" : "Removed from wishlist"); break; }
    case "qv": { const p = ProductService.byId(+d.id); sel.qv = { p, color: 0, size: p.sizes.length === 1 ? p.sizes[0] : null, qty: 1, img: 0 };
      modal(`<div><div class="ph"><img src="${p.images[0]}" alt="${esc(p.name)}"></div></div><div style="display:grid;gap:var(--s3);align-content:start"><div><h2 style="font-size:2.4rem">${esc(p.name)}</h2><p class="price" style="margin-top:.5rem">${eur(p.price)}</p></div><p class="muted">${esc(p.description)}</p><div id="buy-qv" style="display:grid;gap:var(--s3)">${buyHtml("qv")}</div><a class="link" style="justify-self:start" href="#/product/${p.slug}" data-act="close">Full details</a></div>`, "qvw"); break; }
    case "color": s.color = +d.v; rebuy(d.ctx); break;
    case "size": s.size = d.v; s.err = ""; rebuy(d.ctx); break;
    case "qty": s.qty = Math.min(MAX, Math.max(1, s.qty + +d.d)); rebuy(d.ctx); break;
    case "img": s.img = +d.v; $("#gal").innerHTML = galHtml(); break;
    case "add": if (!s.size) { s.err = "Please select a size."; rebuy(d.ctx); break; } addToCart(s.p.id, s.p.colors[s.color].n, s.size, s.qty); toast(`${s.p.name} added to bag`); $("#drawer").innerHTML = drawerHtml(); openLayer(L.drawer, true); break;
    case "cqty": { const i = S.cart.find((x) => keyOf(x) === d.k); if (i) { i.qty = Math.min(MAX, Math.max(1, i.qty + +d.d)); saveCart(); } break; }
    case "rm": S.cart = S.cart.filter((x) => keyOf(x) !== d.k); saveCart(); toast("Removed from bag"); break;
    case "checkout": modal('<h3>Demo checkout</h3><p class="muted" style="margin:1rem 0 1.5rem">This is a front-end demonstration. No payment is taken and no order is placed.</p><button class="btn full" data-act="place">Place demo order</button>', "sm"); break;
    case "place": S.cart = []; saveCart(); closeLayers(); toast("Demo order complete — thank you!"); break;
    case "ftoggle": S.panel = !S.panel; $("#panel").classList.toggle("open", S.panel); t.setAttribute("aria-expanded", S.panel); break;
    case "fsize": case "fcolor": { const k = a === "fsize" ? "sizes" : "colors"; S.f[k] = S.f[k].includes(d.v) ? S.f[k].filter((x) => x !== d.v) : [...S.f[k], d.v]; updateShop(); break; }
    case "clear": Object.assign(S.f, { q: "", sizes: [], colors: [], price: "", avail: false, type: "all" }); $("#fq").value = ""; updateShop(); break;
    case "reload": route(); break;
  }
});
document.addEventListener("change", (e) => { const t = e.target; if (t.id === "sort") S.f.sort = t.value; else if (t.id === "fprice") S.f.price = t.value; else if (t.id === "favail") S.f.avail = t.checked; else return; updateShop(); });
document.addEventListener("input", (e) => { const t = e.target;
  if (t.id === "fq") { S.f.q = t.value; updateShop(); }
  if (t.id === "sq") { const q = t.value.trim().toLowerCase(), r = q ? PRODUCTS.filter((p) => `${p.name} ${p.material} ${p.category} ${p.description}`.toLowerCase().includes(q)).slice(0, 8) : []; $("#sres").innerHTML = q ? (r.length ? r.map((p) => card(p).replace('class="card rv"', 'class="card in"')).join("") : '<p class="muted">No pieces found. Try a material, color or style.</p>') : '<p class="muted">Search by piece, material or category.</p>'; }
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "sq" && e.target.value.trim()) { S.f.q = e.target.value.trim(); closeLayers(true); location.hash === "#/shop" ? route() : (location.hash = "#/shop"); } });
document.addEventListener("submit", (e) => { if (e.target.id !== "nlForm") return; e.preventDefault(); const i = $("#nlEmail"), v = i.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { $("#nlErr").textContent = "Please enter a valid email address."; i.setAttribute("aria-invalid", "true"); i.focus(); return; }
  const subscribers = Store.get("newsletter", []), savedSubscribers = Array.isArray(subscribers) ? subscribers : []; if (!savedSubscribers.includes(v)) Store.set("newsletter", [...savedSubscribers, v]);
  e.target.innerHTML = '<p class="ok" role="status" style="font-family:var(--serif);font-size:1.6rem;width:100%">Thank you — your interest is saved in this demo.</p>'; });
document.addEventListener("click", (e) => { if (e.target.closest("a[href^='#/']") && layer && !e.target.closest("[data-act]")) closeLayers(true); });
window.addEventListener("hashchange", route);

/* ---------- init ---------- */
$("#menuBtn").innerHTML = I.menu; $("#i-search").innerHTML = I.search; $("#i-user").innerHTML = I.user; $("#i-bag").insertAdjacentHTML("afterbegin", I.bag); $("#i-heart").insertAdjacentHTML("afterbegin", I.heart);
$("#drawer").innerHTML = drawerHtml(); badges(); route();
})();
