import { CONFIG } from './config.js';
import { DOM } from './dom.js';

export const Products = {
    updateProductsStatus(message, isLoading = false) {
        const grid = DOM.productsGrid();
        if (!grid) return;
        
        if (isLoading) {
            grid.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                    <p class="mt-2 text-gray-500">${message}</p>
                </div>`;
        } else {
            grid.innerHTML = `<p class="col-span-full text-center py-20 text-gray-500">${message}</p>`;
        }
    },
     // Create product card element
    createProductCard(product) {
        const div = document.createElement("div");
        div.className = "product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
        div.dataset.barcode = product.barcode;
        
        const grade = product.nutritionGrade?.toLowerCase() || 'unknown';
        const scoreStyle = CONFIG.NUTRI_SCORE_STYLES[grade] || { bg: 'bg-gray-400', text: 'Nutri-Score ?' };
        const novaBg = CONFIG.NOVA_COLORS[product.novaGroup] || 'bg-gray-400';
        
        div.innerHTML = `
            <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${product.image || 'https://via.placeholder.com/400x400?text=No+Image'}"
                    alt="${product.name}" loading="lazy" />
                <div class="absolute top-2 left-2 ${scoreStyle.bg} text-white text-[10px] font-bold px-2 py-1 rounded uppercase">${scoreStyle.text}</div>
                <div class="absolute top-2 right-2 ${novaBg} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    title="NOVA ${product.novaGroup || 'Unknown'}">${product.novaGroup || '?'}</div>
            </div>
            <div class="p-4">
                <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand || 'Generic'}</p>
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${product.name}</h3>
                <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span><i class="fa-solid fa-barcode mr-1"></i>${product.barcode}</span>
                    <span><i class="fa-solid fa-fire mr-1"></i>${product.nutrients?.calories || 0} kcal/100g</span>
                </div>
                <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                        <p class="text-xs font-bold text-emerald-700">${product.nutrients?.protein || 0}g</p>
                        <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                        <p class="text-xs font-bold text-blue-700">${product.nutrients?.carbs || 0}g</p>
                        <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                        <p class="text-xs font-bold text-purple-700">${product.nutrients?.fat || 0}g</p>
                        <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                        <p class="text-xs font-bold text-orange-700">${product.nutrients?.sugar || 0}g</p>
                        <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                </div>
            </div>
        `;
        
        return div;
    },
     // Render products list
    renderProducts(data, queryText) {
        const grid = DOM.productsGrid();
        const countText = DOM.productsCountText();
        if (!grid) return;
        if (data.results && data.results.length > 0) {
            grid.innerHTML = "";
            if (countText) {
                countText.textContent = `Found ${data.pagination?.total || data.results.length} products`;
            }
            data.results.forEach(product => grid.appendChild(this.createProductCard(product)));
        } else {
            this.updateProductsStatus(`No products found for "${queryText}".`);
            if (countText) {
                countText.textContent = "0 products found";
            }
        }
    },

     // Fetch products by search query
    async fetchProducts(query, queryText) {
        try {
            this.updateProductsStatus(`Searching for ${queryText}...`, true);
            const res = await fetch(`${CONFIG.API_BASE}/products/search?q=${encodeURIComponent(query)}&page=1&limit=24`);
            const data = await res.json();
            this.renderProducts(data, queryText);
        } catch (err) {
            const grid = DOM.productsGrid();
            if (grid) {
                grid.innerHTML = `<p class="col-span-full text-center py-20 text-red-500">Error connecting to the scanner service.</p>`;
            }
        }
    },
      // Fetch product by barcode
     
    async fetchProductByBarcode(barcode) {
        try {
            this.updateProductsStatus(`Scanning Barcode: ${barcode}...`, true);
            const res = await fetch(`${CONFIG.API_BASE}/products/barcode/${barcode}`);
            const data = await res.json();
            const grid = DOM.productsGrid();
            const countText = DOM.productsCountText();
            
            if (data?.result && grid) {
                grid.innerHTML = "";
                if (countText) {
                    countText.textContent = `Found product for barcode: ${barcode}`;
                }
                grid.appendChild(this.createProductCard(data.result));
            } else {
                this.updateProductsStatus(`No product found with barcode "${barcode}".`);
                if (countText) {
                    countText.textContent = "0 products found";
                }
            }
        } catch (err) {
            const grid = DOM.productsGrid();
            if (grid) {
                grid.innerHTML = `<p class="col-span-full text-center py-20 text-red-500">Error connecting to the barcode service.</p>`;
            }
        }
    },
     // Fetch products by category
    
    async fetchProductsByCategory(categorySlug, categoryName) {
        try {
            this.updateProductsStatus(`Loading ${categoryName} products...`, true);
            const res = await fetch(`${CONFIG.API_BASE}/products/category/${categorySlug}?page=1&limit=24`);
            const data = await res.json();
            const grid = DOM.productsGrid();
            const countText = DOM.productsCountText();
            
            if (data.results && data.results.length > 0 && grid) {
                grid.innerHTML = "";
                if (countText) {
                    countText.textContent = `Found ${data.pagination?.total || data.results.length} products`;
                }
                data.results.forEach(product => grid.appendChild(this.createProductCard(product)));
            } else {
                this.updateProductsStatus(`No products found in "${categoryName}"`);
                if (countText) {
                    countText.textContent = "0 products found";
                }
            }
        } catch (err) {
            const grid = DOM.productsGrid();
            if (grid) {
                grid.innerHTML = `<p class="col-span-full text-center py-20 text-red-500">Failed to load ${categoryName} products</p>`;
            }
        }
    },

     // Load product categories
    async loadProductCategories() {
        const container = DOM.productCategories();
        if (!container) return;
        
        try {
            const res = await fetch(`${CONFIG.API_BASE}/products/categories?page=1&limit=20`);
            const data = await res.json();
            container.innerHTML = "";
            
            data.results.forEach((cat, index) => {
                const slug = cat.id.replace("en:", "");
                const color = CONFIG.PRODUCT_CATEGORY_COLORS[index % CONFIG.PRODUCT_CATEGORY_COLORS.length];
                const icon = CONFIG.PRODUCT_CATEGORY_ICONS[slug] ||
                    CONFIG.PRODUCT_CATEGORY_ICONS[slug.split("-")[0]] ||
                    CONFIG.PRODUCT_CATEGORY_ICONS.default;
                const btn = document.createElement("button");
                btn.className = `product-category-btn px-4 py-2 bg-${color}-100 text-${color}-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-${color}-200 transition-all`;
                btn.innerHTML = `<i class="fa-solid ${icon} mr-1.5"></i>${cat.name}`;
            
                btn.addEventListener("click", () => {
                    container.querySelectorAll("button").forEach(b =>
                        b.classList.remove("ring-2", "ring-offset-2", "ring-emerald-500")
                    );
                    btn.classList.add("ring-2", "ring-offset-2", "ring-emerald-500");
                    
                    const searchInput = DOM.productSearchInput();
                    if (searchInput) searchInput.value = cat.name;
                    
                    this.fetchProductsByCategory(slug, cat.name);
                });
                
                container.appendChild(btn);
            });
        } catch (err) {
            container.innerHTML = `<p class="text-sm text-gray-500">Failed to load categories</p>`;
        }
    },
    initializeProductSearch() {
        const searchBtn = document.getElementById("search-product-btn");
        const barcodeBtn = document.getElementById("lookup-barcode-btn");
        const productSearchInput = DOM.productSearchInput();
        const barcodeInput = DOM.barcodeInput();
        
        if (searchBtn && productSearchInput) {
            searchBtn.addEventListener("click", () => {
                const query = productSearchInput.value.trim();
                if (query) this.fetchProducts(query, query);
            });
        }
        
        if (barcodeBtn && barcodeInput) {
            barcodeBtn.addEventListener("click", () => {
                const code = barcodeInput.value.trim();
                if (code) this.fetchProductByBarcode(code);
            });
        }
        
        [productSearchInput, barcodeInput].forEach(input => {
            if (input) {
                input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        const btnId = input.id === "product-search-input" 
                            ? "search-product-btn" 
                            : "lookup-barcode-btn";
                        const btn = document.getElementById(btnId);
                        if (btn) btn.click();
                    }
                });
            }
        });
    },

    /**
     * Initialize Nutri-Score filter buttons
     */
    initializeNutriScoreFilter() {
        setTimeout(() => {
            const filterButtons = document.querySelectorAll('.nutri-score-filter');
            
            filterButtons.forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', () => {
                    const grade = newBtn.dataset.grade;
                    const productSearchInput = DOM.productSearchInput();
                    const query = productSearchInput?.value || "beverages";
                    
                    document.querySelectorAll('.nutri-score-filter').forEach(b => {
                        b.classList.remove('ring-2', 'ring-offset-2', 'ring-emerald-500');
                    });
                    
                    newBtn.classList.add('ring-2', 'ring-offset-2', 'ring-emerald-500');
                    
                    if (!grade || grade === '') {
                        this.fetchProducts(query, query);
                    } else {
                        const url = `${CONFIG.API_BASE}/products/search?q=${encodeURIComponent(query)}&nutritionGrade=${grade}&page=1&limit=24`;
                        this.updateProductsStatus(`Filtering by Nutri-Score ${grade.toUpperCase()}...`, true);
                        
                        fetch(url)
                            .then(res => res.json())
                            .then(data => {
                                this.renderProducts(data, `Nutri-Score ${grade.toUpperCase()}`);
                            })
                            .catch(err => {
                                console.error('Filter error:', err);
                                const grid = DOM.productsGrid();
                                if (grid) {
                                    grid.innerHTML = `<p class="col-span-full text-center py-20 text-red-500">Error filtering products.</p>`;
                                }
                            });
                    }
                });
            });
        }, 500);
    }
};