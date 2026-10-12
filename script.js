// ==========================================
// CONFIGURABLE CHECKOUT & APP SETTINGS
// ==========================================
const PAWSON_CONFIG = {
    // Orders switch: keep false while pre-launch, switch to true to open checkout
    ORDERS_ENABLED: true,

    // Auth system settings
    AUTH: {
        USE_DEMO: true,               // Set to false once Firebase keys are connected
        MIN_PASSWORD_LENGTH: 8,
        STORAGE_KEY_SESSION: 'pawson_active_session',
        STORAGE_KEY_DEMO_USERS: 'pawson_demo_vault_v1', // Stores salted SHA-256 hashes only!
        FIREBASE_CONFIG: {
            apiKey: "YOUR_FIREBASE_API_KEY",
            authDomain: "YOUR_PROJECT.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID"
        }
    }
};

// FIX: was 6000. Now exactly 5 seconds to match the progress bar (animate-progress-5s)
const CHECKOUT_LOADING_DURATION = 5000;
const CHECKOUT_GIF_PATH = 'assets/dog chasing tail.gif';

// Preload Checkout Loading GIF Asset
(function preloadCheckoutGif() {
    try {
        const gifPreloader = new Image();
        gifPreloader.src = encodeURI(CHECKOUT_GIF_PATH);
    } catch (e) {
        console.warn('GIF preloader could not start');
    }
})();

