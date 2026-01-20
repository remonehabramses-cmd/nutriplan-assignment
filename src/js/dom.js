// DOM element 

export const DOM = {
    headerSection: () => document.getElementById("header"),
    searchFiltersSection: () => document.getElementById("search-filters-section"),
    categoriesSection: () => document.getElementById("meal-categories-section"),
    allRecipesSection: () => document.getElementById("all-recipes-section"),
    mealDetailsSection: () => document.getElementById("meal-details"),
    productsSection: () => document.getElementById("products-section"),
    foodLogSection: () => document.getElementById("foodlog-section"),

    navMeals: () => document.getElementById("nav-meals"),
    navProducts: () => document.getElementById("nav-products"),
    navFoodLog: () => document.getElementById("nav-foodlog"),

    categoriesContainer: () => document.getElementById("categories-grid"),
    mealsContainer: () => document.getElementById("meals-container"),
    areasContainer: () => document.getElementById("areas-container"),
    productsGrid: () => document.getElementById("products-grid"),
    productCategories: () => document.getElementById("product-categories"),

    searchInput: () => document.getElementById("search-input"),
    productSearchInput: () => document.getElementById("product-search-input"),
    barcodeInput: () => document.getElementById("barcode-input"),

    recipesCount: () => document.getElementById("recipes-count"),
    productsCountText: () => document.getElementById("products-count")

    /*lw ast3mlna 
const header = document.getElementById("header"); //If HTML isn't loaded yet, this is null

// GOOD - Function gets element when called, HTML is loaded by then
const header = () => document.getElementById("header"); // Works! */
};