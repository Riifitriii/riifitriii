document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    let allProducts = [];

    // Hanya jalankan fetch product kalau di index.html
    const isHomePage = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === '/Riifitriii-Store/' || location.pathname.includes('dashboard');
    
    if (isHomePage) {
        fetch('https://fakestoreapi.com/products')
            .then(response => response.json())
            .then(data => {
                allProducts = data;
                displayProducts(data);
                loadCartFromCookie();
            })
            .catch(error => console.error('Error fetching products:', error));
    } else {
        loadCartFromCookie();
    }

    function displayProducts(products) {
        const productList = document.getElementById('product-list');
        if (!productList) return;

        productList.innerHTML = '';

        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <h2>${product.title}</h2>
                <img src="${product.image}" alt="${product.title}" width="100">
                <p>Price: $${product.price}</p>
                <p>Stock: ${product.rating.count}</p>
                <button ${product.rating.count === 0 ? 'disabled' : ''} onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            productList.appendChild(productDiv);
        });
    }

    window.addToCart = function(productId) {
        fetch(`https://fakestoreapi.com/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                if (product.rating.count > 0) {
                    const cartItem = cart.find(item => item.id === productId);
                    if (cartItem) {
                        cartItem.quantity++;
                    } else {
                        cart.push({ ...product, quantity: 1 });
                    }
                    product.rating.count--;
                    displayProducts(allProducts);
                    updateCartDisplay();
                    saveCartToCookie();
                } else {
                    alert('Product out of stock.');
                }
            })
            .catch(error => console.error('Error adding product to cart:', error));
    }

    function updateCartDisplay() {
        const cartList = document.getElementById('cart-list');
        const cartCount = document.getElementById('cart-count');
        let totalQuantity = 0;
        let totalPrice = 0;

        if (cartList) {
            cartList.innerHTML = '';
            cart.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.title} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
                cartList.appendChild(li);
                totalQuantity += item.quantity;
                totalPrice += item.price * item.quantity;
            });
        }

        document.getElementById('total-price')?.textContent = totalPrice.toFixed(2);
        if (cartCount) cartCount.textContent = totalQuantity;
    }

    function saveCartToCookie() {
        document.cookie = `cart=${JSON.stringify(cart)}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }

    function loadCartFromCookie() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('cart='));
        if (cookie) {
            try {
                cart = JSON.parse(cookie.split('=')[1]);
                updateCartDisplay();
            } catch (e) {
                console.error('Error parsing cart cookie:', e);
            }
        }
    }

    function toggleCart() {
        const cartSection = document.querySelector('aside');
        cartSection?.classList.toggle('show');
    }

    function displayReceipt() {
        const receiptList = document.getElementById('receipt-list');
        const totalPriceElement = document.getElementById('total-price');
        let totalPrice = 0;

        if (!receiptList || !totalPriceElement) return;

        receiptList.innerHTML = '';
        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.title} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            receiptList.appendChild(li);
            totalPrice += item.price * item.quantity;
        });

        totalPriceElement.textContent = totalPrice.toFixed(2);
    }

    // Jalankan displayReceipt jika halaman adalah struk.html
    if (window.location.pathname.includes('struk.html')) {
        loadCartFromCookie();
        displayReceipt();
    }

    // Filter produk
    document.getElementById('search-bar')?.addEventListener('input', function (event) {
        const query = event.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(product => product.title.toLowerCase().includes(query));
        displayProducts(filteredProducts);
    });

    // Sort produk
    document.getElementById('sort-dropdown')?.addEventListener('change', function (event) {
        const sortOption = event.target.value;
        let sortedProducts = [...allProducts];

        switch (sortOption) {
            case 'price-asc':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'title-asc':
                sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
        displayProducts(sortedProducts);
    });

    // Login form
    document.getElementById('login-form')?.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Username dan password wajib diisi.');
            return;
        }

        // Simpan ke cookie
        document.cookie = `user=${username}; path=/; max-age=${60 * 60 * 24 * 7}`;
        alert(`Selamat datang, ${username}!`);
        window.location.href = 'index.html'; // Ganti ke dashboard jika kamu pakai file lain
    });

    // Register form
    document.getElementById('register-form')?.addEventListener('submit', function (event) {
        event.preventDefault();
        const fullname = document.getElementById('fullname').value;
        const newUsername = document.getElementById('new-username').value;
        const newPassword = document.getElementById('new-password').value;
        const whatsapp = document.getElementById('whatsapp').value;

        if (!fullname || !newUsername || !newPassword || !whatsapp) {
            alert('Semua kolom wajib diisi.');
            return;
        }

        // Simulasi register: langsung redirect ke login
        alert(`Pendaftaran berhasil. Silakan login, ${newUsername}`);
        window.location.href = 'login.html';
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', function () {
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        alert('Anda telah logout.');
        window.location.href = 'login.html';
    });

    // Cek user login (hanya untuk halaman utama/dashboard)
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const user = document.cookie.split('; ').find(row => row.startsWith('user='));
        if (!user) {
            alert('Silakan login terlebih dahulu.');
            window.location.href = 'login.html';
        }
    }
});
