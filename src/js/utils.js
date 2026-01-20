import { CONFIG } from './config.js';

export const Utils = {
    getCategoryClasses(name) {
        const color = CONFIG.CATEGORY_COLORS[name] || "gray";
        return {
            bg: `bg-${color}-50 hover:bg-${color}-100 active:bg-${color}-100`,
            border: `border-${color}-200 hover:border-${color}-400 active:border-${color}-500`,
            text: `text-${color}-600`,
            icon: `text-${color}-600 bg-${color}-100`
        };
    },
    
    extractYouTubeID(url) {
        const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        return match && match[2].length === 11 ? match[2] : '';
    },
    
    getInstructionPreview(instructions, maxLength = 120) { //ly haredha gowa al card 
        if (!instructions) return "Click to view full recipe instructions.";
        
        const steps = Array.isArray(instructions) 
            ? instructions 
            : instructions.split(/\r?\n|\. /);
            
        const firstStep = steps.find(step => step.trim().length > 0);
        if (!firstStep) return "Delicious recipe to try!";
        
        const preview = firstStep.trim();
        return preview.length > maxLength 
            ? preview.slice(0, maxLength) + "..." 
            : preview + (preview.endsWith('.') ? '' : '...');
    },
  
    hideLoadingOverlay() { //hides splash screen wahda wahda 
        const overlay = document.getElementById("app-loading-overlay");
        if (!overlay) return;
        
        overlay.style.transition = "opacity 0.2s ease";
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
        setTimeout(() => overlay.remove(), 400);
    },
    
  
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },
  
    showToast(message, type = 'success') {
        const colors = {
            success: 'bg-emerald-600',
            error: 'bg-red-600',
            info: 'bg-blue-600'
        };
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `fixed bottom-8 right-8 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg z-[10000] flex items-center gap-3`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type]} text-xl"></i>
            <span class="font-semibold">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};