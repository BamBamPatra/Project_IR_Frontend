<script setup lang="ts">
import { ref } from 'vue';
import Food from '@/type/Food';

defineProps<{
    food: Food
}>();
</script>

<template>
    <RouterLink 
    class="food-card" 
    :to="{ name: 'food-detail-view', params: { id: food.RecipeId } }">
    <div class="card">
      <img :src="food.image_link" alt="Food Image" class="card-img" />
      <div class="card-content">
        <h2 class="title">{{ food.Name }}</h2>
        <span v-if="food.RecipeCategory" class="tag">{{ food.RecipeCategory }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
h1 {
    text-decoration: none;
    color: #603F26;
    text-align: center;
}

.food-card {
  text-decoration: none;
  color: inherit;
  width: 300px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.food-card:hover {
  transform: translateY(-5px);
}

.card-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 16px;
  text-align: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #603F26;
  margin-bottom: 10px;
}

.tag {
  font-size: 14px;
  color: #d67e00;
  background-color: #fff4d3;
  border: 1px solid #f3ca52;
  padding: 5px 10px;
  border-radius: 20px;
}

.food-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 10px;
}

.food-link {
    text-decoration: none;
    color: inherit;
    display: block;
}

.category {
    border: solid 2px #FFB200;
    border-radius: 20px; 
    padding: 0px 15px; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    text-align: center;
    font-size: 14px;
    margin: 10px auto; 
    width: fit-content;
}
</style>
