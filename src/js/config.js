// Application configuration and constants

export const CONFIG = {
    API_BASE: 'https://nutriplan-api.vercel.app/api',
    NUTRITION_API_KEY: 'udcFQfNZKt93grq0rSGV1sCzO5ScuCqBeoiqlfZl',
    
    CATEGORY_ICONS: { //put icons for every category 
        Beef: "fa-drumstick-bite",
        Chicken: "fa-bone",
        Dessert: "fa-ice-cream",
        Lamb: "fa-bone",
        Miscellaneous: "fa-cookie-bite",
        Pasta: "fa-bowl-food",
        Pork: "fa-bacon",
        Seafood: "fa-fish",
        Side: "fa-carrot",
        Starter: "fa-utensils",
        Vegan: "fa-carrot",
        Vegetarian: "fa-leaf",
        Breakfast: "fa-bread-slice",
        Goat: "fa-drumstick-bite"
    },
    
    CATEGORY_COLORS: { //category cards colors
        Beef: "red",
        Chicken: "yellow",
        Dessert: "pink",
        Lamb: "purple",
        Miscellaneous: "gray",
        Pasta: "orange",
        Pork: "rose",
        Seafood: "blue",
        Side: "indigo",
        Starter: "emerald",
        Vegan: "green",
        Vegetarian: "teal",
        Breakfast: "amber",
        Goat: "red"
    },
    
    NUTRI_SCORE_STYLES: { //background color and text of scores
        a: { bg: 'bg-emerald-500', text: 'Nutri-Score A' },
        b: { bg: 'bg-green-500', text: 'Nutri-Score B' },
        c: { bg: 'bg-yellow-400', text: 'Nutri-Score C' },
        d: { bg: 'bg-orange-500', text: 'Nutri-Score D' },
        e: { bg: 'bg-red-500', text: 'Nutri-Score E' }
    },
    
    NOVA_COLORS: { //Food processing colors
        1: 'bg-emerald-500',
        2: 'bg-yellow-500',
        3: 'bg-orange-500',
        4: 'bg-red-500'
    },
    
    PRODUCT_CATEGORY_ICONS: { //Icons for product categories
        snacks: "fa-cookie-bite",
        "sweet-snacks": "fa-ice-cream",
        beverages: "fa-glass-water",
        dairies: "fa-cheese",
        breakfast: "fa-bread-slice",
        desserts: "fa-ice-cream",
        plant: "fa-leaf",
        default: "fa-box"
    },
    
    PRODUCT_CATEGORY_COLORS: [ //Array of colors for product categories
        "emerald", "blue", "amber", "purple", 
        "rose", "indigo", "teal", "orange"
    ]
};