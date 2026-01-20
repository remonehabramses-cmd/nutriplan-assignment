import { CONFIG } from './config.js';
import { DOM } from './dom.js';
import { Utils } from './utils.js';

export const Meals = {
    // Highlight selected category 
    highlightSelectedCategory(selectedDiv) {
        document.querySelectorAll(".category-card").forEach(card =>
            card.classList.remove("ring-2", "ring-emerald-500")
        );
        selectedDiv.classList.add("ring-2", "ring-emerald-500");
    },
    // Highlight selected area/cuisine

    highlightSelectedArea(selectedBtn) {
        const container = DOM.areasContainer();
        if (!container) return;
        container.querySelectorAll("button").forEach(btn => {
            btn.className = "px-6 py-3 bg-gray-100 text-gray-700 rounded-full text-base font-medium hover:bg-gray-200 transition whitespace-nowrap";
        });
        selectedBtn.className = "px-8 py-3 bg-emerald-600 text-white rounded-full text-base font-medium hover:bg-emerald-700 transition whitespace-nowrap";
    },
    // Update meal status message
    updateMealStatus(message) {
        const container = DOM.mealsContainer();
        const count = DOM.recipesCount();

        if (container) {
            container.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500">${message}</p>`;
        }
        if (count) {
            count.textContent = message;
        }
    },

    //Create category card element
    createCategoryCard(category) {
        const iconClass = CONFIG.CATEGORY_ICONS[category.name] || "fa-bone";
        const style = Utils.getCategoryClasses(category.name);
        const div = document.createElement("div");
        div.setAttribute("tabindex", "-1");
        div.dataset.category = category.name;
        div.className = `category-card min-h-[80px] px-4 py-4 flex items-center rounded-xl cursor-pointer border transition-all duration-200 hover:shadow-sm active:scale-[0.97] select-none outline-none ring-0 group ${style.border} ${style.bg}`;
        div.innerHTML = `
            <div class="flex items-center gap-4 w-full">
                <div class="w-11 h-11 flex items-center justify-center rounded-lg ${style.icon} transition-transform duration-200 group-hover:scale-105">
                    <i class="fa-solid ${iconClass} text-base"></i>
                </div>
                <h3 class="text-base font-medium ${style.text}">${category.name}</h3>
            </div>
        `;
        div.addEventListener("click", () => {
            this.highlightSelectedCategory(div);
            this.fetchMealsByCategory(category.name);
        });
        return div;
    },
    // Create meal card 
    createMealCard(meal) {
        const div = document.createElement("div");
        div.className = "recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
        div.dataset.mealId = meal.id;
        const preview = Utils.getInstructionPreview(meal.instructions);
        div.innerHTML = `
            <div class="relative h-48 overflow-hidden">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
                <div class="absolute bottom-3 left-3 flex gap-2">
                    <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.category}</span>
                    <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${meal.area}</span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2 italic">"${preview}"</p>
                <div class="flex items-center justify-between text-xs pt-1">
                    <span class="font-semibold text-gray-900">
                        <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category}
                    </span>
                    <span class="font-semibold text-gray-500">
                        <i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.area}
                    </span>
                </div>
            </div>
        `;
        div.addEventListener("click", () => this.fetchMealById(meal.id));
        return div;
    },

    // Render meals list "Displays all meal cards on page"
    renderMeals(data) {
        const container = DOM.mealsContainer();
        const countEl = DOM.recipesCount();
        if (!container) return;
        container.innerHTML = "";
        const count = data.results?.length || 0;

        if (countEl) {
            countEl.textContent = `Showing ${count} recipe${count !== 1 ? "s" : ""}`;
        }
        if (!count) {
            container.innerHTML = "<p class='col-span-full text-center py-10 text-gray-500'>No meals found.</p>";
            return;
        }
        data.results.forEach(meal => container.appendChild(this.createMealCard(meal)));
    },
     // Load categories from API
    async loadCategories() {
        try {
            const res = await fetch(`${CONFIG.API_BASE}/meals/categories`);
            const data = await res.json();
            const container = DOM.categoriesContainer();
            if (!container) return;
            data.results.forEach((category, index) => {
                const div = this.createCategoryCard(category);
                container.appendChild(div);
                if (index === 0) div.click();
            });
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    },
     // Load areas/cuisines from API
    async loadAreas() {
        try {
            const res = await fetch(`${CONFIG.API_BASE}/meals/areas`);
            const data = await res.json();
            const container = DOM.areasContainer();
            if (!container) return;
            container.innerHTML = "";
            const allBtn = document.createElement("button");
            allBtn.className = "px-8 py-3 bg-emerald-600 text-white rounded-full text-base font-medium hover:bg-emerald-700 transition whitespace-nowrap";
            allBtn.textContent = "All Cuisines";
            container.appendChild(allBtn);
            allBtn.addEventListener("click", () => {
                this.highlightSelectedArea(allBtn);
                const firstCategory = document.querySelector(".category-card");
                if (firstCategory) firstCategory.click();
            });

            data.results.forEach(area => {
                const btn = document.createElement("button");
                btn.className = "px-6 py-3 bg-gray-100 text-gray-700 rounded-full text-base font-medium hover:bg-gray-200 transition whitespace-nowrap";
                btn.textContent = area.name;
                container.appendChild(btn);
                btn.addEventListener("click", () => {
                    this.highlightSelectedArea(btn);
                    this.fetchMealsByArea(area.name);
                });
            });
        } catch (err) {
            console.error("Failed to load areas", err);
        }
    },
     // Fetch meals by category
    async fetchMealsByCategory(categoryName) {
        try {
            this.updateMealStatus("Loading meals...");
            const res = await fetch(`${CONFIG.API_BASE}/meals/filter?category=${encodeURIComponent(categoryName)}&page=1&limit=25`);
            const data = await res.json();
            this.renderMeals(data);
        } catch {
            this.updateMealStatus("Error loading meals.");
        }
    },
     // Fetch meals by area/cuisine
    async fetchMealsByArea(areaName) {
        try {
            this.updateMealStatus("Loading meals...");
            const res = await fetch(`${CONFIG.API_BASE}/meals/filter?area=${encodeURIComponent(areaName)}&page=1&limit=25`);
            const data = await res.json();
            this.renderMeals(data);
        } catch {
            this.updateMealStatus("Error loading meals.");
        }
    },
      // Search meals by query
    async fetchMealsBySearch(query) {
        try {
            this.updateMealStatus("Searching recipes...");
            const res = await fetch(`${CONFIG.API_BASE}/meals/search?q=${encodeURIComponent(query)}&page=1&limit=25`);
            const data = await res.json();
            this.renderMeals(data);
        } catch {
            this.updateMealStatus("Error searching meals.");
        }
    },
      // Fetch single meal by ID
    async fetchMealById(mealId) {
        try {
            const res = await fetch(`${CONFIG.API_BASE}/meals/${mealId}`);
            const data = await res.json();
            if (data?.result) this.renderMealDetails(data.result);
        } catch (err) {
            console.error(err);
        }
    },
      // Render meal details page
    renderMealDetails(meal) {
        const header = DOM.headerSection();
        const filters = DOM.searchFiltersSection();
        const recipes = DOM.allRecipesSection();
        const categoriesContainer = DOM.categoriesContainer();
        const areasContainer = DOM.areasContainer();
        const mealsContainer = DOM.mealsContainer();
        const details = DOM.mealDetailsSection();
        const categoriesSection = DOM.categoriesSection();

        // Hide meal list sections
        if (header) header.style.display = "none";
        if (filters) filters.style.display = "none";
        if (recipes) recipes.style.display = "none";
        if (categoriesContainer) categoriesContainer.style.display = "none";
        if (areasContainer) areasContainer.style.display = "none";
        if (mealsContainer) mealsContainer.style.display = "none";

        // Update section headers
        if (categoriesSection) {
            const h2 = categoriesSection.querySelector("h2");
            const p = categoriesSection.querySelector("p");
            if (h2) h2.textContent = "Recipe Details";
            if (p) p.textContent = "View full recipe information and nutrition facts";
        }

        // Show details
        if (details) details.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (details) {
            const img = details.querySelector("img");
            const h1 = details.querySelector("h1");
            if (img) img.src = meal.thumbnail;
            if (h1) h1.textContent = meal.name;
        }

        const heroTagsContainer = document.getElementById("hero-tags");
        if (heroTagsContainer) {
            const categoryColor = CONFIG.CATEGORY_COLORS[meal.category] || "emerald";
            heroTagsContainer.innerHTML = `
                <span class="px-3 py-1 bg-${categoryColor}-500 text-white text-sm font-semibold rounded-full">${meal.category}</span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area}</span>
            `;
        }

        // Update ingredients
        if (details) {
            const ingredientsContainer = details.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.gap-3");
            if (ingredientsContainer) {
                ingredientsContainer.innerHTML = meal.ingredients.map(ing => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"/>
                        <span class="text-gray-700">
                            <span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}
                        </span>
                    </div>
                `).join('');
            }
        }

        // Update instructions
        if (details) {
            const instructionsContainer = details.querySelector(".space-y-4");
            if (instructionsContainer) {
                const steps = Array.isArray(meal.instructions) ? meal.instructions : meal.instructions.split('\n');
                instructionsContainer.innerHTML = steps
                    .filter(step => step.trim().length > 0)
                    .map((step, i) => `
                        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50">
                            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${i + 1}</div>
                            <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
                        </div>
                    `).join('');
            }
        }

        // Update YouTube video
        if (details) {
            const iframe = details.querySelector("iframe");
            if (iframe && meal.youtube) {
                iframe.src = `https://www.youtube.com/embed/${Utils.extractYouTubeID(meal.youtube)}`;
                iframe.style.display = "block";
            } else if (iframe) {
                iframe.style.display = "none";
            }
        }
        // Load nutrition data
        if (window.Nutrition) {
            window.Nutrition.analyzeAndDisplay(meal);
        }
    },
     // Show meals list (back from details)
    showMealsList() {
        const details = DOM.mealDetailsSection();
        const header = DOM.headerSection();
        const filters = DOM.searchFiltersSection();
        const recipes = DOM.allRecipesSection();
        const categoriesContainer = DOM.categoriesContainer();
        const areasContainer = DOM.areasContainer();
        const mealsContainer = DOM.mealsContainer();
        const categoriesSection = DOM.categoriesSection();

        if (details) details.style.display = "none";
        if (header) header.style.display = "block";
        if (filters) filters.style.display = "block";
        if (recipes) recipes.style.display = "block";
        if (categoriesContainer) categoriesContainer.style.display = "grid";
        if (areasContainer) areasContainer.style.display = "flex";
        if (mealsContainer) mealsContainer.style.display = "grid";

        if (categoriesSection) {
            const h2 = categoriesSection.querySelector("h2");
            const p = categoriesSection.querySelector("p");
            if (h2) h2.textContent = "Browse by Meal Type";
            if (p) p.textContent = "Find the perfect recipe for any time of day";
        }
    },

      // Initialize search functionality
    initializeSearch() {
        const searchInput = DOM.searchInput();
        if (!searchInput) return;

        const debouncedSearch = Utils.debounce((query) => {
            if (!query) {
                const firstCategory = document.querySelector(".category-card");
                if (firstCategory) firstCategory.click();
                return;
            }
            this.fetchMealsBySearch(query);
        }, 400);

        searchInput.addEventListener("input", (e) => debouncedSearch(e.target.value.trim()));
    }
};
window.Meals = Meals;