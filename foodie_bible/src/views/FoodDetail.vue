<script setup lang="ts">
import { ref, onMounted , computed } from 'vue';
import { useRoute } from 'vue-router';
import FoodService from '@/service/FoodService';
import { authService } from '@/service/authenService';
import Food from '@/type/Food';
import router from '@/router';

const route = useRoute();
const RecipeId = Number(route.params.id);  
const food = ref<Food | null>(null);
const isBookmarked = ref(false);
const showPopup = ref(false);  
const selectedFolderId = ref<number | null>(null);
const userFolders = ref<any[]>([]);

const ingredientList = computed(() => {
    if (!food.value) return [];
    const ingredients = food.value.RecipeIngredientParts.split(',');
    const quantities = food.value.RecipeIngredientQuantities.split(',');
    return ingredients.map((ingredient, index) => ({
        name: ingredient.trim(),
        quantity: quantities[index] ? quantities[index].trim() : ''
    }));
});

// Open Popup
const openBookmarkPopup = () => {
  checkLoginStatus();  
  showPopup.value = true;  
};


// Close Popup
const closePopup = () => {
    showPopup.value = false;
};

const rating = ref<number>(0);  // Store the user's rating

// Set rating when a star is clicked
const setRating = (star: number) => {
    rating.value = star;
};

const onImageError = () => {
    console.error("❌ Failed to load image:", food.value?.Images);
};

onMounted(() => {
    if (!RecipeId) {
        console.error("RecipeId is undefined or null!");
        return;
    }

    FoodService.getFood(RecipeId)
    .then((response) => {
        food.value = response.data.results[0];
        console.log('Fetched food:', food.value); 
        console.log('Image Link Type:', typeof food.value.Images);
        console.log('Image Link:', food.value.Images);

        const recipeId = food.value?.RecipeId;
        console.log('Sending RecipeId:', recipeId);
        if (!recipeId) {
            console.error("RecipeId is missing!");
            return;
        }
    })
    .catch((error) => {
        console.error('Error fetching food details:', error);
    });

    authService.getUserFolders()
        .then((response) => {
            userFolders.value = response.data;  
        })
        .catch((error) => {
            console.error('Error fetching folders:', error);
        });
});

const addOrRemoveBookmarkAndSubmitRating = async () => {
    if (!selectedFolderId.value) {
        alert("Please select a folder to save the bookmark.");
        return;
    }

    const recipeId = route.params.id;
    if (!recipeId) {
        console.error("RecipeId is missing!");
        return;
    }

    try {
        console.log("⭐ Submitting rating:", rating.value); 

        const response = await authService.addRecipeToFolder(
            selectedFolderId.value,
            recipeId,
            rating.value  
        );
        isBookmarked.value = true;
    } catch (error) {
        console.error("❌ Error adding bookmark or submitting rating:", error);
    }
    closePopup();
};

// Function to check if the user is logged in
const checkLoginStatus = () => {
  const isLoggedIn = !!localStorage.getItem('access_token');  
  if (!isLoggedIn) {
    router.push('/login');  
  }
};

</script>

<template>
       <div class="recipe-card" v-if="food">
        <div class="image-container">
            <img :src="food.image_link" alt="Recipe Image" @error="onImageError">
        </div>

        <div class="content">
            <div class="info"> 
                <span class="category">{{ food.RecipeCategory }}</span>
                <h1>{{ food.Name }}</h1>  
                <h3>By: {{ food.AuthorName }}</h3> 

                <!-- Bookmark button -->
                <button @click="openBookmarkPopup" class="bookmark-button">
                    {{ isBookmarked ? "Remove Bookmark" : "Add Bookmark" }}
                </button>

                <div class="line"></div>

                <div class="context">
                    <div class="meta">
                        <div class="time-info">
                            <p>Prep Time: {{ food.PrepTime }}</p>
                            <p>Cook Time: {{ food.CookTime }}</p>
                        </div>
                        <div class="space-between-box"></div>
                        <div class="extra-info">
                            <p>Serving: {{ food.RecipeServings }}</p>
                            <p>Yield: {{ food.RecipeYield }}</p>
                        </div>
                    </div>
                    <div class="calories">
                        <p>Calories:</p> 
                        <p>{{ food.Calories }}</p>
                    </div>
                </div>
            </div>

            <div class="line"></div>

            <div class="recipe-details">
                <div class="ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        <li v-for="(item, index) in ingredientList" :key="index">
                            {{ item.name }} - {{ item.quantity }}
                        </li>
                    </ul>
                </div>
                
                <div class="instructions">
                    <h3>Instructions</h3>
                    <ol>
                        <li v-for="(step, index) in food.RecipeInstructions.replace(/\.,/g, '.').split('.').filter(step => step.trim())" :key="index">
                            {{ step.trim() }}
                        </li>
                    </ol>
                </div>

            </div>
        </div>
    </div>

  <!-- Add Rating and Bookmark Section Inside the Popup -->
    <div v-if="showPopup" class="popup">
        <div class="popup-content">
            <h3>Select a Folder</h3>
            <select v-model="selectedFolderId">
                <option v-for="folder in userFolders" :key="folder.id" :value="folder.id">
                    {{ folder.name }}
                </option>
            </select>
            
            <!-- Rating Section -->
            <div class="rating-section">
                <h4>Rate this Recipe</h4>
                <div class="stars">
                    <span v-for="star in 5" :key="star" 
                        class="star"
                        :class="{ 'active': rating >= star }"
                        @click="setRating(star)">
                        ★
                    </span>
                </div>
            </div>
            
            <button @click="addOrRemoveBookmarkAndSubmitRating" class="popup-button">
                {{ isBookmarked ? "Remove Bookmark and Rating" : "Add Bookmark and Rating" }}
            </button>


            <button @click="closePopup" class="cancel-button">Cancel</button>
        </div>
    </div>

</template>


<style scoped>
.recipe-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-width: 900px;
    margin: auto;
}

.image-container img {
    width: 100%;
    border-radius: 10px;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.context {
    padding-top: 20px;
}

.meta {
    display: flex;
    align-items: flex-start;
}

.time-info p, .extra-info p {
    margin: 5px 0;
}
.space-between-box {
    width: 350px;
}

.category {
    background-color: #F3CA52;
    padding: 5px 10px;
    border-radius: 5px;
    font-weight: bold;
    display: block;
    text-align: center;
    color: rgb(53, 37, 37);
}

.extra-info {
    text-align: left;
}

.calories {
    display: flex;
    align-items: center;
    gap: 5px; 
}
.calories p {
    padding-top: 2px;
}

.recipe-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.ingredients, .instructions {
    width: 100%;
}
.ingredients ul, .instructions ol {
    padding-left: 20px;
}
h1, h3 {
    margin: 0;
}

.line {
    border-top: solid 2px black;
}

.bookmark-button {
    padding: 10px 20px;
    background-color: #F3CA52;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.bookmark-button:hover {
    background-color: #e0b342;
}

.bookmark-button:focus {
    outline: none;
}

/* Styles for the popup */
.popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.popup-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 400px;
}

.popup-button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.popup-button:hover {
    background-color: #45a049;
}

.cancel-button {
    padding: 10px 20px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.cancel-button:hover {
    background-color: #e53935;
}
.stars {
    display: inline-block;
    font-size: 24px;
    cursor: pointer;
}

.star {
    color: #ccc;
}

.star.active {
    color: #f39c12;
}

.popup-content h4 {
    margin-bottom: 10px;
}

</style>
