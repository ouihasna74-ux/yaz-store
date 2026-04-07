// cart.js - Handles Cart page display and checkout

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartItemsContainer) {
        if (typeof requireAuth === 'function') {
            requireAuth(); // Ensure user is logged in to view their cart
        }

        const renderCart = () => {
            let cart = [];
            try {
                const storedCart = localStorage.getItem('ecommerce_cart');
                cart = storedCart ? JSON.parse(storedCart) : [];
                if (!Array.isArray(cart)) cart = [];
            } catch (e) {
                console.error("Error parsing cart:", e);
                cart = [];
            }

            cartItemsContainer.innerHTML = '';
            const orderFormNode = document.getElementById('orderForm');
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="text-muted" style="text-align:center; padding: 2rem;">Your cart is empty.</p>';
                if (cartTotalElement) cartTotalElement.textContent = '0.00 DA';
                if (checkoutBtn) checkoutBtn.disabled = true;
                if (orderFormNode) orderFormNode.style.display = 'none';
                return;
            }

            let total = 0;
            if (checkoutBtn) checkoutBtn.disabled = false;
            if (orderFormNode) orderFormNode.style.display = 'block';

            cart.forEach((item, index) => {
                const price = parseFloat(item.price) || 0;
                total += price;
                
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name || 'Product'}" class="cart-item-img">
                        <div>
                            <h4>${item.name || 'Unknown Product'}</h4>
                            <p class="text-muted">${item.category || 'General'}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <span style="font-weight: 600;">${price.toFixed(2)} DA</span>
                        <button class="btn remove-btn" data-index="${index}" style="background-color: var(--error); color: white; padding: 0.5rem 1rem;">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            });

            if (cartTotalElement) cartTotalElement.textContent = `${total.toFixed(2)} DA`;

            // Add remove listeners
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    cart.splice(idx, 1);
                    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
                    renderCart();
                    if(typeof updateCartBadge === 'function') updateCartBadge();
                });
            });
        };

        const renderUserOrders = () => {
            const tbody = document.getElementById('userOrdersTable');
            if (!tbody) return;

            let orders = [];
            try {
                const storedOrders = localStorage.getItem('ecommerce_orders');
                orders = storedOrders ? JSON.parse(storedOrders) : [];
                if (!Array.isArray(orders)) orders = [];
            } catch (e) {
                console.error("Error parsing orders:", e);
                orders = [];
            }

            const activeUserStr = localStorage.getItem('ecommerce_active_user');
            let userEmail = 'guest';
            try {
                if (activeUserStr) {
                    const activeUser = JSON.parse(activeUserStr);
                    userEmail = activeUser ? activeUser.email : 'guest';
                }
            } catch (e) {
                console.error("Error parsing active user:", e);
            }

            const userOrders = orders.filter(o => o.customer && o.customer.email === userEmail);
            tbody.innerHTML = '';

            if (userOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">You have not placed any orders yet.</td></tr>';
                return;
            }

            // Reverse to show newest first
            [...userOrders].reverse().forEach(order => {
                const itemsList = Array.isArray(order.items) ? order.items : [];
                const itemNames = itemsList.map(i => i.name || 'Unknown').join(', ');
                const date = order.date ? new Date(order.date).toLocaleDateString() : 'N/A';
                
                let statusHtml = '<span style="color: #f39c12; font-weight: 600;">Pending Confirmation</span>';
                if (order.status === 'Delivered') {
                    statusHtml = '<span style="color: #2ecc71; font-weight: 600;">Confirmed & Delivered</span>';
                }

                const totalValue = parseFloat(order.total) || 0;

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid var(--border-color)';
                tr.innerHTML = `
                    <td style="padding: 1rem;"><strong>${order.id || 'N/A'}</strong></td>
                    <td style="padding: 1rem;" class="text-muted">${date}</td>
                    <td style="padding: 1rem; max-width: 250px;">${itemNames}</td>
                    <td style="padding: 1rem;"><strong>${totalValue.toFixed(2)} DA</strong></td>
                    <td style="padding: 1rem;">${statusHtml}</td>
                `;
                tbody.appendChild(tr);
            });
        };

        renderCart();
        renderUserOrders();

        // Checkout process
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameNode = document.getElementById('orderName');
                const phoneNode = document.getElementById('orderPhone');
                const locationNode = document.getElementById('orderLocation');
                
                if (!nameNode || !phoneNode || !locationNode) {
                    console.error("One or more order form elements are missing.");
                    return;
                }

                const name = nameNode.value;
                const phone = phoneNode.value;
                const location = locationNode.value;
                
                // Get current cart items to save with the order
                let cart = [];
                try {
                    cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];
                } catch(e) { cart = []; }

                if (cart.length === 0) {
                    if (typeof showToast === 'function') showToast("Your cart is empty!");
                    return;
                }

                let total = 0;
                cart.forEach(item => total += (parseFloat(item.price) || 0));

                const activeUserStr = localStorage.getItem('ecommerce_active_user');
                let userEmail = 'guest';
                try {
                    if (activeUserStr) {
                        const activeUser = JSON.parse(activeUserStr);
                        userEmail = activeUser ? activeUser.email : 'guest';
                    }
                } catch(e) {}

                const order = {
                    id: 'ORD' + Date.now(),
                    date: new Date().toISOString(),
                    customer: { name, phone, location, email: userEmail },
                    items: cart,
                    total: total,
                    status: 'Pending'
                };

                // Save to orders array
                let orders = [];
                try {
                    orders = JSON.parse(localStorage.getItem('ecommerce_orders')) || [];
                } catch(e) { orders = []; }
                
                orders.push(order);
                localStorage.setItem('ecommerce_orders', JSON.stringify(orders));

                // Clear cart
                localStorage.removeItem('ecommerce_cart');
                renderCart();
                renderUserOrders();
                if(typeof updateCartBadge === 'function') updateCartBadge();
                if(typeof showToast === 'function') showToast("Order confirmed! We will contact you soon.");
                orderForm.reset();
            });
        }
    }
});

