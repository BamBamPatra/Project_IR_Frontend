<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FoodService from '@/service/FoodService'
import Food from '@/type/Food'

const route = useRoute();
const RecipeId = Number(route.params.id);  // แปลงเป็นตัวเลข
const food = ref<Food | null>(null);

onMounted(() => {
    console.log("RecipeId from route params:", RecipeId);

    if (!RecipeId) {
        console.error("RecipeId is undefined or null!");
        return;
    }

    FoodService.getFood(RecipeId)
        .then((response) => {
            console.log(response.data);
            food.value = response.data.recipe;
        })
        .catch((error) => {
            console.error('There was an error!', error);
        });
});


</script>

<template>
    <div v-if="food">
        <h1>{{ food?.Name }}</h1>
        <p>{{ food?.Description }}</p>
    </div>
</template>