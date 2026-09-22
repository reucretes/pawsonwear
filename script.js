// Cart State Management with localStorage
function getCartItems() {
    try {
        return JSON.parse(localStorage.getItem('pawson_cart_items') || '[]');
    } catch (e) {
        return [];
    }
}

function saveCartItems(items) {
    localStorage.setItem('pawson_cart_items', JSON.stringify(items));
    const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    localStorage.setItem('pawson_cart_count', totalCount.toString());
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

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
});

// Interactive Size Selection on Product Cards
function selectProductSize(pillBtn, size) {
    const container = pillBtn.closest('.size-picker') || pillBtn.parentElement;
    if (!container) return;

    // Reset sibling pill styles
    const pills = container.querySelectorAll('.size-pill');
    pills.forEach(p => {
        p.classList.remove('bg-brand-red', 'text-white', 'shadow-brutal-sm');
        p.classList.add('bg-brand-cream', 'text-brand-black');
    });

    // Set clicked pill active style
    pillBtn.classList.remove('bg-brand-cream', 'text-brand-black');
    pillBtn.classList.add('bg-brand-red', 'text-white', 'shadow-brutal-sm');

    // Store selected size attribute on closest product card
    const card = pillBtn.closest('.group') || pillBtn.closest('[data-product-card]');
    if (card) {
        card.setAttribute('data-selected-size', size);
    }
}

