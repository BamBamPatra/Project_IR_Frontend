<script setup lang="ts">
import { ref } from 'vue';
import FoodService from '@/service/FoodService';
import FoodCard from '@/components/FoodCard.vue';
import Food from '@/type/Food';

const foods = ref<Food[] | null>(null);
const suggestions = ref<string[]>([]);
const query = ref('');
const loading = ref(false);

// Function to fetch suggestions based on the user's input
const getSuggestions = async () => {
  if (!query.value.trim()) {
    suggestions.value = []; 
    return;
  }

  try {
    const response = await FoodService.getSuggestions(query.value);

    // Ensure response.data.suggestions exists and is an array
    if (response.data && Array.isArray(response.data.suggestions)) {
      suggestions.value = response.data.suggestions; // Update suggestions
    } else {
      suggestions.value = []; 
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    suggestions.value = []; 
  }
};

// Search function to fetch foods based on the query
const searchFoods = async () => {
    if (!query.value.trim()) return;
    loading.value = true;
    foods.value = null;

    try {
        const response = await FoodService.getFoods(query.value);
        foods.value = response.data.results.length > 0 ? response.data.results : null; 
    } catch (error) {
        console.error('Error fetching foods:', error);
        foods.value = null;
    } finally {
        loading.value = false;
    }
};

// Function to handle click on suggestion
const onSuggestionClick = (suggestion: string) => {
    query.value = suggestion; 
    searchFoods(); 
};
</script>

<template>
    <div class="search-container" :class="{ 'search-active': foods }">
        <h1>Foodie bible</h1>
        <div class="search-box">
            <input 
                v-model="query" 
                @keyup="getSuggestions"  
                @keyup.enter="searchFoods" 
                type="text" 
                placeholder="Search for food..."
            />
            <button @click="searchFoods">
                <img src="/img/search.png" alt="Search" />
            </button>
        </div>

        <!-- Display Suggestions Below the Search Box -->
        <div v-if="suggestions.length > 0" class="suggestions-list">
            <ul>
                <li v-for="(suggestion, index) in suggestions" :key="index" @click="onSuggestionClick(suggestion)">
                    {{ suggestion }}
                </li>
            </ul>
        </div>
        <div v-else>
            <p>No suggestions available</p>
        </div>

        <div v-if="loading" class="loading">Searching...</div>

        <div v-if="foods && foods.length > 0" class="foods">
            <FoodCard v-for="food in foods" :key="food.RecipeId" :food="food" />
        </div>

        <div v-else-if="!loading && foods === null" class="no-results">
            No results found. Try another search.
        </div>
    </div>
</template>

<style scoped>
/* Container for search */
.search-container {
    background-color: #F6E9B2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
    transition: padding 0.5s ease-in-out, justify-content 0.5s ease-in-out;
}

/* Active state for search */
.search-active {
    justify-content: flex-start;
    padding-top: 20px;
}

/* Search box styling */
.search-box {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    background: white;
    border-radius: 50px;
    padding: 10px 15px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.5s ease-in-out;
}

.search-box:focus-within {
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}

/* Input inside the search box */
.search-box input {
    flex: 1;
    border: none;
    font-size: 18px;
    outline: none;
    padding: 10px;
}

/* Button inside the search box */
.search-box button {
    background: transparent;
    border: none;
    cursor: pointer;
}

/* Icon inside the search button */
.search-box button img {
    width: 24px;
    height: 24px;
}

/* Loading state */
.loading {
    margin-top: 20px;
}

/* Food card styling */
.food-card {
    display: inline-block;
    width: 100%;
    margin-bottom: 16px;
}

/* Display foods in columns */
.foods {
    column-count: 3;
    column-gap: 16px;
    padding: 20px;
}

/* No results message styling */
.no-results {
    padding: 15px;
}

/* Suggestions list styling */
.suggestions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 5px;
    padding: 0;
}

.suggestions-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
}

.suggestions-list li {
    padding: 5px 10px;
    cursor: pointer;
    background-color: #f4f4f4;
    border-radius: 20px;
}
</style>