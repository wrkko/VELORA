# VELORA — luxury fashion storefront (static front-end demo)

## Run
Open `index.html` in a browser, or serve this folder locally with `python -m http.server 8000` and visit http://localhost:8000. There is no build step or package installation.
Fonts (Cormorant Garamond, Inter) and editorial photography load from Google Fonts and Unsplash. Without an internet connection, the page uses fallback fonts and remote photos may not appear.

## Structure
- `index.html` – shell (header, drawer, overlays, footer)
- `style.css` – design tokens (`:root`) + all styles, breakpoints 1280 / 1160 / 900 / 480
- `data.js` – 23 product records + `ProductService`, `CartService`, `WishlistService`, `RecentlyViewedService`, `Store` (the only place that touches localStorage)
- `app.js` – hash router, cart, wishlist, filters, search, Quick View, drawer, and modals
- Product and campaign photography – curated remote Unsplash images

## Routes
`#/`, `#/shop`, `#/shop/women`, `#/shop/men`, `#/shop/shoes`, `#/shop/accessories`, `#/shop/new`, `#/product/:slug`, `#/wishlist`, `#/cart`, `#/about`, `#/collections`

## Storefront features
- Combined category, size, color, price, availability, search, and sort controls across apparel, footwear, and accessories.
- Product detail gallery, Quick View, related products, wishlist, and recently viewed pieces.
- Variant-aware cart, persistent wishlist and cart, shipping threshold feedback, and a clearly labelled demo checkout.
- Keyboard-operable dialogs, focus states, reduced-motion support, and responsive desktop/mobile layouts.
- Newsletter interest is stored locally in this browser only; no email is sent.

## Decisions & limitations
- This folder is implemented as a static vanilla HTML/CSS/JS storefront, rather than the React/TypeScript/Vite stack in the brief. The current app does not require a build system.
- Campaign and product photography is loaded from Unsplash, so an internet connection is needed to display it.
- Color swatches change the selected color but not the image.
- Wishlist items are added to the bag through Quick View (a size must be chosen).
- Checkout is a clearly labelled demo; no payment or accounts exist.
- This refinement was checked for JavaScript parse errors and missing local script/image paths. A full interactive browser test across viewports could not be completed in the available environment.
