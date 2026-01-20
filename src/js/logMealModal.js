import { Utils } from './utils.js';
import { Navigation } from './navigation.js';
 //log meal card 
export const LogMealModal = {
    servings: 1,
    currentMeal: null,
    currentNutrition: null,

     // Open the log meal modal
    open(meal, nutrition) {
        this.currentMeal = meal;
        this.currentNutrition = nutrition;
        this.servings = 1;

        const modal = document.getElementById('log-meal-modal');
        if (!modal) {
            alert('Modal not found. Please check your HTML.');
            return;
        }
        const img = document.getElementById('modal-meal-img');
        const name = document.getElementById('modal-meal-name');
        
        if (img) img.src = meal.thumbnail;
        if (name) name.textContent = meal.name;

        this.updateDisplay();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    },

  
     // Update card display with current servings
     
    updateDisplay() {
        const servingInput = document.getElementById('serving-input');
        if (servingInput) {
            servingInput.value = this.servings % 1 === 0 
                ? this.servings 
                : this.servings.toFixed(1);
        }

        if (!this.currentNutrition?.data) return;
        const { perServing } = this.currentNutrition.data;
        const multiplier = this.servings;
        const updates = {
            'modal-cal': Math.round(perServing.calories * multiplier),
            'modal-protein': Math.round(perServing.protein * multiplier) + 'g',
            'modal-carbs': Math.round(perServing.carbs * multiplier) + 'g',
            'modal-fat': Math.round(perServing.fat * multiplier) + 'g'
        };

        Object.entries(updates).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    },

     // Close the card
    close() {
        const modal = document.getElementById('log-meal-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        document.body.style.overflow = '';
    },

     // Change servings by delta

    changeServings(delta) {
        this.servings += delta;
        if (this.servings < 0.5) this.servings = 0.5;
        this.updateDisplay();
    },
     // Save meal to food log
    save() {
        if (!this.currentMeal || !this.currentNutrition) return;
        const { perServing } = this.currentNutrition.data;
        const entry = {
            id: Date.now(),
            meal: this.currentMeal,
            servings: this.servings,
            timestamp: new Date().toISOString(),
            nutrition: {
                calories: Math.round(perServing.calories * this.servings),
                protein: Math.round(perServing.protein * this.servings),
                carbs: Math.round(perServing.carbs * this.servings),
                fat: Math.round(perServing.fat * this.servings)
            }
        };

        const log = JSON.parse(localStorage.getItem('foodLog') || '[]');
        log.push(entry);
        localStorage.setItem('foodLog', JSON.stringify(log));

        this.close();
        Utils.showToast('Meal logged successfully!');
        Navigation.showFoodLog();
    }
};

window.LogMealModal = LogMealModal;
window.updateModalServings = (delta) => LogMealModal.changeServings(delta);
window.confirmMealLog = () => LogMealModal.save();
window.closeLogModal = () => LogMealModal.close();