// ==========================================
// CART STATE (localStorage)
// ==========================================
function getCartItems() {
    try {
        const parsed = JSON.parse(localStorage.getItem('pawson_cart_items') || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveCartItems(items) {
    try {
        localStorage.setItem('pawson_cart_items', JSON.stringify(items));
        const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        localStorage.setItem('pawson_cart_count', totalCount.toString());
    } catch (e) {
        console.warn('Could not save cart:', e);
    }
    updateCartUI();
}

function getCartCount() {
    const items = getCartItems();
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

function updateCartUI() {
    const cartElement = document.getElementById('cart-count');
    if (cartElement) {
        cartElement.innerText = getCartCount();
    }
}

// FIX: initAuthPage() was called but never defined, which crashed this handler
// and stopped renderCartPage() / renderFAQAccordion() / initBackToTop() from running.
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    updateAuthUI();
    initAuthPage();
    renderCartPage();      // null-checks internally, safe on every page
    renderFAQAccordion();  // null-checks internally, safe on every page
    initBackToTop();
});

// ==========================================
// SAFE REDIRECT HELPERS (login page)
// ==========================================

// Only allow redirects to .html pages on this same site (prevents open redirects)
function getSafeRedirect(fallback = 'index.html') {
    const param = new URLSearchParams(window.location.search).get('redirect');
    if (param && /^[a-z0-9_-]+\.html$/i.test(param) && param !== 'login.html') {
        return param;
    }
    try {
        const ref = new URL(document.referrer);
        const page = ref.pathname.split('/').pop();
        if (ref.origin === window.location.origin && /^[a-z0-9_-]+\.html$/i.test(page) && page !== 'login.html') {
            return page;
        }
    } catch (e) { /* no referrer */ }
    return fallback;
}

function redirectAfterAuth() {
    window.location.href = getSafeRedirect();
}

function initAuthPage() {
    if (!document.getElementById('auth-login-form')) return; // not the login page
    if (getActiveAuthSession()) {                            // already logged in
        redirectAfterAuth();
        return;
    }
    if (new URLSearchParams(window.location.search).get('tab') === 'signup') {
        switchAuthTab('signup');
    }
}

// "Go Back to Top" Button System
function initBackToTop() {
    const backToTopBtns = document.querySelectorAll('#back-to-top, .back-to-top-btn');
    backToTopBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

// ==========================================
// PRODUCT CARDS: SIZE & COLOR
// ==========================================

// Interactive Size Selection on Product Cards
function selectProductSize(pillBtn, size) {
    const container = pillBtn.closest('.size-picker') || pillBtn.parentElement;
    if (!container) return;

    // Reset sibling pill styles
    const pills = container.querySelectorAll('.size-pill');
    pills.forEach(p => {
        p.classList.remove('bg-brand-red', 'text-white');
        p.classList.add('bg-brand-cream', 'text-brand-black');
    });

    // Set clicked pill active style
    pillBtn.classList.remove('bg-brand-cream', 'text-brand-black');
    pillBtn.classList.add('bg-brand-red', 'text-white');

    // Store selected size attribute on closest product card
    const card = pillBtn.closest('.group') || pillBtn.closest('[data-product-card]');
    if (card) {
        card.setAttribute('data-selected-size', size);
    }
}

// Data-driven product color configuration
const COLLARS_LEASHES_DATA = [
    {
        id: "collar-1",
        name: "Tactical Cobra-Buckle Collar",
        price: 45.00,
        badge: "TACTICAL",
        tags: ["HEAVY DUTY", "COBRA BUCKLE"],
        colors: [
            { id: "violet", name: "Violet", hex: "#8b5cf6", image: "assets/designs/collar 1.png", inStock: true },
            { id: "green", name: "Green", hex: "#22c55e", image: "assets/designs/collar 2.png", inStock: true },
            { id: "blue", name: "Blue", hex: "#3b82f6", image: "assets/designs/collar 3.png", inStock: true },
            { id: "pink", name: "Pink", hex: "#ec4899", image: "assets/designs/collar 4.png", inStock: true },
            { id: "orange", name: "Orange", hex: "#f97316", image: "assets/designs/collar 5.png", inStock: true }
        ]
    },
    {
        id: "leash-1",
        name: "Hands-Free Rope Leash",
        price: 55.00,
        tags: ["6 FT", "ADJUSTABLE"],
        colors: [
            { id: "violet", name: "Violet", hex: "#8b5cf6", image: "assets/designs/leash 1.png", inStock: true },
            { id: "green", name: "Green", hex: "#22c55e", image: "assets/designs/leash 2.png", inStock: true },
            { id: "blue", name: "Blue", hex: "#3b82f6", image: "assets/designs/leash 3.png", inStock: true },
            { id: "pink", name: "Pink", hex: "#ec4899", image: "assets/designs/leash 4.png", inStock: true },
            { id: "orange", name: "Orange", hex: "#f97316", image: "assets/designs/leash 5.png", inStock: true }
        ]
    }
];

// Interactive Color Selection on Product Cards
function selectProductColor(swatchBtn, colorName, colorImgSrc) {
    if (swatchBtn.hasAttribute('disabled') || swatchBtn.classList.contains('out-of-stock')) return;

    const card = swatchBtn.closest('.group') || swatchBtn.closest('[data-product-card]');
    if (!card) return;

    const container = swatchBtn.closest('[role="radiogroup"]') || swatchBtn.parentElement;

    // Reset sibling swatches
    const swatches = container.querySelectorAll('.color-swatch');
    swatches.forEach(sw => {
        sw.classList.remove('active');
        sw.setAttribute('aria-checked', 'false');
        const checkIcon = sw.querySelector('.check-icon');
        if (checkIcon) checkIcon.classList.add('hidden');
    });

    // Set clicked swatch active
    swatchBtn.classList.add('active');
    swatchBtn.setAttribute('aria-checked', 'true');
    const checkIcon = swatchBtn.querySelector('.check-icon');
    if (checkIcon) checkIcon.classList.remove('hidden');

    // Update color label
    const label = card.querySelector('.color-label');
    if (label) {
        label.innerText = colorName.toUpperCase();
    }

    // Update main image smoothly
    const mainImg = card.querySelector('.product-main-img') || card.querySelector('img');
    if (mainImg && colorImgSrc) {
        mainImg.style.opacity = '0.3';
        setTimeout(() => {
            mainImg.src = colorImgSrc;
            mainImg.style.opacity = '1';
        }, 120);
    }

    // Save selected state on card dataset
    card.setAttribute('data-selected-color', colorName);
    card.setAttribute('data-selected-color-image', colorImgSrc);
}

// Hover Preview (Desktop)
function previewProductColor(swatchBtn, colorImgSrc) {
    if (swatchBtn.hasAttribute('disabled') || swatchBtn.classList.contains('out-of-stock')) return;

    const card = swatchBtn.closest('.group') || swatchBtn.closest('[data-product-card]');
    if (!card) return;

    const mainImg = card.querySelector('.product-main-img') || card.querySelector('img');
    if (mainImg && colorImgSrc) {
        mainImg.src = colorImgSrc;
    }
}

// Reset Image on Mouse Leave
function resetProductColor(swatchBtn) {
    const card = swatchBtn.closest('.group') || swatchBtn.closest('[data-product-card]');
    if (!card) return;

    const mainImg = card.querySelector('.product-main-img') || card.querySelector('img');
    const activeColorImg = card.getAttribute('data-selected-color-image') || card.getAttribute('data-initial-image');

    if (mainImg && activeColorImg) {
        mainImg.src = activeColorImg;
    }
}

// Toggle On-Model Preview on Product Cards
function toggleModelPreview(containerElement, modelSrc, flatSrc) {
    if (!containerElement) return;
    const imgElement = containerElement.querySelector('img');
    const badgeElement = containerElement.querySelector('.model-badge');
    if (!imgElement) return;

    const isCurrentlyModel = containerElement.getAttribute('data-is-model') === 'true';

    if (isCurrentlyModel) {
        imgElement.src = flatSrc;
        containerElement.setAttribute('data-is-model', 'false');
        if (badgeElement) {
            badgeElement.innerText = 'VIEW ON MODEL';
        }
    } else {
        imgElement.src = modelSrc;
        containerElement.setAttribute('data-is-model', 'true');
        if (badgeElement) {
            badgeElement.innerText = 'VIEW SHIRT';
        }
    }
}

// ==========================================
// SIZING & FIT GUIDE MODAL
// ==========================================
function renderSizeGuideModal() {
    if (document.getElementById('size-guide-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'size-guide-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-brand-black/80 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300 overflow-y-auto';

    modal.innerHTML = `
        <div class="relative w-full max-w-4xl bg-brand-cream border-4 border-brand-black shadow-brutal my-auto p-5 sm:p-8 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <!-- Header -->
            <div class="flex justify-between items-start border-b-4 border-brand-black pb-4 mb-6">
                <div>
                    <span class="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">PAWSON WEAR FIT MANUAL</span>
                    <h2 class="font-display text-3xl sm:text-5xl uppercase text-brand-black leading-none mt-1">Sizing & Fit Guide</h2>
                </div>
                <button onclick="closeSizeGuide()" aria-label="Close Size Guide" class="min-h-[44px] min-w-[44px] p-2 border-3 border-brand-black bg-white hover:bg-brand-red hover:text-white transition-colors font-mono font-bold text-base shadow-brutal-sm">
                    [X]
                </button>
            </div>

            <!-- Size Scale Cards (Static Display) -->
            <div class="grid grid-cols-5 gap-2 sm:gap-4 mb-6 text-center">
                <div class="border-2 border-brand-black p-2 sm:p-3 bg-white text-brand-black">
                    <div class="h-12 sm:h-16 flex items-center justify-center mb-1 overflow-hidden">
                        <img src="assets/xs.png" alt="XS Dog Size" class="max-h-full max-w-full object-contain" />
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">XS</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 11 lbs</span>
                </div>

                <div class="border-2 border-brand-black p-2 sm:p-3 bg-white text-brand-black">
                    <div class="h-12 sm:h-16 flex items-center justify-center mb-1 overflow-hidden">
                        <img src="assets/s.png" alt="S Dog Size" class="max-h-full max-w-full object-contain" />
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">S</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 15 lbs</span>
                </div>

                <div class="border-2 border-brand-black p-2 sm:p-3 bg-white text-brand-black">
                    <div class="h-12 sm:h-16 flex items-center justify-center mb-1 overflow-hidden">
                        <img src="assets/m.png" alt="M Dog Size" class="max-h-full max-w-full object-contain" />
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">M</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 23 lbs</span>
                </div>

                <div class="border-2 border-brand-black p-2 sm:p-3 bg-white text-brand-black">
                    <div class="h-12 sm:h-16 flex items-center justify-center mb-1 overflow-hidden">
                        <img src="assets/l.png" alt="L Dog Size" class="max-h-full max-w-full object-contain" />
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">L</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 35 lbs</span>
                </div>

                <div class="border-2 border-brand-black p-2 sm:p-3 bg-white text-brand-black">
                    <div class="h-12 sm:h-16 flex items-center justify-center mb-1 overflow-hidden">
                        <img src="assets/xl.png" alt="XL Dog Size" class="max-h-full max-w-full object-contain" />
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">XL</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 45 lbs</span>
                </div>
            </div>

            <!-- Measurement Specs Table -->
            <div class="overflow-x-auto border-3 border-brand-black bg-white shadow-brutal-sm mb-6">
                <table class="w-full text-left font-mono text-xs sm:text-sm border-collapse">
                    <thead>
                        <tr class="bg-brand-black text-brand-cream font-sans uppercase">
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black font-bold">MEASUREMENT</th>
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold">XS</th>
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold">S</th>
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold">M</th>
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold">L</th>
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-brand-black text-center font-bold">XL</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y-2 divide-brand-black/20">
                        <tr>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black font-bold uppercase bg-brand-cream/50">WEIGHT</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">Up to 11 lbs</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">Up to 15 lbs</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">Up to 23 lbs</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">Up to 35 lbs</td>
                            <td class="p-2.5 sm:p-3.5 text-center">Up to 45 lbs</td>
                        </tr>
                        <tr>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black font-bold uppercase bg-brand-cream/50">BACK LENGTH</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">9 - 12"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">11 - 16"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">15 - 18"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">16 - 20"</td>
                            <td class="p-2.5 sm:p-3.5 text-center">20 - 24"</td>
                        </tr>
                        <tr>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black font-bold uppercase bg-brand-cream/50">GIRTH (CHEST)</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">13 - 17"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">14 - 18"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">18 - 22"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">20 - 24"</td>
                            <td class="p-2.5 sm:p-3.5 text-center">22 - 28"</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- "How to Measure" Visual Diagram -->
            <div class="border-3 border-brand-black p-5 sm:p-6 bg-white shadow-brutal-sm">
                <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div class="md:w-1/2 w-full">
                        <span class="font-mono text-xs font-bold text-brand-red">ACCURACY CHECK</span>
                        <h3 class="font-display text-2xl sm:text-3xl uppercase mb-3">How to Measure</h3>
                        <div class="space-y-2.5 font-sans text-sm">
                            <div class="p-3 border-2 border-brand-black bg-brand-cream">
                                <span class="font-bold text-brand-red uppercase font-mono block text-xs mb-0.5">1. Back Length</span>
                                <p class="text-xs font-mono">Measure along your dog's spine from the base of the neck to the base of the tail.</p>
                            </div>
                            <div class="p-3 border-2 border-brand-black bg-brand-cream">
                                <span class="font-bold text-brand-red uppercase font-mono block text-xs mb-0.5">2. Girth (Chest)</span>
                                <p class="text-xs font-mono">Measure around the widest part of your dog's chest, right behind the front legs.</p>
                            </div>
                        </div>
                        <div class="mt-3 p-3 bg-brand-black text-white font-mono text-xs border-2 border-brand-black">
                            <span class="text-brand-red font-bold">FIT ADVICE:</span> If your dog's measurements fall between sizes, select the larger size for a boxy streetwear drape.
                        </div>
                    </div>

                    <!-- Custom Measurement Image -->
                    <div class="md:w-1/2 w-full border-3 border-brand-black bg-brand-cream p-4 flex flex-col items-center justify-center relative">
                        <img src="assets/measurement.png" alt="Pawson Wear Measurement Guide: Back Length and Girth" class="w-full h-auto max-h-[250px] object-contain" />
                        <span class="font-mono text-[10px] text-brand-black/80 font-bold mt-2 uppercase tracking-wide">// PAWSON WEAR ANATOMICAL FIT DIAGRAM</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSizeGuide();
    });

    document.body.appendChild(modal);
}

function openSizeGuide() {
    renderSizeGuideModal();
    const modal = document.getElementById('size-guide-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }, 10);
    document.body.classList.add('overflow-hidden');
}

function closeSizeGuide() {
    const modal = document.getElementById('size-guide-modal');
    if (!modal) return;

    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }, 300);
}

function highlightGuideSize(targetSize) {
    // Sizing guide is static as-is
}

// Close Size Guide Modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('size-guide-modal');
        if (modal && !modal.classList.contains('hidden')) {
            closeSizeGuide();
        }
    }
});

// ==========================================
// ADD TO CART
// ==========================================

// Add to Cart from Card helper
function addToCartFromCard(addBtn, productName, price, imageSrc) {
    const card = addBtn.closest('.group') || addBtn.closest('[data-product-card]');
    let chosenSize = null;
    let chosenColor = null;
    let activeImage = imageSrc;

    if (card) {
        chosenSize = card.getAttribute('data-selected-size');
        chosenColor = card.getAttribute('data-selected-color');

        // Fallback size check
        if (!chosenSize) {
            const activePill = card.querySelector('.size-pill.bg-brand-red');
            if (activePill) {
                chosenSize = activePill.innerText.trim();
            }
        }

        // Fallback color check
        if (!chosenColor) {
            const activeSwatch = card.querySelector('.color-swatch.active');
            if (activeSwatch) {
                chosenColor = activeSwatch.getAttribute('data-color-name');
            }
        }

        const imgEl = card.querySelector('.product-main-img') || card.querySelector('img');
        if (imgEl && imgEl.getAttribute('src')) {
            activeImage = imgEl.getAttribute('src');
        }
    }

    addToCart(productName, price, activeImage, chosenSize, chosenColor);
}

// General Add to Cart Logic
function addToCart(productName, price, imageSrc, size, color) {
    const items = getCartItems();
    const itemSize = size || null;
    const itemColor = color || null;

    // Compare name, size, AND color
    const existingIndex = items.findIndex(item =>
        item.name === productName &&
        item.size === itemSize &&
        item.color === itemColor
    );

    if (existingIndex > -1) {
        items[existingIndex].quantity = (items[existingIndex].quantity || 1) + 1;
    } else {
        const fallbackImg = imageSrc || 'assets/designs/collar 1.png';
        items.push({
            name: productName,
            price: parseFloat(price) || 0,
            image: fallbackImg,
            size: itemSize,
            color: itemColor,
            quantity: 1
        });
    }

    saveCartItems(items);

    // Pulse animation on cart badge if present
    const cartElement = document.getElementById('cart-count');
    if (cartElement && cartElement.parentElement) {
        cartElement.parentElement.classList.add('scale-110', 'bg-brand-red', 'text-white');
        setTimeout(() => {
            cartElement.parentElement.classList.remove('scale-110', 'bg-brand-red', 'text-white');
        }, 200);
    }

    const sizeMsg = itemSize ? ` (Size: ${escapeHTML(itemSize)})` : '';
    const colorMsg = itemColor ? ` [Color: ${escapeHTML(itemColor)}]` : '';
    showToast(`+1 ${escapeHTML(productName)}${colorMsg}${sizeMsg} added to cart.`, 'success');
}

// ==========================================
// MOBILE DRAWER
// ==========================================
const menuToggle = document.getElementById('mobile-menu-toggle');
const drawer = document.getElementById('mobile-drawer');
const backdrop = document.getElementById('mobile-drawer-backdrop');
const drawerClose = document.getElementById('mobile-drawer-close');
const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

function openDrawer() {
    if (!drawer || !backdrop || !menuToggle) return;
    drawer.classList.add('open');
    backdrop.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden');
    if (drawerClose) drawerClose.focus();
}

function closeDrawer() {
    if (!drawer || !backdrop || !menuToggle) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
    menuToggle.focus();
}

if (menuToggle && drawer) {
    menuToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
}

// ==========================================
// TOAST (Brutalist style)
// ==========================================
// NOTE: `message` is inserted as HTML. Escape any user-provided text with escapeHTML() first.
function showToast(message, type = 'default') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `
        flex items-center justify-between p-4 border-4 border-brand-black font-mono font-bold text-sm transform transition-all duration-300 translate-x-full opacity-0
        ${type === 'success' ? 'bg-[#a3e635] text-brand-black' : 'bg-brand-black text-white'}
    `;

    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:text-brand-red pointer-events-auto" aria-label="Close Toast">
            [X]
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// CART PAGE
// ==========================================
function renderCartPage() {
    const cartItemsContainer = document.getElementById('cart-items-list');
    const emptyCartMsg = document.getElementById('empty-cart-view');
    const cartContent = document.getElementById('cart-active-view');
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');

    if (!cartItemsContainer) return; // not the cart page

    const items = getCartItems();

    if (items.length === 0) {
        if (emptyCartMsg) emptyCartMsg.classList.remove('hidden');
        if (cartContent) cartContent.classList.add('hidden');
        return;
    }

    if (emptyCartMsg) emptyCartMsg.classList.add('hidden');
    if (cartContent) cartContent.classList.remove('hidden');

    let html = '';
    let subtotal = 0;

    items.forEach((item, index) => {
        const price = Number(item.price) || 0;
        const qty = item.quantity || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;

        // FIX: escape everything that comes from localStorage before inserting as HTML
        const safeName = escapeHTML(String(item.name || ''));
        const safeImage = escapeHTML(String(item.image || ''));
        const safeSize = item.size ? escapeHTML(String(item.size)) : '';
        const safeColor = item.color ? escapeHTML(String(item.color)) : '';

        const sizeBadge = safeSize ? `<span class="bg-brand-black text-white text-[11px] font-mono font-bold px-2 py-0.5 border border-brand-black">SIZE: ${safeSize}</span>` : '';
        const colorBadge = safeColor ? `<span class="bg-brand-red text-white text-[11px] font-mono font-bold px-2 py-0.5 border border-brand-black uppercase">COLOR: ${safeColor}</span>` : '';

        html += `
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border-3 border-brand-black shadow-brutal-sm gap-4 mb-4">
                <div class="flex items-center gap-4">
                    <img src="${safeImage}" alt="${safeName}" class="w-20 h-20 object-cover border-2 border-brand-black shrink-0">
                    <div>
                        <h4 class="font-sans font-bold text-xl uppercase leading-tight mb-1">${safeName}</h4>
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="font-mono text-sm text-brand-red font-bold">₱${price.toFixed(2)} each</span>
                            ${sizeBadge}
                            ${colorBadge}
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between w-full sm:w-auto gap-6 border-t-2 sm:border-t-0 border-brand-black pt-3 sm:pt-0">
                    <div class="flex items-center border-2 border-brand-black bg-brand-cream">
                        <button onclick="updateCartQuantity(${index}, -1)" aria-label="Decrease quantity" class="w-8 h-8 font-mono font-bold hover:bg-brand-black hover:text-white transition-colors">-</button>
                        <span class="w-10 text-center font-mono font-bold text-sm">${qty}</span>
                        <button onclick="updateCartQuantity(${index}, 1)" aria-label="Increase quantity" class="w-8 h-8 font-mono font-bold hover:bg-brand-black hover:text-white transition-colors">+</button>
                    </div>

                    <div class="font-mono font-bold text-lg min-w-[70px] text-right">
                        ₱${itemTotal.toFixed(2)}
                    </div>

                    <button onclick="removeCartItem(${index})" aria-label="Remove item" class="min-h-[44px] min-w-[44px] p-2 border-2 border-brand-black bg-brand-cream text-brand-black hover:bg-brand-red hover:text-white transition-colors font-mono font-bold text-xs">
                        [X]
                    </button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;

    const shipping = 100.00;
    const total = subtotal + shipping;

    if (subtotalElement) subtotalElement.innerText = `₱${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.innerText = `₱${total.toFixed(2)}`;

    // Sync checkout button states based on PAWSON_CONFIG.ORDERS_ENABLED
    const disabledOrderBtn = document.getElementById('disabled-orders-btn');
    const activeOrderBtn = document.getElementById('active-orders-btn');
    if (disabledOrderBtn && activeOrderBtn) {
        if (PAWSON_CONFIG.ORDERS_ENABLED) {
            disabledOrderBtn.classList.add('hidden');
            activeOrderBtn.classList.remove('hidden');
        } else {
            disabledOrderBtn.classList.remove('hidden');
            activeOrderBtn.classList.add('hidden');
        }
    }
}

function updateCartQuantity(index, delta) {
    const items = getCartItems();
    if (items[index]) {
        items[index].quantity = (items[index].quantity || 1) + delta;
        if (items[index].quantity <= 0) {
            items.splice(index, 1);
        }
        saveCartItems(items);
        renderCartPage();
    }
}

function removeCartItem(index) {
    const items = getCartItems();
    if (items[index]) {
        showToast(`Removed ${escapeHTML(String(items[index].name || 'item'))} from cart.`);
        items.splice(index, 1);
        saveCartItems(items);
        renderCartPage();
    }
}

// ==========================================
// DATA-DRIVEN FAQ ACCORDION SYSTEM
// ==========================================
const FAQ_DATA = [
    {
        category: "THRIFT & CONDITION",
        badge: "01",
        items: [
            {
                id: "faq-item-1",
                question: "1-of-1 ba talaga 'tong thrift items? Paano kapag Sold Out na?",
                answer: "Corretion, thrift styled lang ang mga clothes ngunit hindi ito 1-of-1. Lahat ng items natin ay palaging available (except sa mga seasonal items)."
            },
            {
                id: "faq-item-2",
                question: "Ano ang condition ng clothing? May hidden flaws ba?",
                answer: "Lahat ng items natin ay handpicked, deeply washed, and sanitized!"
            }
        ]
    },
    {
        category: "SIZING & FIT",
        badge: "02",
        items: [
            {
                id: "faq-item-3",
                question: "Paano malalaman ang exact size ni doggo? Stretchable ba?",
                answer: "Check out our 'View Size Guide' model! Para sa mga jackets and sweaters, size UP para comfy. For stretch sleeveless tanks, size DOWN for a snug thrift fit."
            },
            {
                id: "faq-item-4",
                question: "Ano gagawin kapag sa pagitan ng dalawang sizes ang sukat?",
                answer: "Laging piliin ang mas malaking size (Size UP) para mas okay ang relaxed streetwear fit kay doggo."
            }
        ]
    },
    {
        category: "SHIPPING & DELIVERY",
        badge: "03",
        items: [
            {
                id: "faq-item-5",
                question: "Gaano katagal ang delivery nationwide sa PH?",
                answer: "Metro Manila takes 2-3 business days. Provincial Luzon, Visayas & Mindanao areas take 4-7 days via J&T Express / Flash Express."
            }
        ]
    },
    {
        category: "PAYMENT & RETURNS",
        badge: "04",
        items: [
            {
                id: "faq-item-7",
                question: "Ano-ano ang accepted payment methods?",
                answer: "We accept Cash on Delivery (COD nationwide), GCash, Maribank E-Wallet, and Credit/Debit Cards upon checkout."
            },
            {
                id: "faq-item-8",
                question: "Pwede ba mag-return or refund kapag hindi kasya?",
                answer: "P'wedeng p'wede para sa'yo Idol!"
            }
        ]
    }
];

function renderFAQAccordion() {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return; // not the FAQ page

    let html = '';
    FAQ_DATA.forEach((catGroup) => {
        html += `
            <div class="bg-white border-4 border-brand-black p-6 sm:p-8 shadow-brutal">
                <div class="flex items-center gap-3 border-b-4 border-brand-black pb-4 mb-6">
                    <span class="bg-brand-red text-white font-mono text-sm font-bold px-3 py-1 border-2 border-brand-black">${catGroup.badge}</span>
                    <h2 class="font-display text-3xl uppercase text-brand-black">${catGroup.category}</h2>
                </div>
                <div class="space-y-4">
        `;

        catGroup.items.forEach((item) => {
            html += `
                <div class="border-3 border-brand-black bg-brand-cream overflow-hidden brutal-transition">
                    <button id="btn-${item.id}"
                            aria-expanded="false" 
                            aria-controls="content-${item.id}"
                            onclick="toggleFAQAccordion('${item.id}')"
                            class="faq-accordion-btn w-full min-h-[44px] text-left p-4 sm:p-5 flex justify-between items-center font-bold text-lg sm:text-xl uppercase text-brand-black hover:bg-brand-black hover:text-brand-cream transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-red">
                        <span class="flex items-center gap-2 pr-4">
                            <span class="text-brand-red font-mono font-bold shrink-0">Q:</span>
                            <span>${item.question}</span>
                        </span>
                        <svg class="faq-chevron w-6 h-6 transform shrink-0 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="square" stroke-linejoin="miter" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div id="content-${item.id}" role="region" aria-labelledby="btn-${item.id}" class="faq-accordion-content">
                        <div class="faq-accordion-inner">
                            <p class="font-mono text-sm text-brand-black/90 leading-relaxed p-4 sm:p-5 border-t-2 border-brand-black bg-white">
                                <span class="font-bold text-brand-red mr-1">A:</span> ${item.answer}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleFAQAccordion(targetId) {
    const allButtons = document.querySelectorAll('.faq-accordion-btn');
    const allContents = document.querySelectorAll('.faq-accordion-content');

    const targetBtn = document.getElementById(`btn-${targetId}`);
    const targetContent = document.getElementById(`content-${targetId}`);

    const isCurrentlyOpen = targetBtn?.getAttribute('aria-expanded') === 'true';

    // Single-open accordion logic: close all currently open items
    allButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    allContents.forEach(content => content.classList.remove('open'));

    // Toggle target item if it wasn't already open
    if (!isCurrentlyOpen && targetBtn && targetContent) {
        targetBtn.setAttribute('aria-expanded', 'true');
        targetContent.classList.add('open');
    }
}

// ==========================================
// CHECKOUT FORM SUBMISSION & 5S OVERLAY SYSTEM
// ==========================================
function processCheckout(event) {
    if (event) event.preventDefault();

    // 1. Check if orders are currently enabled (this blocks ordering even when logged in)
    if (!PAWSON_CONFIG.ORDERS_ENABLED) {
        showToast('Hindi pa po open ang orders as of now Stay tuned!', 'default');
        return;
    }

    // 2. Check if customer is logged in
    const session = getActiveAuthSession();
    if (!session || !session.email) {
        showToast('Kailangan mo muna mag-log in bago mag-order, dawg!', 'default');
        // FIX: the auth modal no longer exists. Send them to the login page, then back to the cart.
        setTimeout(() => { window.location.href = 'login.html?redirect=cart.html'; }, 1200);
        return;
    }

    const items = getCartItems();
    if (items.length === 0) {
        showToast('Your cart is empty! Add gear before placing an order.', 'error');
        return;
    }

    // FIX: safe reads so a missing field name can't crash checkout
    const form = event ? event.target : null;
    const readField = (fieldName) => {
        const el = form && form.elements ? form.elements[fieldName] : null;
        return el && typeof el.value === 'string' ? el.value : '';
    };
    const name = readField('fullName');
    const email = readField('email');
    const address = readField('address');
    const city = readField('city');

    const orderId = 'PW-' + Math.floor(100000 + Math.random() * 900000);
    const totalAmount = document.getElementById('cart-total')?.innerText || '₱0.00';

    // Create / Get Checkout Overlay Element
    let overlay = document.getElementById('checkout-loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'checkout-loading-overlay';
        document.body.appendChild(overlay);
    }

    // Configure overlay classes & ARIA live region
    overlay.className = 'fixed inset-0 z-[100] bg-brand-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none';
    overlay.setAttribute('aria-live', 'assertive');

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Render loading overlay state
    const encodedGifPath = encodeURI(CHECKOUT_GIF_PATH);
    overlay.innerHTML = `
        <div class="relative w-full max-w-md bg-brand-cream border-4 border-brand-black shadow-brutal p-6 sm:p-8 flex flex-col items-center gap-4 text-brand-black">
            <div class="inline-block bg-brand-red text-white font-mono text-xs font-bold px-3 py-1 border-2 border-brand-black uppercase tracking-wider animate-pulse">
                PROCESSING ORDER
            </div>
            
            <h3 class="font-display text-3xl sm:text-4xl uppercase leading-tight">
                PROCESSING... CHILLAX KA MUNA, DAWG!
            </h3>

            <!-- GIF Container with Fallback handling -->
            <div class="w-48 h-48 sm:w-56 sm:h-56 border-4 border-brand-black bg-brand-black relative overflow-hidden flex items-center justify-center my-2 shadow-brutal-sm">
                ${prefersReducedMotion ? `
                    <div class="text-6xl">🐶</div>
                ` : `
                    <img src="${encodedGifPath}" 
                         alt="Dog chasing tail processing animation"
                         class="w-full h-full object-cover"
                         onerror="this.style.display='none'; document.getElementById('gif-fallback').classList.remove('hidden');">
                    <div id="gif-fallback" class="hidden flex flex-col items-center gap-2 p-4 text-brand-cream">
                        <div class="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                        <span class="font-mono text-xs font-bold uppercase">CHASING TAIL... 🐶</span>
                    </div>
                `}
            </div>

            <p class="font-mono text-xs sm:text-sm text-brand-black/80 font-bold">
                SECURING YOUR ORDER
            </p>

            <!-- 5-Second Progress Bar -->
            <div class="w-full bg-brand-black border-2 border-brand-black h-4 overflow-hidden relative mt-2">
                <div class="bg-brand-red h-full animate-progress-5s"></div>
            </div>

            <span class="font-mono text-[10px] text-brand-black/60 uppercase">
                DO NOT REFRESH OR CLOSE THIS WINDOW
            </span>
        </div>
    `;

    // Lock page scrolling
    document.body.style.overflow = 'hidden';

    // Prevent tab closing / page refreshing during the processing window
    function preventReload(e) {
        e.preventDefault();
        e.returnValue = 'Your order is currently processing. Are you sure you want to exit?';
        return e.returnValue;
    }
    window.addEventListener('beforeunload', preventReload);

    // Execute after CHECKOUT_LOADING_DURATION (5 seconds)
    setTimeout(() => {
        // Unlock page reload warning
        window.removeEventListener('beforeunload', preventReload);
        document.body.style.overflow = '';

        // Clear cart items AFTER confirmation
        saveCartItems([]);

        // Show Order Confirmation View on Page & Update Order Details
        const cartActiveView = document.getElementById('cart-active-view');
        const orderSuccessView = document.getElementById('order-success-view');
        const orderIdSpan = document.getElementById('receipt-order-id');
        const receiptEmail = document.getElementById('receipt-email');
        const receiptName = document.getElementById('receipt-name');
        const receiptAddress = document.getElementById('receipt-address');
        const receiptTotal = document.getElementById('receipt-total');

        // textContent (not innerHTML) so user-typed values can never be run as HTML
        if (orderIdSpan) orderIdSpan.textContent = `#${orderId}`;
        if (receiptEmail) receiptEmail.textContent = email;
        if (receiptName) receiptName.textContent = name;
        if (receiptAddress) receiptAddress.textContent = `${address}, ${city}`;
        if (receiptTotal) receiptTotal.textContent = totalAmount;

        if (cartActiveView) cartActiveView.classList.add('hidden');
        if (orderSuccessView) orderSuccessView.classList.remove('hidden');

        closeCheckoutOverlay();

        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`Order ${orderId} placed successfully!`, 'success');

    }, CHECKOUT_LOADING_DURATION);
}

function closeCheckoutOverlay() {
    const overlay = document.getElementById('checkout-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.overflow = '';
}

// ==========================================================================
// PAWSON WEAR AUTHENTICATION ENGINE (DEMO & FIREBASE READY)
// Login now lives on its own page (login.html), so the old modal code is removed.
// ==========================================================================

// Helper: Sanitize plain text to prevent XSS injection
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// SHA-256 Hasher for Demo Mode (NEVER store plain-text passwords!)
async function hashDemoPassword(password, salt) {
    const text = password + '::' + salt;

    // Preferred: real SHA-256 (only exists on HTTPS or localhost pages)
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(text));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // FIX: DEMO-ONLY fallback so signup/login still work when the page is opened over
    // plain http on a non-localhost address (e.g. http://192.168.x.x). NOT secure.
    // Real accounts need HTTPS and a backend (Firebase, Supabase, etc.).
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) {
        const ch = text.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'fb-' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

// FIX: crypto.randomUUID() is also missing on insecure pages, so use a safe fallback
function makeSalt() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Safe read of the demo user vault
function getDemoVault() {
    try {
        const vault = JSON.parse(localStorage.getItem(PAWSON_CONFIG.AUTH.STORAGE_KEY_DEMO_USERS) || '{}');
        return vault && typeof vault === 'object' ? vault : {};
    } catch (e) {
        return {};
    }
}

// Session Management
function getActiveAuthSession() {
    try {
        const session = localStorage.getItem(PAWSON_CONFIG.AUTH.STORAGE_KEY_SESSION);
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
}

function setActiveAuthSession(email) {
    const sessionData = {
        email: email,
        loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(PAWSON_CONFIG.AUTH.STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    updateAuthUI();
}

function clearAuthSession() {
    localStorage.removeItem(PAWSON_CONFIG.AUTH.STORAGE_KEY_SESSION);
    updateAuthUI();
}

// Update All Navbar and Drawer States Based on Current Auth
function updateAuthUI() {
    const session = getActiveAuthSession();
    const navLoginBtns = document.querySelectorAll('#nav-login-btn, .nav-login-btn');
    const navUserDropdowns = document.querySelectorAll('#nav-user-dropdown, .nav-user-dropdown');
    const navUserEmailLabels = document.querySelectorAll('#nav-user-email-label, .nav-user-email-label');
    const dropdownUserEmailFulls = document.querySelectorAll('#dropdown-user-email-full, .dropdown-user-email-full');

    const mobileLoggedOuts = document.querySelectorAll('#mobile-auth-logged-out, .mobile-auth-logged-out');
    const mobileLoggedIns = document.querySelectorAll('#mobile-auth-logged-in, .mobile-auth-logged-in');
    const mobileUserEmails = document.querySelectorAll('#mobile-user-email, .mobile-user-email');

    if (session && session.email) {
        const shortName = session.email.split('@')[0];

        navLoginBtns.forEach(btn => btn.classList.add('hidden'));
        navUserDropdowns.forEach(dd => dd.classList.remove('hidden'));
        navUserEmailLabels.forEach(label => { label.textContent = shortName; });
        dropdownUserEmailFulls.forEach(label => { label.textContent = session.email; });

        mobileLoggedOuts.forEach(el => el.classList.add('hidden'));
        mobileLoggedIns.forEach(el => el.classList.remove('hidden'));
        mobileUserEmails.forEach(el => { el.textContent = session.email; });
    } else {
        navLoginBtns.forEach(btn => btn.classList.remove('hidden'));
        navUserDropdowns.forEach(dd => dd.classList.add('hidden'));

        mobileLoggedOuts.forEach(el => el.classList.remove('hidden'));
        mobileLoggedIns.forEach(el => el.classList.add('hidden'));
    }
}

// User Dropdown Menu Toggle
function toggleUserDropdown() {
    const menu = document.getElementById('user-dropdown-menu');
    const btn = document.getElementById('user-menu-btn');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !isHidden);
    if (btn) btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
}

// Close Dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('nav-user-dropdown');
    const menu = document.getElementById('user-dropdown-menu');
    if (dropdown && menu && !dropdown.contains(e.target)) {
        menu.classList.add('hidden');
        const btn = document.getElementById('user-menu-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }
});

// Logout Handler
function handleAuthLogout() {
    clearAuthSession();
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) menu.classList.add('hidden');
    showToast('Logged out na. Balik ka ulit sa pack, dawg!', 'default');
}

// Tab Switcher Logic (Log in / Create account)
// FIX: keeps cursor-pointer and now updates aria-selected
function switchAuthTab(tab) {
    clearAuthValidationErrors();
    const isLogin = tab === 'login';

    const loginForm = document.getElementById('auth-login-form');
    const signupForm = document.getElementById('auth-signup-form');
    if (loginForm) loginForm.classList.toggle('hidden', !isLogin);
    if (signupForm) signupForm.classList.toggle('hidden', isLogin);

    const on = 'py-2.5 text-center bg-brand-black text-brand-cream transition-colors cursor-pointer';
    const off = 'py-2.5 text-center text-brand-black hover:bg-white transition-colors cursor-pointer';

    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabSignupBtn = document.getElementById('tab-signup-btn');
    if (tabLoginBtn) {
        tabLoginBtn.className = isLogin ? on : off;
        tabLoginBtn.setAttribute('aria-selected', String(isLogin));
    }
    if (tabSignupBtn) {
        tabSignupBtn.className = isLogin ? off : on;
        tabSignupBtn.setAttribute('aria-selected', String(!isLogin));
    }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🕶';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// Password Strength Calculator
function updatePasswordStrength(password) {
    const bar = document.getElementById('pw-strength-bar');
    const label = document.getElementById('pw-strength-text');
    if (!bar || !label) return;

    if (!password || password.length === 0) {
        bar.style.width = '0%';
        bar.className = 'pw-strength-bar bg-brand-red';
        label.textContent = 'PW STRENGTH: WALA PA'; // matches the text in login.html
        return;
    }

    let score = 0;
    if (password.length >= PAWSON_CONFIG.AUTH.MIN_PASSWORD_LENGTH) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
        bar.style.width = '25%';
        bar.className = 'pw-strength-bar bg-[#ef4444]';
        label.textContent = 'PW STRENGTH: MEDYO MAHINA (MAG-DAGDAG PA)';
    } else if (score === 2) {
        bar.style.width = '55%';
        bar.className = 'pw-strength-bar bg-[#f59e0b]';
        label.textContent = 'PW STRENGTH: COMFY FIT NA';
    } else {
        bar.style.width = '100%';
        bar.className = 'pw-strength-bar bg-[#22c55e]';
        label.textContent = 'PW STRENGTH: SOLID / GOD-TIER!';
    }
}

// Inline Validation Helpers
function showFieldError(errorElementId, message) {
    const el = document.getElementById(errorElementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

function clearAuthValidationErrors() {
    const errorIds = ['login-email-error', 'login-password-error', 'signup-email-error', 'signup-password-error'];
    errorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '';
            el.classList.add('hidden');
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 1. CREATE ACCOUNT SUBMISSION
async function handleAuthSignupSubmit(e) {
    e.preventDefault();
    clearAuthValidationErrors();

    const email = document.getElementById('signup-email')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('signup-password')?.value || '';
    const submitBtn = document.getElementById('signup-submit-btn');

    let hasError = false;
    if (!email || !isValidEmail(email)) {
        showFieldError('signup-email-error', 'Mali ang format ng email, idol. Dapat may @ at tamang domain.');
        hasError = true;
    }
    if (password.length < PAWSON_CONFIG.AUTH.MIN_PASSWORD_LENGTH) {
        showFieldError('signup-password-error', `Bitin pa ang password! Mag-add pa ng characters (at least ${PAWSON_CONFIG.AUTH.MIN_PASSWORD_LENGTH} dapat).`);
        hasError = true;
    }

    if (hasError) return;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'CREATING ACCOUNT...';
    }

    try {
        if (PAWSON_CONFIG.AUTH.USE_DEMO) {
            const demoVault = getDemoVault();

            if (demoVault[email]) {
                showFieldError('signup-email-error', "May account na ang email na 'to. Mag-log in na lang.");
                return; // finally block re-enables the button
            }

            const salt = makeSalt();
            const passwordHash = await hashDemoPassword(password, salt);

            demoVault[email] = { salt, passwordHash, createdAt: new Date().toISOString() };
            localStorage.setItem(PAWSON_CONFIG.AUTH.STORAGE_KEY_DEMO_USERS, JSON.stringify(demoVault));

            setActiveAuthSession(email);
            showToast(`Solid! Welcome sa Pawson fam, ${escapeHTML(email)}!`, 'success');
            // FIX: was closeAuthModal(). Go back to the page they came from (or cart/home).
            setTimeout(redirectAfterAuth, 800);
        } else {
            // Firebase Auth Integration placeholder
        }
    } catch (err) {
        showFieldError('signup-email-error', 'Nagka-problema sa pag-create ng account. Paki-try ulit mamaya.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'CREATE ACCOUNT →';
        }
    }
}

// 2. LOG IN SUBMISSION
async function handleAuthLoginSubmit(e) {
    e.preventDefault();
    clearAuthValidationErrors();

    const email = document.getElementById('login-email')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('login-password')?.value || '';
    const submitBtn = document.getElementById('login-submit-btn');

    let hasError = false;
    if (!email || !isValidEmail(email)) {
        showFieldError('login-email-error', 'Pakilagay ang tamang email address.');
        hasError = true;
    }
    if (!password) {
        showFieldError('login-password-error', 'Pakilagay ang iyong password.');
        hasError = true;
    }

    if (hasError) return;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'CHECKING CREDENTIALS...';
    }

    try {
        if (PAWSON_CONFIG.AUTH.USE_DEMO) {
            const demoVault = getDemoVault();
            const userRecord = demoVault[email];
            const genericError = 'Mali ang email o password. Paki-check ulit, idol.';

            if (!userRecord) {
                showFieldError('login-password-error', genericError);
                return;
            }

            const inputHash = await hashDemoPassword(password, userRecord.salt);
            if (inputHash !== userRecord.passwordHash) {
                showFieldError('login-password-error', genericError);
                return;
            }

            setActiveAuthSession(email);
            showToast(`Welcome back, ${escapeHTML(email)}! Ready to thrift na.`, 'success');
            // FIX: was closeAuthModal(). Go back to the page they came from (or cart/home).
            setTimeout(redirectAfterAuth, 800);
        } else {
            // Firebase Auth Integration placeholder
        }
    } catch (err) {
        showFieldError('login-password-error', 'Mali ang email o password. Paki-check ulit, idol.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'LOG IN →';
        }
    }
}

// 3. FORGOT PASSWORD HANDLER
function handleForgotPasswordClick() {
    if (PAWSON_CONFIG.AUTH.USE_DEMO) {
        showToast('Sa Demo Mode, walang outgoing email server. Sa live Firebase setup, automated ang reset link!', 'default');
    }
}