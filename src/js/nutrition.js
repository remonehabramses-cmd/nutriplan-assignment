import { CONFIG } from './config.js';

export const Nutrition = {
    currentMeal: null,
    currentNutrition: null,
    //Formats ingredients for API to be send
    prepareIngredientsPayload(meal) {
        if (!meal.ingredients || !Array.isArray(meal.ingredients)) return [];
        return meal.ingredients
            .filter(ing => ing.ingredient && ing.measure)
            .map(ing => `${ing.measure.trim()} ${ing.ingredient.trim()}`);
    },
    //Fetch nutrition data from API
    async fetchNutritionData(meal) {
        const ingredients = this.prepareIngredientsPayload(meal);
        if (ingredients.length === 0) {
            throw new Error('No ingredients available');
        }
        const response = await fetch('https://nutriplan-api.vercel.app/api/nutrition/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.NUTRITION_API_KEY
            },
            body: JSON.stringify({ ingredients })
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    },
    // Calculate percentage of daily value
    calculatePercentage(nutrient, value) {
        const dailyValues = {
            protein: 50,
            carbs: 300,
            fat: 70,
            fiber: 28,
            sugar: 50,
            saturatedFat: 20
        };
        return Math.min(Math.round((value / (dailyValues[nutrient] || 100)) * 100), 100);
    },
    // Update nutrition UI with data
    updateNutritionUI(nutritionData) {
        const s = nutritionData.data.perServing;
        const caloriesVal = document.getElementById('calories-val');
        const totalCal = document.getElementById('total-calories');
        if (caloriesVal) caloriesVal.textContent = Math.round(s.calories);
        if (totalCal) totalCal.textContent = `Total: ${Math.round(nutritionData.data.totals.calories)} cal`;
        
        const nutrients = [
            { id: 'protein', val: s.protein, color: 'protein' },
            { id: 'carbs', val: s.carbs, color: 'carbs' },
            { id: 'fat', val: s.fat, color: 'fat' },
            { id: 'fiber', val: s.fiber, color: 'fiber' },
            { id: 'sugar', val: s.sugar, color: 'sugar' },
            { id: 'satfat', val: s.saturatedFat, color: 'saturatedFat' }
        ];
        nutrients.forEach(n => {
            const val = Math.round(n.val);
            const valEl = document.getElementById(`${n.id}-val`);
            const barEl = document.getElementById(`${n.id}-bar`);
            
            if (valEl) valEl.textContent = `${val}g`;
            if (barEl) barEl.style.width = `${this.calculatePercentage(n.color, val)}%`;
        });
        
        const cholesterol = document.getElementById('cholesterol-val');
        const sodium = document.getElementById('sodium-val');
        if (cholesterol) cholesterol.textContent = `${Math.round(s.cholesterol)}mg`;
        if (sodium) sodium.textContent = `${Math.round(s.sodium)}mg`;
    },
    
    // Show loading state
    showNutritionLoading() {
        const container = document.getElementById('nutrition-facts-container');
        if (!container) return;  
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-3"></div>
                <p class="text-gray-500 text-sm">Analyzing nutrition...</p>
            </div>`;
    },
    
    // Show error state
    showNutritionError() {
        const container = document.getElementById('nutrition-facts-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
                <p class="text-gray-700 font-medium mb-2">Unable to load nutrition data</p>
                <p class="text-gray-500 text-sm">Please try again later</p>
            </div>`;
    },
    
    async analyzeAndDisplay(meal) {
        try {
            this.currentMeal = meal;
            this.showNutritionLoading();
            this.currentNutrition = await this.fetchNutritionData(meal);
            this.restoreNutritionHTML();
            this.updateNutritionUI(this.currentNutrition);
            this.attachLogButton();
        } catch (error) {
            console.error('Nutrition analysis error:', error);
            this.showNutritionError();
        }
    },
    
    attachLogButton() {
        setTimeout(() => {
            const btn = document.getElementById('log-meal-btn');
            if (!btn) {
                console.warn('Log meal button not found');
                return;
            }
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Log meal button clicked!', this.currentMeal?.name);
                
                if (this.currentMeal && this.currentNutrition) {
                    if (window.LogMealModal) {
                        window.LogMealModal.open(this.currentMeal, this.currentNutrition);
                    } else {
                        console.error('LogMealModal not found on window');
                        alert('Error: Meal logger not initialized');
                    }
                } else {
                    console.warn('Missing data:', { 
                        meal: !!this.currentMeal, 
                        nutrition: !!this.currentNutrition 
                    });
                    alert('Please wait for nutrition data to load');
                }
            });
        }, 200);
    },
    restoreNutritionHTML() {
        const container = document.getElementById('nutrition-facts-container');
        if (!container) return;
        
        container.innerHTML = `
            <p class="text-sm text-gray-500 mb-4">Per serving</p>
            <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                <p class="text-sm text-gray-600">Calories per serving</p>
                <p id="calories-val" class="text-4xl font-bold text-emerald-600">--</p>
                <p id="total-calories" class="text-xs text-gray-500 mt-1">Total: -- cal</p>
            </div>
            <div class="space-y-4">
                ${this._createRow('Protein', 'protein', 'emerald')}
                ${this._createRow('Carbs', 'carbs', 'blue')}
                ${this._createRow('Fat', 'fat', 'purple')}
                ${this._createRow('Fiber', 'fiber', 'orange')}
                ${this._createRow('Sugar', 'sugar', 'red')}
                ${this._createRow('Saturated Fat', 'satfat', 'pink')}
            </div>
            <div class="border-t border-gray-200 my-4"></div>
            <h6 class="text-xs font-semibold text-gray-500 uppercase mb-3">Other Nutrients</h6>
            <div class="grid grid-cols-2 gap-4 text-sm mb-6">
                <div class="flex justify-between">
                    <span class="text-gray-600">Cholesterol</span>
                    <span id="cholesterol-val" class="font-bold text-gray-900">0mg</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Sodium</span>
                    <span id="sodium-val" class="font-bold text-gray-900">0mg</span>
                </div>
            </div>
            <button id="log-meal-btn" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <i class="fa-solid fa-plus-circle"></i>
                Log This Meal
            </button>`;
    },
    _createRow(label, id, color) {
        return `
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-${color}-500"></div>
                    <span class="text-gray-700">${label}</span>
                </div>
                <span id="${id}-val" class="font-bold text-gray-900">0g</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div id="${id}-bar" class="bg-${color}-500 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>`;
    }
};

window.Nutrition = Nutrition;