<script setup lang="ts">
import { ref } from 'vue'
import Food from '@/type/Food'

defineProps<{
    food: Food
}>()

</script>

<template>
    <RouterLink class="food-link" :to="{ name: 'food-detail-view', params: { id: food.RecipeId }}">
        <div class="food-card">
            <img :src="food.Images" alt="Food Image" class="food-image" />
            <h1>{{ food.Name }}</h1>
        </div>
    </RouterLink>
</template>


<style scoped>
.food-class {
    padding: 20px;
    width: 250px;
    cursor: pointer;
    border: 1px solid black;
    margin-bottom: 18px;
    text-align: center;
}

.food-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 10px;
}
</style>
