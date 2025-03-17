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
            <img :src="food.image_link" alt="Food Image" class="food-image" />
            <h1>{{ food.Name }}</h1>
            <div class="category">
                <p>{{ food.RecipeCategory }}</p>
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
    border: solid 5px rgb(187, 4, 4);
    margin: 10px;
    padding: 10px;
    width: 100%; 
    max-width: 300px; 
    border-radius: 8px; 
    background-color: white;
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
