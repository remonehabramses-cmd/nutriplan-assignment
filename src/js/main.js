import { Utils } from './utils.js';
import { Navigation } from './navigation.js';
import { LogMealModal } from './logMealModal.js';
import { FoodLog } from './foodlog.js';
import { Meals } from './meals.js';
import { Products } from './products.js';
import { Nutrition } from './nutrition.js';

const App = {
    
    async initialize() {
        const startTime = Date.now();
        
        try {
            window.LogMealModal = LogMealModal;
            window.FoodLog = FoodLog;
            window.Meals = Meals;
            window.Nutrition = Nutrition;
            
            console.log(' Global modules loaded:', { LogMealModal, FoodLog, Meals, Nutrition });
            Navigation.initialize();
            
            Meals.initializeSearch();
            Products.initializeProductSearch();
            Products.initializeNutriScoreFilter();
            
            await Promise.allSettled([
                Meals.loadCategories(),
                Meals.loadAreas(),
                Products.loadProductCategories()
            ]);
            
            this.initializeFoodLogClearButton();
            const elapsed = Date.now() - startTime;
            const minLoadTime = 1200;
            setTimeout(() => Utils.hideLoadingOverlay(), Math.max(0, minLoadTime - elapsed));
            
        } catch (err) {
            console.error('App initialization error:', err);
            Utils.hideLoadingOverlay();
        }
    },
    
    initializeFoodLogClearButton() {
        const clearBtn = document.getElementById('clear-foodlog');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => FoodLog.clearAll());
        }
    }
};
window.addEventListener('DOMContentLoaded', () => App.initialize());