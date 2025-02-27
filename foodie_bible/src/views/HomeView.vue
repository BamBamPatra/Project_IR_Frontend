<script setup lang="ts">
import FoodCard from '@/components/FoodCard.vue';
import Food from '@/type/Food'
import { ref , onMounted } from 'vue'
import axios from 'axios';
import FoodService from '@/service/FoodService';

const foods = ref<Food[]>(null)

onMounted(() => {
   FoodService.getFoods()
        .then((response) => {
            console.log(response.data.results);
            foods.value = response.data.results;
        })
        .catch((error) => {
            console.error('There was an error!' , error)
        })

})

</script>

<template>
    <div class="foods">
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