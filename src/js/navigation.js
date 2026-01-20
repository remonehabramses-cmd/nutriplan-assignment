import { DOM } from './dom.js';

export const Navigation = { //Handles switching between different pages/sections of the app.
    //m7tag amsa7 al mawgod w a3red goz2 goz2 
    hideAllSections() {
        const foodLog = DOM.foodLogSection();
        const header = DOM.headerSection();
        const filters = DOM.searchFiltersSection();
        const categories = DOM.categoriesSection();
        const recipes = DOM.allRecipesSection();
        const details = DOM.mealDetailsSection();
        const products = DOM.productsSection();
        
        //hide if exist .. 
        if (foodLog) foodLog.classList.add("hidden");
        if (header) header.style.display = "none";
        if (filters) filters.style.display = "none";
        if (categories) categories.style.display = "none";
        if (recipes) recipes.style.display = "none";
        if (details) details.style.display = "none";
        if (products) products.style.display = "none";
    },
    
    setActiveNav(activeLink) {
        if (!activeLink) return;
        
        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("bg-emerald-50", "text-emerald-700");
            link.classList.add("text-gray-600");
            
            const span = link.querySelector("span");
            if (span) span.className = "font-medium";
        });
        
        activeLink.classList.add("bg-emerald-50", "text-emerald-700");
        activeLink.classList.remove("text-gray-600");
        
        const span = activeLink.querySelector("span");
        if (span) span.className = "font-semibold";
    },
    
    
     // Show meals section
    showMeals() {
        this.hideAllSections();
        
        const header = DOM.headerSection();
        const filters = DOM.searchFiltersSection();
        const categories = DOM.categoriesSection();
        const recipes = DOM.allRecipesSection();
        const meals = DOM.mealsContainer();
        
        if (header) header.style.display = "block";
        if (filters) filters.style.display = "block";
        if (categories) categories.style.display = "block";
        if (recipes) recipes.style.display = "block";
        if (meals) meals.style.display = "grid";
        
        this.setActiveNav(DOM.navMeals());
    },
    
    
     // Show products section
 
    showProducts() {
        this.hideAllSections();
        
        const products = DOM.productsSection();
        if (products) products.style.display = "block";
        
        this.setActiveNav(DOM.navProducts());
    },
    
 
    // Show food log section
  
    showFoodLog() {
        this.hideAllSections();
        
        const foodLog = DOM.foodLogSection();
        if (foodLog) foodLog.classList.remove("hidden");
        
        this.setActiveNav(DOM.navFoodLog());
        
        // Render food log if available
        if (window.FoodLog) {
            window.FoodLog.render();
        }
    },
    
    /**
     * Initialize navigation event listeners
     */
    initialize() {
        const navMeals = DOM.navMeals();
        const navProducts = DOM.navProducts();
        const navFoodLog = DOM.navFoodLog();
        const backBtn = document.getElementById('back-to-meals-btn');
        
        if (navMeals) {
            navMeals.addEventListener("click", (e) => {
                e.preventDefault();
                this.showMeals();
            });
        }
        
        if (navProducts) {
            navProducts.addEventListener("click", (e) => {
                e.preventDefault();
                this.showProducts();
            });
        }
        
        if (navFoodLog) {
            navFoodLog.addEventListener("click", (e) => {
                e.preventDefault();
                this.showFoodLog();
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.Meals) {
                    window.Meals.showMealsList();
                }
            });
        }
    }
};