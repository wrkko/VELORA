/* VELORA — mock data + service layer (swap these services for real APIs later) */
const C = { ivory: { n: "Ivory", h: "#F2EEE6" }, black: { n: "Noir", h: "#171717" }, char: { n: "Charcoal", h: "#292929" },
  champ: { n: "Champagne", h: "#B9A88A" }, beige: { n: "Beige", h: "#D8D0C4" }, brown: { n: "Cocoa", h: "#6B5A45" }, taupe: { n: "Taupe", h: "#8A7F6E" }, burgundy: { n: "Oxblood", h: "#542B32" }, olive: { n: "Olive", h: "#66634D" } };
const WS = ["XS", "S", "M", "L"], MS = ["S", "M", "L", "XL"], ONE = ["One size"], WSHOE = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41"], MSHOE = ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=88`;
// Photographer-shot Unsplash images are selected by garment or product type for a tighter art direction.
const PRODUCT_IMAGES = {
  1: ["photo-1539109136881-3be0616acf4b", "photo-1529139574466-a303027c1d8b"],
  2: ["photo-1523297467724-f6758d7124c5", "photo-1591047139829-d91aecb6caea"],
  3: ["photo-1594633312681-425c7b97ccd1", "photo-1515886657613-9f3515b0c78f"],
  4: ["photo-1576566588028-4147f3842f27", "photo-1620799140408-edc6dcb6d633"],
  5: ["photo-1617137968427-85924c800a22", "photo-1680614121680-b9a187c48832"],
  6: ["photo-1603252109303-2751441dd157", "photo-1521330784804-5f69f8a17b1d"],
  7: ["photo-1515886657613-9f3515b0c78f", "photo-1539109136881-3be0616acf4b"],
  8: ["photo-1598532163257-ae3c6b2524b6", "photo-1657603334984-65dff4699d76"],
  9: ["photo-1764593008609-f14c9e4edfa1", "photo-1617137968427-85924c800a22"],
  10: ["photo-1444808134024-5d3ae88d0798", "photo-1467493330285-2fe6a9f97483"],
  11: ["photo-1732842430197-0ecd55fe98ea", "photo-1680614121680-b9a187c48832"],
  12: ["photo-1603252109303-2751441dd157", "photo-1521330784804-5f69f8a17b1d"],
  13: ["photo-1613673720017-56e42d90fee4", "photo-1539109136881-3be0616acf4b"],
  14: ["photo-1630170580005-ffd56323fa56", "photo-1734834753289-ba743a04f069"],
  15: ["photo-1525966222134-fcfa99b8ae77", "photo-1608231387042-66d1773070a5"],
  16: ["photo-1615979474401-8a6a344de5bd", "photo-1777987601447-266e128de448"],
  17: ["photo-1525966222134-fcfa99b8ae77", "photo-1595341888016-a392ef81b7de"],
  18: ["photo-1613673720017-56e42d90fee4", "photo-1467493330285-2fe6a9f97483"],
  19: ["photo-1598532163257-ae3c6b2524b6", "photo-1657603334984-65dff4699d76"],
  20: ["photo-1527167598984-8802d8028eea", "photo-1539109136881-3be0616acf4b"],
  21: ["photo-1684510334550-0c4fa8aaffd1", "photo-1664286074176-5206ee5dc878"],
  22: ["photo-1511499767150-a48a237f0083", "photo-1732842430197-0ecd55fe98ea"],
  23: ["photo-1598532163257-ae3c6b2524b6", "photo-1657603334984-65dff4699d76"],
};
const mk = (id, slug, name, category, price, colors, sizes, material, date, featured, stock, description, type = "apparel") => ({
  id, slug, name, category, type, price, colors, sizes, material, createdAt: date, featured, inStock: stock, description,
  images: PRODUCT_IMAGES[id].map(photo),
});
const PRODUCTS = [
  mk(1, "silk-slip-dress", "Silk Slip Dress", "women", 890, [C.champ, C.black], WS, "100% mulberry silk", "2026-10-28", true, true, "A bias-cut slip dress that skims the body and moves like water. Finished with hand-rolled hems."),
  mk(2, "wool-column-coat", "Wool Column Coat", "women", 1650, [C.char, C.beige], WS, "100% virgin wool, silk lining", "2026-11-02", true, true, "An uncompromising line in double-faced wool. Concealed closure, sharp shoulder, long and quiet."),
  mk(3, "tailored-trouser", "Tailored Trouser", "women", 540, [C.black, C.taupe], WS, "98% wool, 2% elastane", "2026-09-15", false, true, "High-waisted with a single pleat and a clean, straight leg."),
  mk(4, "cashmere-knit", "Cashmere Knit", "women", 720, [C.beige, C.ivory, C.char], WS, "100% Grade-A cashmere", "2026-10-10", true, true, "Spun in Mongolia, knitted in Italy. Weightless warmth with a relaxed shoulder."),
  mk(5, "structured-blazer", "Structured Blazer", "men", 1280, [C.taupe, C.black], MS, "Wool and mohair blend", "2026-10-20", true, true, "Half-canvas construction, soft shoulder, and a precisely cut lapel."),
  mk(6, "poplin-shirt", "Poplin Shirt", "men", 310, [C.ivory, C.beige], MS, "100% Egyptian cotton", "2026-08-30", false, true, "Crisp, close-woven poplin with mother-of-pearl buttons."),
  mk(7, "pleated-midi-skirt", "Pleated Midi Skirt", "women", 620, [C.char, C.champ], WS, "Wool crepe", "2026-11-05", false, false, "Knife pleats that hold their shape. Currently sold out — join the waitlist soon."),
  mk(8, "leather-tote", "Leather Tote", "women", 1450, [C.brown, C.black], ONE, "Full-grain Italian calf leather", "2026-07-12", true, true, "Unlined, unstructured, made to soften with age."),
  mk(9, "linen-overshirt", "Linen Overshirt", "men", 420, [C.beige, C.taupe], MS, "100% European linen", "2026-09-02", false, true, "A relaxed layering piece, washed for a lived-in hand."),
  mk(10, "wide-leg-wool-trouser", "Wide-Leg Wool Trouser", "men", 590, [C.char, C.black], MS, "Wool gabardine", "2026-10-01", true, true, "Generous through the leg, cut with a deep break for effortless drape."),
  mk(11, "belted-trench", "Belted Trench", "men", 1380, [C.champ, C.char], MS, "Water-repellent cotton gabardine", "2026-11-07", true, true, "Our reduced trench: no epaulettes, no excess, only proportion."),
  mk(12, "merino-polo", "Merino Polo", "men", 380, [C.ivory, C.char], MS, "Extra-fine merino wool", "2026-08-18", false, true, "Fine-gauge knit with a soft collar that sits flat all day."),
  mk(13, "suede-ankle-boot", "Suede Ankle Boot", "women", 980, [C.brown, C.black], WSHOE, "Italian suede, leather lining", "2026-11-09", true, true, "A clean, close-fitting ankle boot with a softly squared toe and a balanced leather heel.", "footwear"),
  mk(14, "sculpted-slingback", "Sculpted Slingback", "women", 760, [C.black, C.brown], WSHOE, "Calf leather upper, leather sole", "2026-11-08", true, true, "A precise open-back silhouette with a low sculpted heel for evening and day.", "footwear"),
  mk(15, "court-leather-sneaker", "Court Leather Sneaker", "women", 620, [C.ivory, C.beige], WSHOE, "Calf leather, recycled cotton lining", "2026-11-06", false, true, "A pared-back court sneaker with tonal stitching and a flexible cup sole.", "footwear"),
  mk(16, "leather-penny-loafer", "Leather Penny Loafer", "men", 920, [C.brown, C.black], MSHOE, "Hand-polished calf leather", "2026-11-09", true, true, "A softly structured penny loafer, hand-finished with a flexible leather sole.", "footwear"),
  mk(17, "minimal-leather-sneaker", "Minimal Leather Sneaker", "men", 680, [C.ivory, C.char], MSHOE, "Nappa leather, leather lining", "2026-11-07", true, true, "A low-profile leather sneaker designed to sit quietly with tailoring and denim.", "footwear"),
  mk(18, "city-lace-up-boot", "City Lace-Up Boot", "men", 890, [C.black, C.brown], MSHOE, "Full-grain calf leather", "2026-11-04", false, true, "A refined lace-up boot with a rounded last and a durable stitched sole.", "footwear"),
  mk(19, "soft-structure-shoulder-bag", "Soft Structure Shoulder Bag", "women", 1280, [C.brown, C.black], ONE, "Pebbled Italian calf leather", "2026-11-08", true, true, "A supple everyday shoulder bag with a compact profile and considered metal detailing.", "accessory"),
  mk(20, "silk-twill-scarf", "Silk Twill Scarf", "women", 290, [C.olive, C.champ], ONE, "100% printed silk twill", "2026-11-06", false, true, "A fluid square of silk twill, finished with a hand-rolled edge.", "accessory"),
  mk(21, "reversible-leather-belt", "Reversible Leather Belt", "men", 380, [C.black, C.brown], ["80 cm", "85 cm", "90 cm", "95 cm", "100 cm"], "Italian calf leather", "2026-11-03", false, true, "A slim reversible belt with brushed hardware and a clean, unbranded finish.", "accessory"),
  mk(22, "acetate-sunglasses", "Sculpted Acetate Sunglasses", "women", 420, [C.black, C.brown], ONE, "Italian acetate, UV400 lenses", "2026-11-01", false, true, "A refined acetate frame with softly rounded corners and category 3 UV protection.", "accessory"),
  mk(23, "leather-weekender", "Leather Weekender", "men", 1850, [C.brown, C.black], ONE, "Full-grain Italian calf leather", "2026-10-30", true, true, "A generous weekender with hand-finished handles, a detachable strap and a natural cotton lining.", "accessory"),
];

/* Storage wrapper — the only place localStorage is touched */
const Store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("velora:" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("velora:" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

const ProductService = {
  all: () => Promise.resolve(PRODUCTS),
  bySlug: (s) => PRODUCTS.find((p) => p.slug === s),
  byId: (id) => PRODUCTS.find((p) => p.id === id),
  related: (p, n = 4) => {
    const sameType = PRODUCTS.filter((x) => x.id !== p.id && x.type === p.type && x.category === p.category);
    return [...sameType, ...PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category && x.type !== p.type)].slice(0, n);
  },
};

const CartService = {
  load: () => Store.get("cart", []),
  save: (items) => Store.set("cart", items),
};
const WishlistService = {
  load: () => Store.get("wishlist", []),
  save: (ids) => Store.set("wishlist", ids),
};
const RecentlyViewedService = {
  load: () => Store.get("recentlyViewed", []),
  save: (ids) => Store.set("recentlyViewed", ids),
};
