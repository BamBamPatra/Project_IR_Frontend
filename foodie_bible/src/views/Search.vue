<script setup lang="ts">
import { ref } from 'vue';
import FoodService from '@/service/FoodService';
import FoodCard from '@/components/FoodCard.vue';
import Food from '@/type/Food';

const foods = ref<Food[] | null>(null);
const query = ref('');
const loading = ref(false);

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
</script>


<template>
    <div class="search-container" :class="{ 'search-active': foods }">
        <h1>Foodie bible</h1>
        <div class="search-box">
            <input 
                v-model="query" 
                @keyup.enter="searchFoods" 
                type="text" 
                placeholder="Search for food..."
            />
            <button @click="searchFoods">
                <img src="/img/search.png" alt="Search" />
            </button>
        </div>

        <div v-if="loading" class="loading">Searching...</div>

        <div v-if="foods && foods.length > 0" class="foods">
            <FoodCard v-for="food in foods" :key="food.RecipeId" :food="food"  />
        </div>

        <div v-else-if="!loading && foods === null" class="no-results">
            No results found. Try another search.
        </div>
    </div>
</template>


<style scoped>
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

.search-active {
    justify-content: flex-start;  
    padding-top: 20px;  
}

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

.loading {
    margin-top: 20px;
}

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

.no-results {
    padding: 15px;
}

</style>
