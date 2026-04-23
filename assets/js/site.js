
(() => {
  const productCatalog = {
    creamcrew: { id: 'creamcrew', name: 'Cream Full Logo Crew', price: 58, image: 'assets/images/cream_full_logo_crewneck.png' },
    blackcrew: { id: 'blackcrew', name: 'Black Full Logo Crew', price: 58, image: 'assets/images/black_full_logo_crewneck.png' },
    bluecrew: { id: 'bluecrew', name: 'Carolina Blue Full Logo Crew', price: 58, image: 'assets/images/carolina_blue_full_logo_crewneck.png' },
    fittedtee: { id: 'fittedtee', name: 'Define Yourself Fitted Tee', price: 36, image: 'assets/images/pink_define_yourself_fitted_tee.png' },
    shorts: { id: 'shorts', name: 'Luv the Game Shorts', price: 34, image: 'assets/images/carolina_blue_luv_the_game_shorts.png' },
    sweatpants: { id: 'sweatpants', name: 'Play with Heart Sweatpants', price: 52, image: 'assets/images/cream_play_with_heart_sweatpants.png' }
  };

  const money = value => `$${value.toFixed(2)}`;
  const cartKey = 'weluvlax_cart';
  const getCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]');
  const setCart = cart => localStorage.setItem(cartKey, JSON.stringify(cart));

  function updateCartCount() {
    const total = getCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = total);
  }

  function addToCart(id, qty = 1, meta = {}) {
    const cart = getCart();
    const found = cart.find(item => item.id === id && item.size === (meta.size || ''));
    if (found) {
      found.qty += qty;
    } else {
      cart.push({ id, qty, size: meta.size || '' });
    }
    setCart(cart);
    updateCartCount();
    renderCart();
    openCart();
  }

  function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
    updateCartCount();
    renderCart();
  }

  function renderCart() {
    const wrap = document.querySelector('[data-cart-items]');
    const totalEl = document.querySelector('[data-cart-total]');
    if (!wrap || !totalEl) return;
    const cart = getCart();
    wrap.innerHTML = '';
    let total = 0;
    if (!cart.length) {
      wrap.innerHTML = '<div class="cart-item"><div class="cart-item-name">Your cart is empty</div><div class="cart-subtle">Add a few favorites to bring the store flow to life.</div></div>';
      totalEl.textContent = money(0);
      return;
    }
    cart.forEach((item, index) => {
      const product = productCatalog[item.id];
      if (!product) return;
      total += product.price * item.qty;
      const node = document.createElement('div');
      node.className = 'cart-item';
      node.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div>
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-subtle">${item.size ? `Size ${item.size} · ` : ''}Qty ${item.qty}</div>
          <div class="cart-subtle">${money(product.price)}</div>
        </div>
        <button class="cart-remove" type="button" data-remove-index="${index}">Remove</button>
      `;
      wrap.appendChild(node);
    });
    totalEl.textContent = money(total);
    wrap.querySelectorAll('[data-remove-index]').forEach(btn => btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.removeIndex))));
  }

  function openCart() {
    document.querySelector('[data-cart-drawer]')?.classList.add('open');
    document.querySelector('[data-cart-backdrop]')?.classList.add('open');
  }
  function closeCart() {
    document.querySelector('[data-cart-drawer]')?.classList.remove('open');
    document.querySelector('[data-cart-backdrop]')?.classList.remove('open');
  }

  function initCart() {
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.addToCart;
        const qtyInput = document.querySelector('[data-qty-input]');
        const sizeInput = document.querySelector('.size-chip.active');
        const qty = qtyInput ? Math.max(1, Number(qtyInput.value || 1)) : 1;
        const size = sizeInput ? sizeInput.dataset.size : '';
        addToCart(id, qty, { size });
      });
    });
    document.querySelectorAll('[data-open-cart]').forEach(btn => btn.addEventListener('click', openCart));
    document.querySelectorAll('[data-close-cart]').forEach(btn => btn.addEventListener('click', closeCart));
    document.querySelector('[data-cart-backdrop]')?.addEventListener('click', closeCart);
    document.querySelector('[data-demo-checkout]')?.addEventListener('click', () => alert((window.WELUVLAX_CONFIG && window.WELUVLAX_CONFIG.checkoutMessage) || 'Connect your checkout when ready.'));
    renderCart();
    updateCartCount();
  }

  function initReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
      });
    }, { threshold: 0.15 });
    items.forEach(item => observer.observe(item));
  }

  function initFilters() {
    const pills = document.querySelectorAll('[data-filter]');
    const cards = document.querySelectorAll('[data-category]');
    if (!pills.length || !cards.length) return;
    pills.forEach(pill => pill.addEventListener('click', () => {
      pills.forEach(el => el.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      cards.forEach(card => {
        card.classList.toggle('hidden', !(filter === 'all' || card.dataset.category === filter));
      });
    }));
  }

  function initSizes() {
    document.querySelectorAll('.size-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  }

  function initEmailForms() {
    document.querySelectorAll('[data-email-signup]').forEach(form => {
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (!input || !input.value) return;
        const endpoint = (window.WELUVLAX_CONFIG && window.WELUVLAX_CONFIG.emailEndpoint || '').trim();
        if (!endpoint) {
          alert('Your form is styled and ready. Add your email platform endpoint in assets/js/config.js when you want to make this live.');
          form.reset();
          return;
        }
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: input.value, source: 'WeLuvLax site' })
          });
          alert('Thanks for joining the list.');
          form.reset();
        } catch (error) {
          alert('The form looks connected, but the endpoint did not respond. Check assets/js/config.js.');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCart();
    initReveals();
    initFilters();
    initSizes();
    initEmailForms();
  });
})();
