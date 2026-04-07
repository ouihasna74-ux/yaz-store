// store.js - Logic for Products, Filtering, and Displaying

// Default dummy products setup
const defaultProducts = [
    { id: 1, name: "Wireless Headphones", price: 99.99, category: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" },
    { id: 2, name: "Smart Watch", price: 149.99, category: "electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80" },
    { id: 3, name: "Running Sneakers", price: 89.50, category: "clothing", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" },
    { id: 4, name: "Coffee Maker", price: 59.99, category: "home", image: "https://images.unsplash.com/photo-1520188740392-6f29fbde82e5?auto=format&fit=crop&w=400&q=80" },
    { id: 5, name: "Leather Backpack", price: 120.00, category: "clothing", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80" },
    { id: 6, name: "Desk Lamp", price: 35.00, category: "home", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80" }
];

// Initialize products in local storage if not exist
function initProducts() {
    if (!localStorage.getItem('ecommerce_products')) {
        localStorage.setItem('ecommerce_products', JSON.stringify(defaultProducts));
    }
}

// Get all products
function getProducts() {
    return JSON.parse(localStorage.getItem('ecommerce_products')) || [];
}

// Add a new product
function addProduct(product) {
    const products = getProducts();
    // generate simple id
    product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push(product);
    localStorage.setItem('ecommerce_products', JSON.stringify(products));
}

// Delete a product
window.deleteProduct = function(productId) {
    let products = getProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('ecommerce_products', JSON.stringify(products));
    
    // If on admin page, refresh the table
    if (typeof renderAdminProducts === 'function') {
        renderAdminProducts();
    }
    
    if (typeof showToast === 'function') {
        showToast('Product deleted successfully');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initProducts();

    // Render Logic for Store (index.html)
    const productGrid = document.getElementById('productGrid');

    if (productGrid) {
        const renderProducts = (productsToRender) => {
            productGrid.innerHTML = '';
            if (productsToRender.length === 0) {
                productGrid.innerHTML = '<p class="text-muted">No products found.</p>';
                return;
            }

            productsToRender.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                    <div class="product-content">
                        <span class="product-category">${product.category}</span>
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${Number(product.price).toFixed(2)} DA</p>
                        <button class="btn btn-primary btn-block add-to-cart-btn" data-id="${product.id}">Order</button>
                    </div>
                `;
                productGrid.appendChild(card);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    addToCart(id);
                });
            });
        };

        // Initial render
        let currentProducts = getProducts();
        renderProducts(currentProducts);

        // Filtering
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        const applyFilters = () => {
            let filtered = getProducts();

            // Apply category
            if (categoryFilter.value !== 'all') {
                filtered = filtered.filter(p => p.category === categoryFilter.value);
            }

            // Apply sort
            if (sortFilter.value === 'low-high') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (sortFilter.value === 'high-low') {
                filtered.sort((a, b) => b.price - a.price);
            }

            renderProducts(filtered);
        };

        categoryFilter.addEventListener('change', applyFilters);
        sortFilter.addEventListener('change', applyFilters);
    }

    // Logic for admin page products table
    const adminProductTable = document.getElementById('adminProductTable');
    if (adminProductTable) {
        window.renderAdminProducts = () => {
            const prods = getProducts();
            adminProductTable.innerHTML = '';
            if (prods.length === 0) {
                adminProductTable.innerHTML = '<tr><td colspan="5" style="padding: 1rem; text-align: center; color: var(--text-muted);">No products found.</td></tr>';
                return;
            }
            prods.forEach(p => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid var(--border-color)";
                tr.innerHTML = `
                    <td style="padding: 1rem;">${p.id}</td>
                    <td style="padding: 1rem;"><img src="${p.image}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);"></td>
                    <td style="padding: 1rem; font-weight: 500;">${p.name}</td>
                    <td style="padding: 1rem; color: var(--primary);">${Number(p.price).toFixed(2)} DA</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-admin-delete" style="background-color: var(--error); color: white; padding: 0.4rem 0.8rem; font-size: 0.875rem;" data-id="${p.id}">Delete</button>
                    </td>
                `;
                adminProductTable.appendChild(tr);
            });

            // Add delete listeners
            document.querySelectorAll('.btn-admin-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    if (confirm('Are you sure you want to delete this product?')) {
                        deleteProduct(id);
                    }
                });
            });
        };
        renderAdminProducts();
    }

    // Logic for add-product.html
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const price = parseFloat(document.getElementById('price').value);
            const category = document.getElementById('category').value;
            const imageInput = document.getElementById('image');
            const file = imageInput.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imageBase64 = event.target.result;
                    addProduct({ name, price, category, image: imageBase64 });
                    showToast("Product added successfully!");

                    if (typeof renderAdminProducts === 'function') {
                        renderAdminProducts();
                    }

                    // clear form
                    addProductForm.reset();
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Cart helper using global 'addToCart' so it can be called inside renderProducts
window.addToCart = function (productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (product) {
        const cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];
        cart.push(product);
        localStorage.setItem('ecommerce_cart', JSON.stringify(cart));

        // Show notification or update badge
        if (typeof showToast === 'function') {
            showToast(`${product.name} added to your orders!`);
        }
        updateCartBadge();
    }
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(b => {
        b.textContent = cart.length;
    });
}

// Call on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
