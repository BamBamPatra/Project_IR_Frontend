<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FoodCard from '@/components/FoodCard.vue';
import Food from '@/type/Food';
import { useRouter } from 'vue-router';
import { authService } from '@/service/authenService';
import FoodService from '@/service/FoodService';

const foods = ref<Food[]>([]);
const folders = ref([]);
const isLoggedIn = ref(!!localStorage.getItem('access_token'));
const router = useRouter();
const isDropdownOpen = ref(false);
const message = ref('');  // New message variable to show the user

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const getRandomFoods = (foodsArray: Food[], numberOfItems: number = 5): Food[] => {
  let shuffled = foodsArray.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numberOfItems);  
};

onMounted(() => {
  const init = async () => {
    const userId = localStorage.getItem('user_id');
    const hasRefreshed = localStorage.getItem('hasRefreshed');

    if (!hasRefreshed) {
      localStorage.setItem('hasRefreshed', 'true');
      window.location.reload(); 
    } else {
      try {
        if (isLoggedIn.value && userId) {
          // ✅ Load user folders for the navbar (but not for the food page)
          const folderRes = await authService.getUserFolders();
          folders.value = folderRes.data;

          // ✅ Load all foods, then randomize the selection
          const res = await FoodService.getFoods();
          const randomFoods = getRandomFoods(res.data.results, 100);  
          foods.value = randomFoods;
        } else {
          // If not logged in, fetch all foods and randomize the selection
          const res = await FoodService.getFoods();
          const randomFoods = getRandomFoods(res.data.results, 100);  
          foods.value = randomFoods;
        }
      } catch (error) {
        console.error('❌ Failed to load foods:', error);
      }

      // Remove the refresh flag after the reload has completed
      localStorage.removeItem('hasRefreshed');
    }
  };

  init();
});

const loadRecommendations = async () => {
  const userId = localStorage.getItem('user_id');
  if (!userId) return;

  try {
    const recs = await authService.getAllFolderRecommendations(userId);
    foods.value = recs;
  } catch (error) {
    console.error("❌ Failed to load recommendations:", error);
  }
};
const goToHome = async () => {
  await router.push('/');
  const res = await FoodService.getFoods();
  const randomFoods = getRandomFoods(res.data.results, 100);  
  foods.value = randomFoods;
};

</script>


<template>
  <nav v-if="isLoggedIn" class="navbar">
    <div class="nav-left">
      <span class="nav-title" @click="goToHome">🍽️ Foodie Bible</span>
    </div>

    <div class="nav-right" v-if="isLoggedIn">
      <router-link to="#" class="nav-link" @click.prevent="loadRecommendations">Recommendation</router-link>

      <div class="dropdown">
        <span class="nav-link" @click="toggleDropdown">Bookmark ⌄</span>
        <div class="dropdown-content" v-show="isDropdownOpen">
          <router-link
            v-for="folder in folders"
            :key="folder.id"
            :to="`/bookmark/${folder.id}`"
            class="dropdown-item"
          >
            {{ folder.name }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>

  <div v-if="message" class="no-folders-message">
    <p>{{ message }}</p>
  </div>

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

/* --- NAVBAR STYLING --- */
.navbar {
  background: #f3ca52;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.nav-title {
  font-weight: bold;
  font-size: 24px;
  color: black;
  text-decoration: none; /* ✅ remove underline */
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-title:hover {
  color: #7a4e1d;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: black;
  text-decoration: none; /* ✅ remove underline */
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #7a4e1d;
}

/* --- DROPDOWN STYLING --- */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  position: absolute;
  background-color: white;
  min-width: 160px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: none;
}

.dropdown-content {
  display: block;
}

.dropdown-item {
  padding: 10px 14px;
  display: block;
  text-decoration: none;
  color: black;
  font-size: 15px;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f9f3e5;
  color: #7a4e1d;
}

/* --- MESSAGE SECTION --- */
.no-folders-message {
  text-align: center;
  font-size: 18px;
  color: red;
  padding: 20px;
  background-color: #f7d7d7;
  border-radius: 8px;
  margin: 16px;
}

</style>
