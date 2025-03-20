<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FoodService from '@/service/FoodService';
import FoodCard from '@/components/FoodCard.vue';
import Food from '@/type/Food';

const foods = ref<Food[]>([]);
const hasRefreshed = localStorage.getItem('hasRefreshed');

onMounted(() => {
  if (!hasRefreshed) {
    localStorage.setItem('hasRefreshed', 'true');
    window.location.reload();
  } else {
    FoodService.getFoods()
      .then((response) => {
        foods.value = response.data.results;
      })
      .catch((error) => {
        console.error('There was an error!', error);
      });

    localStorage.removeItem('hasRefreshed');
  }
});
</script>

<template>
  <div class="foods">
    <FoodCard v-for="food in foods" :key="food.RecipeId" :food="food" />
  </div>
</template>

<style scoped>
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
</style>
