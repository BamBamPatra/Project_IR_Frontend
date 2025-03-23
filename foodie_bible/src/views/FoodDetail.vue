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
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  max-width: 900px;
  margin: 40px auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.image-container img {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  max-height: 400px;
}

.content {
  margin-top: 24px;
}

.category {
  background-color: #f3ca52;
  color: #4d3600;
  display: inline-block;
  padding: 6px 16px;
  border-radius: 30px;
  font-weight: 600;
  margin: 10px 0;
}

h1 {
  font-size: 28px;
  color: #2c1b10;
  margin: 8px 0;
}

h3 {
  font-weight: 500;
  color: #555;
  margin-bottom: 10px;
}

.line {
  border-top: 1.5px solid #ddd;
  margin: 20px 0;
}

.bookmark-button {
  background-color: #f3ca52;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
  width: fit-content;
}

.bookmark-button:hover {
  background-color: #e0a700;
}

.context {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  font-size: 15px;
}

.meta {
  display: flex;
  gap: 60px;
}

.calories {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #555;
}

.recipe-details {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-top: 30px;
}

.ingredients, .instructions {
  flex: 1;
}

.ingredients ul,
.instructions ol {
  padding-left: 20px;
  line-height: 1.6;
}

.ingredients li::marker,
.instructions li::marker {
  color: #f3ca52;
}

.popup {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.popup-content h3,
.popup-content h4 {
  margin: 0;
  font-weight: 600;
}

select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.popup-button,
.cancel-button {
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: 0.3s;
}

.popup-button {
  background-color: #4CAF50;
  color: white;
}

.popup-button:hover {
  background-color: #3f9c42;
}

.cancel-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #c0392b;
}

.stars {
  display: flex;
  gap: 6px;
  font-size: 24px;
}

.star {
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}

.star.active {
  color: #f39c12;
}

</style>