// Global Sizing & Fit Guide Modal System
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
                    <span class="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">// PAWSON WEAR FIT MANUAL</span>
                    <h2 class="font-display text-3xl sm:text-5xl uppercase text-brand-black leading-none mt-1">Sizing & Fit Guide</h2>
                </div>
                <button onclick="closeSizeGuide()" aria-label="Close Size Guide" class="min-h-[44px] min-w-[44px] p-2 border-3 border-brand-black bg-white hover:bg-brand-red hover:text-white transition-colors font-mono font-bold text-base shadow-brutal-sm">
                    [X]
                </button>
            </div>

            <!-- Size Scale Cards -->
            <div class="grid grid-cols-5 gap-2 sm:gap-4 mb-6 text-center">
                <div class="size-guide-col border-2 border-brand-black p-2 sm:p-3 bg-white hover:border-brand-red transition-colors cursor-pointer" onclick="highlightGuideSize('XS')">
                    <div class="h-10 sm:h-12 flex items-center justify-center mb-1">
                        <svg class="w-6 h-6 sm:w-8 sm:h-8 text-brand-black transition-colors" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M16 42h8l4-12 10 2 4 10h8v-8l-4-4v-8l-8-6-8 2-6 8v10l-4 6z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">XS</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 11 lbs</span>
                </div>

                <div class="size-guide-col border-2 border-brand-black p-2 sm:p-3 bg-white hover:border-brand-red transition-colors cursor-pointer" onclick="highlightGuideSize('S')">
                    <div class="h-10 sm:h-12 flex items-center justify-center mb-1">
                        <svg class="w-7 h-7 sm:w-9 sm:h-9 text-brand-black transition-colors" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M14 44h10l4-14 12 2 4 12h10v-10l-4-4v-10l-10-6-8 2-6 10v10l-6 10z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">S</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 15 lbs</span>
                </div>

                <div class="size-guide-col border-2 border-brand-black p-2 sm:p-3 bg-brand-red text-white shadow-brutal-sm cursor-pointer" onclick="highlightGuideSize('M')">
                    <div class="h-10 sm:h-12 flex items-center justify-center mb-1">
                        <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white transition-colors" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M12 46h12l5-16 14 3 5 13h10v-11l-5-5v-11l-11-7-10 2-7 11v12l-7 12z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">M</span>
                    <span class="font-mono text-[9px] sm:text-[11px] opacity-90 block">Up to 23 lbs</span>
                </div>

                <div class="size-guide-col border-2 border-brand-black p-2 sm:p-3 bg-white hover:border-brand-red transition-colors cursor-pointer" onclick="highlightGuideSize('L')">
                    <div class="h-10 sm:h-12 flex items-center justify-center mb-1">
                        <svg class="w-9 h-9 sm:w-11 sm:h-11 text-brand-black transition-colors" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M10 48h14l6-18 16 3 6 15h10v-12l-6-6v-12l-12-8-11 2-8 12v14l-8 13z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <span class="font-sans font-bold text-base sm:text-lg block">L</span>
                    <span class="font-mono text-[9px] sm:text-[11px] text-brand-black/80 block">Up to 35 lbs</span>
                </div>

                <div class="size-guide-col border-2 border-brand-black p-2 sm:p-3 bg-white hover:border-brand-red transition-colors cursor-pointer" onclick="highlightGuideSize('XL')">
                    <div class="h-10 sm:h-12 flex items-center justify-center mb-1">
                        <svg class="w-10 h-10 sm:w-12 sm:h-12 text-brand-black transition-colors" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M8 50h16l7-20 18 4 7 16h10v-13l-7-7v-13l-13-9-12 2-9 13v16l-9 14z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
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
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold bg-brand-red text-white">M</th>
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold">L</th>
                            <th class="p-2.5 sm:p-3.5 border-b-2 border-brand-black text-center font-bold">XL</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y-2 divide-brand-black/20">
                        <tr>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black font-bold uppercase bg-brand-cream/50">WEIGHT</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">Up to 11 lbs</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">Up to 15 lbs</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center font-bold bg-brand-red/10 text-brand-red">Up to 23 lbs</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">Up to 35 lbs</td>
                            <td class="p-2.5 sm:p-3.5 text-center">Up to 45 lbs</td>
                        </tr>
                        <tr>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black font-bold uppercase bg-brand-cream/50">BACK LENGTH</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">9 - 12"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">11 - 16"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center font-bold bg-brand-red/10 text-brand-red">15 - 18"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">16 - 20"</td>
                            <td class="p-2.5 sm:p-3.5 text-center">20 - 24"</td>
                        </tr>
                        <tr>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black font-bold uppercase bg-brand-cream/50">GIRTH (CHEST)</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">13 - 17"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center">14 - 18"</td>
                            <td class="p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center font-bold bg-brand-red/10 text-brand-red">18 - 22"</td>
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
                        <span class="font-mono text-xs font-bold text-brand-red">// ACCURACY CHECK</span>
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

                    <!-- Custom SVG Measurement Diagram -->
                    <div class="md:w-1/2 w-full border-3 border-brand-black bg-brand-cream p-4 flex flex-col items-center justify-center relative">
                        <svg viewBox="0 0 400 240" class="w-full h-auto max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- Dog Silhouette Base -->
                            <path d="M70 160 C70 140 90 120 120 110 L150 110 C170 80 200 60 230 65 C250 68 270 90 260 110 C290 115 330 125 340 145 C345 155 330 170 310 170 L280 170 L275 210 L250 210 L255 170 L185 170 L180 210 L155 210 L160 170 L120 170 L115 210 L90 210 L98 160 Z" 
                                  fill="#ffffff" stroke="#292622" stroke-width="4" stroke-linejoin="round"/>
                            <!-- Dog Ear & Head Details -->
                            <path d="M120 110 L105 75 L130 90 Z" fill="#eb3b2d" stroke="#292622" stroke-width="3"/>
                            <circle cx="115" cy="98" r="3" fill="#292622"/>
                            
                            <!-- Back Length Measurement Arrow -->
                            <g>
                                <line x1="130" y1="50" x2="310" y2="50" stroke="#eb3b2d" stroke-width="3" stroke-dasharray="4 4"/>
                                <path d="M130 50 L140 43 M130 50 L140 57" stroke="#eb3b2d" stroke-width="3" stroke-linecap="round"/>
                                <path d="M310 50 L300 43 M310 50 L300 57" stroke="#eb3b2d" stroke-width="3" stroke-linecap="round"/>
                                <line x1="130" y1="40" x2="130" y2="85" stroke="#292622" stroke-width="2" stroke-dasharray="2 2"/>
                                <line x1="310" y1="40" x2="310" y2="130" stroke="#292622" stroke-width="2" stroke-dasharray="2 2"/>
                                <rect x="175" y="36" width="100" height="26" fill="#292622" rx="2"/>
                                <text x="225" y="53" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">BACK LENGTH</text>
                            </g>

                            <!-- Girth Measurement Arrow -->
                            <g>
                                <ellipse cx="170" cy="140" rx="18" ry="32" stroke="#eb3b2d" stroke-width="4" fill="none" stroke-dasharray="5 5"/>
                                <rect x="125" y="128" width="60" height="24" fill="#eb3b2d" rx="2"/>
                                <text x="155" y="144" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">GIRTH</text>
                            </g>
                        </svg>
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

