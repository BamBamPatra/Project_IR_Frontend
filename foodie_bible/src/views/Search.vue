<script setup lang="ts">
import FoodCard from '@/components/FoodCard.vue';
import Food from '@/type/Food';
import { ref } from 'vue';
import FoodService from '@/service/FoodService';

const foods = ref<Food[] | null>(null);
const query = ref('');

const searchFoods = async () => {
    try {
        const response = await FoodService.getFoods(query.value);
        console.log(response.data.results);
        foods.value = response.data.results.length > 0 ? response.data.results : null; 
    } catch (error) {
        console.error('There was an error!', error);
    }
};
</script>

<template>
    <div class="search">
        <input v-model="query" type="text" placeholder="Search for food..." />
        <button @click="searchFoods">SEARCH</button>
    </div>

    <div v-if="foods" class="foods">
        <FoodCard v-for="food in foods" :key="food.RecipeId" :food="food" />
    </div>
</template>

<style scoped>
.foods {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
