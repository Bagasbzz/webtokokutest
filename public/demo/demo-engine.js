/* =====================================================
   WEBTOKOKU DEMO ENGINE v2
   Shared across all /demo/*.html pages
   Features: demo popup, cart drawer, product modal
   ===================================================== */

(function () {
  /* ── helpers ── */
  const fmt = (n) => 'Rp ' + parseInt(String(n).replace(/\D/g, '')).toLocaleString('id-ID');

  /* ─────────────────────────────────────────────
     1. INJECT GLOBAL STYLES
  ───────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* Demo Banner */
    #demo-banner {
      position: fixed; top: 0; left: 0; width: 100%; z-index: 99999;
      background: #f59e0b; color: #1c1917;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 9px 16px; font-size: 13px; font-weight: 600;
      font-family: system-ui, sans-serif;
    }
    #demo-banner a {
      text-decoration: underline; color: #1c1917; font-weight: 700;
    }
    body { padding-top: 0 !important; }

  /* Demo Welcome Popup */
    #demo-popup {
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(0,0,0,0.7); display: flex;
      align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
      font-family: system-ui, sans-serif;
    }
    #demo-popup .pop-box {
      background: #fff; border-radius: 20px; padding: 40px 36px;
      max-width: 420px; width: 90%; text-align: center;
      box-shadow: 0 30px 80px rgba(0,0,0,0.3);
    }
    #demo-popup .pop-icon { font-size: 40px; margin-bottom: 16px; color: #6366f1; }
    #demo-popup h2 { font-size: 22px; font-weight: 800; color: #111; margin-bottom: 10px; }
    #demo-popup p { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 24px; }
    #demo-popup .pop-close {
      background: #111; color: #fff; border: none; padding: 13px 28px;
      border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
      width: 100%; transition: 0.2s;
    }
    #demo-popup .pop-close:hover { background: #333; }

  /* Cart Icon in nav */
    #cart-trigger {
      position: relative; cursor: pointer;
      background: none; border: none; color: inherit;
      display: inline-flex; align-items: center; gap: 6px;
      font-family: system-ui, sans-serif; font-size: 14px; font-weight: 600;
      padding: 8px 14px; border-radius: 8px;
      border: 1px solid rgba(0,0,0,0.12);
      transition: 0.2s;
    }
    #cart-trigger:hover { background: rgba(0,0,0,0.05); }
    #cart-trigger .cart-badge {
      position: absolute; top: -6px; right: -6px;
      background: #ef4444; color: #fff;
      border-radius: 50%; width: 18px; height: 18px;
      font-size: 10px; font-weight: 800; display: flex;
      align-items: center; justify-content: center;
      display: none;
    }

    /* Cart Drawer */
    #cart-drawer {
      position: fixed; top: 0; right: -420px; height: 100vh;
      width: 400px; max-width: 95vw; background: #fff; z-index: 99998;
      box-shadow: -10px 0 40px rgba(0,0,0,0.15);
      transition: right 0.35s cubic-bezier(0.4,0,0.2,1);
      display: flex; flex-direction: column;
      font-family: system-ui, sans-serif;
    }
    #cart-drawer.open { right: 0; }
    #cart-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      z-index: 99997; display: none;
    }
    #cart-overlay.show { display: block; }
    .cart-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid #e5e7eb;
    }
    .cart-head h3 { font-size: 18px; font-weight: 800; color: #111; }
    .cart-close-btn {
      background: none; border: none; font-size: 22px; cursor: pointer; color: #666;
    }
    .cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .cart-empty { text-align: center; padding: 60px 20px; color: #999; font-size: 15px; }
    .cart-item {
      display: flex; gap: 14px; padding: 14px 0;
      border-bottom: 1px solid #f3f4f6; align-items: flex-start;
    }
    .cart-item img {
      width: 68px; height: 68px; object-fit: cover;
      border-radius: 10px; background: #f3f4f6; flex-shrink: 0;
    }
    .cart-item-info { flex: 1; }
    .cart-item-name { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px; }
    .cart-item-price { font-size: 13px; color: #6b7280; }
    .cart-item-qty {
      display: flex; align-items: center; gap: 8px; margin-top: 8px;
    }
    .qty-btn {
      width: 26px; height: 26px; border: 1px solid #d1d5db;
      border-radius: 6px; background: none; cursor: pointer;
      font-size: 14px; font-weight: 700; color: #111;
      display: flex; align-items: center; justify-content: center;
    }
    .qty-val { font-size: 14px; font-weight: 700; min-width: 20px; text-align: center; }
    .cart-item-del { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 16px; }
    .cart-foot {
      padding: 20px 24px; border-top: 1px solid #e5e7eb;
    }
    .cart-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #111; margin-bottom: 16px; }
    .cart-checkout-btn {
      width: 100%; padding: 15px; border: none; border-radius: 12px;
      background: #111; color: #fff; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: 0.2s;
    }
    .cart-checkout-btn:hover { background: #333; }

    /* Product Modal */
    #prod-modal {
      position: fixed; inset: 0; z-index: 999990;
      background: rgba(0,0,0,0.6); display: none;
      align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
      font-family: system-ui, sans-serif;
      padding: 16px;
    }
    #prod-modal.show { display: flex; }
    .prod-box {
      background: #fff; border-radius: 20px;
      max-width: 640px; width: 100%;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 30px 80px rgba(0,0,0,0.3);
    }
    .prod-img-wrap { position: relative; height: 280px; overflow: hidden; border-radius: 20px 20px 0 0; }
    .prod-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .prod-close {
      position: absolute; top: 14px; right: 14px;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(0,0,0,0.5); color: #fff; border: none;
      cursor: pointer; font-size: 18px; display: flex;
      align-items: center; justify-content: center;
    }
    .prod-body { padding: 28px; }
    .prod-tag {
      display: inline-block; background: #f3f4f6; color: #374151;
      font-size: 11px; font-weight: 700; padding: 4px 10px;
      border-radius: 100px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;
    }
    .prod-name { font-size: 22px; font-weight: 800; color: #111; margin-bottom: 8px; }
    .prod-price { font-size: 24px; font-weight: 800; color: #111; margin-bottom: 14px; }
    .prod-desc { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 24px; }
    .prod-qty-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .prod-qty-row label { font-size: 14px; font-weight: 600; color: #111; }
    .prod-qty-ctrl { display: flex; align-items: center; gap: 10px; border: 1px solid #d1d5db; border-radius: 10px; padding: 6px 14px; }
    .prod-qty-ctrl button { background: none; border: none; font-size: 18px; cursor: pointer; font-weight: 700; color: #111; }
    .prod-qty-ctrl span { font-size: 16px; font-weight: 700; min-width: 24px; text-align: center; }
    .prod-actions { display: flex; gap: 12px; }
    .btn-atc {
      flex: 1; background: #111; color: #fff;
      border: none; padding: 14px; border-radius: 12px;
      font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .btn-atc:hover { background: #333; }
    .btn-wa-prod {
      flex: 1; background: #25D366; color: #fff;
      border: none; padding: 14px; border-radius: 12px;
      font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-wa-prod:hover { background: #1da851; }

    /* Demo checkout popup */
    #demo-checkout-popup {
      position: fixed; inset: 0; z-index: 9999999;
      background: rgba(0,0,0,0.7); display: none;
      align-items: center; justify-content: center;
      font-family: system-ui, sans-serif;
    }
    #demo-checkout-popup.show { display: flex; }
    .demo-checkout-box {
      background: #fff; border-radius: 20px; padding: 40px 36px;
      max-width: 400px; width: 90%; text-align: center;
    }
    .demo-checkout-box .icon { font-size: 52px; margin-bottom: 16px; }
    .demo-checkout-box h3 { font-size: 20px; font-weight: 800; color: #111; margin-bottom: 10px; }
    .demo-checkout-box p { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 24px; }
    .demo-checkout-box a {
      display: block; background: #25D366; color: #fff;
      padding: 13px 20px; border-radius: 10px; font-weight: 700;
      font-size: 14px; margin-bottom: 10px; text-decoration: none;
      transition: 0.2s;
    }
    .demo-checkout-box a:hover { background: #1da851; }
    .demo-checkout-back {
      background: none; border: none; color: #999; cursor: pointer;
      font-size: 14px; text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────
     2. DEMO BANNER — REMOVED (was too intrusive)
  ───────────────────────────────────────────── */


  /* ─────────────────────────────────────────────
     3. DEMO WELCOME POPUP
  ───────────────────────────────────────────── */
  const popup = document.createElement('div');
  popup.id = 'demo-popup';
  popup.innerHTML = `
    <div class="pop-box">
      <div class="pop-icon">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      </div>
      <h2>Ini adalah toko demo</h2>
      <p>Kamu sedang melihat contoh tampilan toko yang bisa dibuat di <strong>webtokoku</strong>.<br><br>Produk, harga, dan informasi di sini hanya contoh. Pesanan tidak akan diproses.</p>
      <button class="pop-close" id="pop-close-btn">Saya mengerti, lanjut lihat</button>
    </div>`;
  document.body.appendChild(popup);
  document.getElementById('pop-close-btn').onclick = () => popup.style.display = 'none';

  /* ─────────────────────────────────────────────
     4. CART STATE
  ───────────────────────────────────────────── */
  let cart = [];
  let modalQty = 1;
  let currentProduct = null;

  /* ─────────────────────────────────────────────
     5. INJECT CART ICON INTO NAVBAR
  ───────────────────────────────────────────── */
  function injectCartBtn() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const cartBtn = document.createElement('button');
    cartBtn.id = 'cart-trigger';
    cartBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      Keranjang
      <span class="cart-badge" id="cart-badge">0</span>`;
    cartBtn.onclick = openCart;
    nav.appendChild(cartBtn);
  }

  /* ─────────────────────────────────────────────
     6. CART DRAWER HTML
  ───────────────────────────────────────────── */
  const cartOverlay = document.createElement('div');
  cartOverlay.id = 'cart-overlay';
  cartOverlay.onclick = closeCart;
  document.body.appendChild(cartOverlay);

  const cartDrawer = document.createElement('div');
  cartDrawer.id = 'cart-drawer';
  cartDrawer.innerHTML = `
    <div class="cart-head">
      <h3>Keranjang Belanja</h3>
      <button class="cart-close-btn" onclick="window.__demoEngine.closeCart()">x</button>
    </div>
    <div class="cart-items" id="cart-items-list">
      <div class="cart-empty">Keranjang kosong.<br>Pilih produk dan klik "Tambah ke Keranjang".</div>
    </div>
    <div class="cart-foot" id="cart-foot" style="display:none;">
      <div class="cart-total"><span>Total</span><span id="cart-total-val">Rp 0</span></div>
      <button class="cart-checkout-btn" onclick="window.__demoEngine.showCheckoutPopup()">Lanjut ke Checkout</button>
    </div>`;
  document.body.appendChild(cartDrawer);

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('show');
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('show');
  }

  function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    const foot = document.getElementById('cart-foot');
    const badge = document.getElementById('cart-badge');
    const totalEl = document.getElementById('cart-total-val');
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);

    if (badge) {
      badge.textContent = totalQty;
      badge.style.display = totalQty > 0 ? 'flex' : 'none';
    }

    if (cart.length === 0) {
      list.innerHTML = '<div class="cart-empty">Keranjang kosong.<br>Pilih produk dan klik "Tambah ke Keranjang".</div>';
      if (foot) foot.style.display = 'none';
      return;
    }

    let total = 0;
    list.innerHTML = cart.map((item, i) => {
      const linePrice = item.priceNum * item.qty;
      total += linePrice;
      return `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.name}" onerror="this.style.background='#f3f4f6'">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${fmt(item.priceNum)} x ${item.qty}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="window.__demoEngine.cartQty(${i},-1)">-</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="window.__demoEngine.cartQty(${i},1)">+</button>
              <button class="cart-item-del" onclick="window.__demoEngine.cartRemove(${i})">Hapus</button>
            </div>
          </div>
        </div>`;
    }).join('');

    if (foot) { foot.style.display = 'block'; }
    if (totalEl) totalEl.textContent = fmt(total);
  }

  function cartAdd(product, qty) {
    const existing = cart.find(i => i.name === product.name);
    if (existing) existing.qty += qty;
    else cart.push({ ...product, qty });
    updateCartUI();
  }

  window.__demoEngine = {
    closeCart,
    cartQty(i, d) {
      cart[i].qty += d;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      updateCartUI();
    },
    cartRemove(i) {
      cart.splice(i, 1);
      updateCartUI();
    },
    showCheckoutPopup() {
      document.getElementById('demo-checkout-popup').classList.add('show');
    }
  };

  /* ─────────────────────────────────────────────
     7. PRODUCT MODAL
  ───────────────────────────────────────────── */
  const prodModal = document.createElement('div');
  prodModal.id = 'prod-modal';
  prodModal.innerHTML = `
    <div class="prod-box">
      <div class="prod-img-wrap">
        <img id="pm-img" src="" alt="">
        <button class="prod-close" onclick="document.getElementById('prod-modal').classList.remove('show')">✕</button>
      </div>
      <div class="prod-body">
        <span class="prod-tag" id="pm-tag">Produk</span>
        <div class="prod-name" id="pm-name">Nama Produk</div>
        <div class="prod-price" id="pm-price">Rp 0</div>
        <div class="prod-desc" id="pm-desc">Deskripsi produk.</div>
        <div class="prod-qty-row">
          <label>Jumlah:</label>
          <div class="prod-qty-ctrl">
            <button onclick="window.__demoEngine.modalQtyChange(-1)">−</button>
            <span id="pm-qty">1</span>
            <button onclick="window.__demoEngine.modalQtyChange(1)">+</button>
          </div>
        </div>
        <div class="prod-actions">
          <button class="btn-atc" onclick="window.__demoEngine.addToCartFromModal()">+ Keranjang</button>
          <button class="btn-wa-prod" onclick="window.__demoEngine.orderViaWA()">💬 Pesan WA</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(prodModal);
  prodModal.addEventListener('click', (e) => { if (e.target === prodModal) prodModal.classList.remove('show'); });

  window.__demoEngine.modalQtyChange = function(d) {
    modalQty = Math.max(1, modalQty + d);
    const el = document.getElementById('pm-qty');
    if (el) el.textContent = modalQty;
  };
  window.__demoEngine.addToCartFromModal = function() {
    if (!currentProduct) return;
    cartAdd(currentProduct, modalQty);
    prodModal.classList.remove('show');
    openCart();
  };
  window.__demoEngine.orderViaWA = function() {
    if (!currentProduct) return;
    const msg = `Halo! Saya tertarik dengan *${currentProduct.name}* (${fmt(currentProduct.priceNum)}) sebanyak ${modalQty}. Apakah masih tersedia?`;
    document.getElementById('demo-checkout-popup').classList.add('show');
  };

  /* ─────────────────────────────────────────────
     8. DEMO CHECKOUT POPUP
  ───────────────────────────────────────────── */
  const checkoutPopup = document.createElement('div');
  checkoutPopup.id = 'demo-checkout-popup';
  checkoutPopup.innerHTML = `
    <div class="demo-checkout-box">
      <div class="icon" style="font-size:42px;color:#6366f1;margin-bottom:16px;">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <h3>Ini adalah toko demo</h3>
      <p>Checkout dan pemesanan tidak bisa diproses di sini.<br><br>Buat toko nyata kamu di <strong>webtokoku</strong> dan terima pesanan asli dari pelanggan!</p>
      <a href="https://www.webtokoku.id" target="_blank">Buat Toko Gratis</a>
      <button class="demo-checkout-back" onclick="this.closest('#demo-checkout-popup').classList.remove('show')">Tutup</button>
    </div>`;
  document.body.appendChild(checkoutPopup);

  /* ─────────────────────────────────────────────
     9. MAKE ALL PRODUCT CARDS CLICKABLE
  ───────────────────────────────────────────── */
  function attachProductCards() {
    const cards = document.querySelectorAll('[data-product-name]');
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
        const name = card.dataset.productName || 'Produk';
        const price = card.dataset.productPrice || '0';
        const desc = card.dataset.productDesc || 'Produk pilihan toko kami.';
        const tag = card.dataset.productTag || 'Produk';
        const img = card.dataset.productImg || card.querySelector('img')?.src || '';
        const priceNum = parseInt(price.replace(/\D/g, '')) || 0;

        currentProduct = { name, priceNum, img };
        modalQty = 1;

        document.getElementById('pm-img').src = img;
        document.getElementById('pm-name').textContent = name;
        document.getElementById('pm-price').textContent = fmt(priceNum);
        document.getElementById('pm-desc').textContent = desc;
        document.getElementById('pm-tag').textContent = tag;
        document.getElementById('pm-qty').textContent = '1';

        prodModal.classList.add('show');
      });
    });
  }

  /* ─────────────────────────────────────────────
     10. FIX BROKEN IMAGES
  ───────────────────────────────────────────── */
  function fixBrokenImages() {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', function() {
        // already handled by each page's fallback
      }, { once: true });
    });
  }

  /* ─────────────────────────────────────────────
     11. INIT
  ───────────────────────────────────────────── */
  function init() {
    injectCartBtn();
    attachProductCards();
    fixBrokenImages();
    updateCartUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