function openSizeGuide(highlightSize) {
    renderSizeGuideModal();
    const modal = document.getElementById('size-guide-modal');
    if (!modal) return;

    if (highlightSize) {
        highlightGuideSize(highlightSize);
    }

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
    const modal = document.getElementById('size-guide-modal');
    if (!modal) return;

    const sizeCols = modal.querySelectorAll('.size-guide-col');
    sizeCols.forEach(col => {
        const sizeText = col.querySelector('.font-sans')?.innerText.trim();
        const svg = col.querySelector('svg');
        if (sizeText === targetSize) {
            col.className = 'size-guide-col border-2 border-brand-black p-2 sm:p-3 bg-brand-red text-white shadow-brutal-sm cursor-pointer';
            if (svg) svg.classList.replace('text-brand-black', 'text-white');
        } else {
            col.className = 'size-guide-col border-2 border-brand-black p-2 sm:p-3 bg-white text-brand-black hover:border-brand-red transition-colors cursor-pointer';
            if (svg) svg.classList.replace('text-white', 'text-brand-black');
        }
    });

    // Also highlight matching column in the table
    const tableHeaders = modal.querySelectorAll('table thead th');
    const tableCells = modal.querySelectorAll('table tbody tr');
    
    const sizeIndexMap = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5 };
    const targetIdx = sizeIndexMap[targetSize] || 3;

    tableHeaders.forEach((th, idx) => {
        if (idx === targetIdx) {
            th.className = 'p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold bg-brand-red text-white';
        } else if (idx > 0) {
            th.className = 'p-2.5 sm:p-3.5 border-b-2 border-r-2 border-brand-black text-center font-bold text-brand-cream';
        }
    });

    tableCells.forEach(tr => {
        const cells = tr.querySelectorAll('td');
        cells.forEach((td, idx) => {
            if (idx === targetIdx) {
                td.className = 'p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center font-bold bg-brand-red/10 text-brand-red';
            } else if (idx > 0) {
                td.className = 'p-2.5 sm:p-3.5 border-r-2 border-brand-black text-center';
            }
        });
    });
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

// Add to Cart from Card helper
function addToCartFromCard(addBtn, productName, price, imageSrc) {
    const card = addBtn.closest('.group') || addBtn.closest('[data-product-card]');
    let chosenSize = null;

    if (card) {
        chosenSize = card.getAttribute('data-selected-size');
        // If no explicit click, look for the active size pill
        if (!chosenSize) {
            const activePill = card.querySelector('.size-pill.bg-brand-red');
            if (activePill) {
                chosenSize = activePill.innerText.trim();
            } else {
                chosenSize = 'M'; // Default size
            }
        }
    }

    addToCart(productName, price, imageSrc, chosenSize);
}

