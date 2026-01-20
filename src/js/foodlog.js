export const FoodLog = {
    goals: {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 65
    },
    render() {
        this.updateDate();
        const log = JSON.parse(localStorage.getItem('foodLog') || '[]');
        const today = new Date().toDateString();
        const todayEntries = log.filter(entry => 
            new Date(entry.timestamp).toDateString() === today
        );

        this.updateNutritionSummary(todayEntries);
        this.renderLoggedItems(todayEntries);
        this.renderWeeklyCalendar(log);
        this.updateWeeklyStats(log);
    },
    updateDate() {
        const dateEl = document.getElementById('foodlog-date');
        if (dateEl) {
            const today = new Date();
            const options = { weekday: 'long', month: 'short', day: 'numeric' };
            dateEl.textContent = today.toLocaleDateString('en-US', options);
        }
    },
    updateNutritionSummary(entries) {
        const totals = entries.reduce((acc, entry) => ({
            calories: acc.calories + (entry.nutrition.calories || 0),
            protein: acc.protein + (entry.nutrition.protein || 0),
            carbs: acc.carbs + (entry.nutrition.carbs || 0),
            fat: acc.fat + (entry.nutrition.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        this.updateNutrientProgress('calories', totals.calories, this.goals.calories);
        this.updateNutrientProgress('protein', totals.protein, this.goals.protein);
        this.updateNutrientProgress('carbs', totals.carbs, this.goals.carbs);
        this.updateNutrientProgress('fat', totals.fat, this.goals.fat);
    },
    updateNutrientProgress(nutrient, current, goal) {
        const percentage = Math.min(Math.round((current / goal) * 100), 100);
        
        const percentageEl = document.getElementById(`${nutrient}-percentage`);
        if (percentageEl) percentageEl.textContent = `${percentage}%`;

        const progressBar = document.getElementById(`${nutrient}-progress-bar`);
        if (progressBar) progressBar.style.width = `${percentage}%`;

        const currentEl = document.getElementById(`${nutrient}-current`);
        if (currentEl) {
            const unit = nutrient === 'calories' ? ' kcal' : ' g';
            currentEl.textContent = Math.round(current) + unit;
        }
    },

    renderLoggedItems(entries) {
        const container = document.getElementById('logged-items-list');
        const clearBtn = document.getElementById('clear-foodlog');
        const countEl = document.getElementById('logged-items-count');

        if (!container) return;
        if (countEl) {
            countEl.textContent = `Logged Items (${entries.length})`;
        }
        if (clearBtn) {
            clearBtn.style.display = entries.length > 0 ? 'flex' : 'none';
        }
        if (entries.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fa-solid fa-utensils text-5xl mb-3"></i>
                    <p class="font-medium text-gray-600">No meals logged today</p>
                    <p class="text-sm">Add meals from the Meals page</p>
                </div>`;
            return;
        }
        container.innerHTML = entries.map(entry => {
            const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });

            return `
                <div class="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                    <img src="${entry.meal.thumbnail}" 
                         alt="${entry.meal.name}" 
                         class="w-16 h-16 rounded-lg object-cover flex-shrink-0">
                    
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-gray-900 mb-1 truncate">${entry.meal.name}</h5>
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <span class="font-medium">${entry.servings} serving${entry.servings !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">Recipe</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">${time}</p>
                    </div>
                    
                    <div class="text-right flex-shrink-0">
                        <p class="text-2xl font-bold text-emerald-600">${entry.nutrition.calories}</p>
                        <p class="text-xs text-gray-500 mb-2">kcal</p>
                        <div class="flex items-center gap-3 text-xs text-gray-600">
                            <span class="font-medium">${entry.nutrition.protein}g P</span>
                            <span class="font-medium">${entry.nutrition.carbs}g C</span>
                            <span class="font-medium">${entry.nutrition.fat}g F</span>
                        </div>
                    </div>
                    
                    <button onclick="FoodLog.deleteEntry(${entry.id})" 
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                </div>
            `;
        }).join('');
    },
    renderWeeklyCalendar(allEntries) {
        const container = document.getElementById('weekly-calendar');
        if (!container) return;

        const today = new Date();
        const currentDay = today.getDay();
        
        const startOfWeek = new Date(today);
        const dayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        startOfWeek.setDate(today.getDate() + dayOffset);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        container.innerHTML = days.map((dayName, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            
            const dayNumber = date.getDate();
            const isToday = date.toDateString() === today.toDateString();
            
            const dayEntries = allEntries.filter(entry => 
                new Date(entry.timestamp).toDateString() === date.toDateString()
            );
            
            const dayCalories = dayEntries.reduce((sum, entry) => 
                sum + (entry.nutrition.calories || 0), 0
            );
            const itemCount = dayEntries.length;

            return `
                <div class="text-center p-4 rounded-xl ${isToday ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-white border border-gray-100'}">
                    <p class="text-xs text-gray-500 mb-1">${dayName}</p>
                    <p class="text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-900'} mb-2">${dayNumber}</p>
                    <p class="text-xl font-bold ${dayCalories > 0 ? 'text-emerald-600' : 'text-gray-300'} mb-1">
                        ${dayCalories || '0'}
                    </p>
                    <p class="text-xs ${dayCalories > 0 ? 'text-gray-500' : 'text-gray-300'}">kcal</p>
                    ${itemCount > 0 ? `<p class="text-xs text-gray-400 mt-1">${itemCount} item${itemCount !== 1 ? 's' : ''}</p>` : ''}
                </div>
            `;
        }).join('');
    },
    updateWeeklyStats(allEntries) {
        const today = new Date();
        const currentDay = today.getDay();
        const startOfWeek = new Date(today);
        const dayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        startOfWeek.setDate(today.getDate() + dayOffset);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const weekEntries = allEntries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startOfWeek && entryDate < endOfWeek;
        });

        const totalCalories = weekEntries.reduce((sum, entry) => 
            sum + (entry.nutrition.calories || 0), 0
        );
        const daysWithEntries = new Set(
            weekEntries.map(entry => new Date(entry.timestamp).toDateString())
        ).size;
        
        const avgCalories = Math.round(totalCalories / 7);

        const weeklyAvgEl = document.getElementById('weekly-avg');
        if (weeklyAvgEl) weeklyAvgEl.textContent = `${avgCalories} kcal`;

        const weeklyItemsEl = document.getElementById('weekly-items');
        if (weeklyItemsEl) {
            weeklyItemsEl.textContent = `${weekEntries.length} item${weekEntries.length !== 1 ? 's' : ''}`;
        }

        const daysOnGoalEl = document.getElementById('days-on-goal');
        if (daysOnGoalEl) daysOnGoalEl.textContent = `${daysWithEntries} / 7`;
    },
    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this meal?')) {
            let log = JSON.parse(localStorage.getItem('foodLog') || '[]');
            log = log.filter(entry => entry.id !== id);
            localStorage.setItem('foodLog', JSON.stringify(log));
            this.render();
        }
    },
    clearAll() {
        if (confirm('Are you sure you want to clear all logged meals for today?')) {
            const log = JSON.parse(localStorage.getItem('foodLog') || '[]');
            const today = new Date().toDateString();
            const filtered = log.filter(entry => 
                new Date(entry.timestamp).toDateString() !== today
            );
            localStorage.setItem('foodLog', JSON.stringify(filtered));
            this.render();
        }
    }
};
window.FoodLog = FoodLog;