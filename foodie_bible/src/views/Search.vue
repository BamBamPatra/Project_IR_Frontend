<script setup lang="ts">
import { computed, ref } from 'vue';
import FoodService from '@/service/FoodService';
import FoodCard from '@/components/FoodCard.vue';
import Food from '@/type/Food';

const foods = ref<Food[] | null>(null);
const suggestions = ref<string[]>([]);
const query = ref('');
const loading = ref(false);
const selectedTags = ref<string[]>([]);

// Suggestions
const getSuggestions = async () => {
  if (!query.value.trim()) {
    suggestions.value = []; 
    return;
  }

  try {
    const response = await FoodService.getSuggestions(query.value);
    suggestions.value = Array.isArray(response.data.suggestions)
      ? response.data.suggestions
      : [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    suggestions.value = []; 
  }
};


const searchFoods = async () => {
  if (!query.value.trim()) return;
  loading.value = true;
  foods.value = null;

  try {
    const response = await FoodService.getFoods(query.value);
    console.log("📦 API Response:", response);
    console.log("📦 Search results:", response.data.results);

    foods.value = response.data.results.length > 0 ? response.data.results : null; 
  } catch (error) {
    console.error('❌ Error fetching foods:', error);
    foods.value = null;
  } finally {
    loading.value = false;
  }
};

const onSuggestionClick = (suggestion: string) => {
  query.value = suggestion; 
  searchFoods(); 
};

// Tags from RecipeCategory
const allTags = computed(() => {
  if (!foods.value) return [];
  const categories = foods.value.map(f => f.RecipeCategory?.trim()).filter(Boolean);
  return [...new Set(categories)];
});

// Filtering
const filteredFoods = computed(() => {
  if (!foods.value) return [];
  if (selectedTags.value.length === 0) return foods.value;

  return foods.value.filter(f =>
    selectedTags.value.includes(f.RecipeCategory?.trim())
  );
});
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
  
      <!-- Suggestions -->
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
  
      <!-- Loading -->
      <div v-if="loading" class="loading">Searching...</div>
  
      <!-- No search results at all -->
      <div v-else-if="foods === null" class="no-results">
        No results found. Try another search.
      </div>
  
      <!-- Filter + Display results -->
      <div v-else>
        <!-- Filter bar -->
        <div class="filter-bar">
          <label v-for="tag in allTags" :key="tag">
            <input type="checkbox" :value="tag" v-model="selectedTags" />
            {{ tag }}
          </label>
        </div>
  
        <!-- No results match filter -->
        <div v-if="filteredFoods.length === 0" class="no-results">
          No results match selected tags.
        </div>
  
        <!-- Results after filtering -->
        <div v-else class="foods">
          <FoodCard v-for="food in filteredFoods" :key="food.RecipeId" :food="food" />
        </div>
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
  padding: 10px 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.search-box:focus-within {
  box-shadow: 0px 4px 18px rgba(0, 0, 0, 0.25);
}

.search-box input {
  flex: 1;
  border: none;
  font-size: 18px;
  outline: none;
  padding: 10px;
}

.search-box button {
  background: transparent;
  border: none;
  cursor: pointer;
}

.search-box button img {
  width: 24px;
  height: 24px;
}

/* Suggestions list styling */
.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding: 0 16px;
  justify-content: center;
}

.suggestions-list ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
}

.suggestions-list li {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.suggestions-list li:hover {
  background-color: #f3ca52;
}

/* Filter bar styling */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 24px auto;
  padding: 0 20px;
  justify-content: center;
  max-width: 1000px;
}

.filter-bar label {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 25px;
  border: 1.5px solid #ccc;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.filter-bar label:hover {
  background-color: #fff2d6;
  border-color: #f3ca52;
}

.filter-bar input[type="checkbox"] {
  appearance: none;
  margin-right: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #999;
  transition: all 0.2s;
  position: relative;
}

.filter-bar input[type="checkbox"]:checked {
  background-color: #f3ca52;
  border-color: #e0a700;
}

.filter-bar input[type="checkbox"]::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 6px;
  height: 6px;
  background-color: white;
  border-radius: 50%;
  display: none;
}

.filter-bar input[type="checkbox"]:checked::after {
  display: block;
}

/* Food card */
.foods {
  column-count: 3;
  column-gap: 16px;
  padding: 20px;
}

.food-card {
  display: inline-block;
  width: 100%;
  margin-bottom: 16px;
}

/* States */
.loading {
  margin-top: 20px;
}

.no-results {
  padding: 20px;
  color: #603F26;
  font-size: 18px;
  text-align: center;
}

</style>