// General Add to Cart Logic
function addToCart(productName, price, imageSrc, size) {
    const items = getCartItems();
    const itemSize = size || null;

    // Compare name AND size
    const existingIndex = items.findIndex(item => item.name === productName && item.size === itemSize);

    if (existingIndex > -1) {
        items[existingIndex].quantity = (items[existingIndex].quantity || 1) + 1;
    } else {
        const fallbackImg = imageSrc || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80';
        items.push({
            name: productName,
            price: parseFloat(price),
            image: fallbackImg,
            size: itemSize,
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

    const sizeMsg = itemSize ? ` (Size: ${itemSize})` : '';
    showToast(`+1 ${productName}${sizeMsg} added to cart.`, 'success');
}

// Mobile Drawer Management
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

// Custom Toast Function (Brutalist style)
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
        flex items-center justify-between p-4 border-4 border-brand-black font-mono font-bold text-sm shadow-brutal transform transition-all duration-300 translate-x-full opacity-0
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

// Render Cart Page Items & Order Summary
function renderCartPage() {
    const cartItemsContainer = document.getElementById('cart-items-list');
    const emptyCartMsg = document.getElementById('empty-cart-view');
    const cartContent = document.getElementById('cart-active-view');
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');

    if (!cartItemsContainer) return;

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
        const itemTotal = item.price * (item.quantity || 1);
        subtotal += itemTotal;

        const sizeBadge = item.size ? `<span class="bg-brand-black text-white text-[11px] font-mono font-bold px-2 py-0.5 border border-brand-black">SIZE: ${item.size}</span>` : '';

        html += `
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border-3 border-brand-black shadow-brutal-sm gap-4 mb-4">
                <div class="flex items-center gap-4">
                    <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover border-2 border-brand-black shrink-0">
                    <div>
                        <h4 class="font-sans font-bold text-xl uppercase leading-tight mb-1">${item.name}</h4>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-mono text-sm text-brand-red font-bold">₱${item.price.toFixed(2)} each</span>
                            ${sizeBadge}
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between w-full sm:w-auto gap-6 border-t-2 sm:border-t-0 border-brand-black pt-3 sm:pt-0">
                    <div class="flex items-center border-2 border-brand-black bg-brand-cream">
                        <button onclick="updateCartQuantity(${index}, -1)" class="w-8 h-8 font-mono font-bold hover:bg-brand-black hover:text-white transition-colors">-</button>
                        <span class="w-10 text-center font-mono font-bold text-sm">${item.quantity || 1}</span>
                        <button onclick="updateCartQuantity(${index}, 1)" class="w-8 h-8 font-mono font-bold hover:bg-brand-black hover:text-white transition-colors">+</button>
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
        showToast(`Removed ${items[index].name} from cart.`);
        items.splice(index, 1);
        saveCartItems(items);
        renderCartPage();
    }
}

// Checkout Form Submission
function processCheckout(event) {
    event.preventDefault();

    const items = getCartItems();
    if (items.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    const form = event.target;
    const name = form.elements['fullName'].value;
    const email = form.elements['email'].value;
    const address = form.elements['address'].value;
    const city = form.elements['city'].value;

    const orderId = 'PW-' + Math.floor(100000 + Math.random() * 900000);
    const totalAmount = document.getElementById('cart-total')?.innerText || '₱0.00';

    // Show Order Confirmation View
    const cartActiveView = document.getElementById('cart-active-view');
    const orderSuccessView = document.getElementById('order-success-view');
    const orderIdSpan = document.getElementById('receipt-order-id');
    const receiptEmail = document.getElementById('receipt-email');
    const receiptName = document.getElementById('receipt-name');
    const receiptAddress = document.getElementById('receipt-address');
    const receiptTotal = document.getElementById('receipt-total');

    if (orderIdSpan) orderIdSpan.innerText = `#${orderId}`;
    if (receiptEmail) receiptEmail.innerText = email;
    if (receiptName) receiptName.innerText = name;
    if (receiptAddress) receiptAddress.innerText = `${address}, ${city}`;
    if (receiptTotal) receiptTotal.innerText = totalAmount;

    if (cartActiveView) cartActiveView.classList.add('hidden');
    if (orderSuccessView) orderSuccessView.classList.remove('hidden');

    // Clear cart storage
    saveCartItems([]);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Order ${orderId} placed successfully!`, 'success');
}
