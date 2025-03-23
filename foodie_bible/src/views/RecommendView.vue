<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 
import FoodCard from '@/components/FoodCard.vue';
import { authService } from '@/service/authenService';
import Food from '@/type/Food';
import FoodService from '@/service/FoodService';

const route = useRoute();
const router = useRouter();
const folderId = ref(route.params.id as string);  
const folderRecs = ref<Food[]>([]);
const folderName = ref(''); 
const isDropdownOpen = ref(false); 

const foods = ref<Food[]>([]);
const isLoggedIn = ref(!!localStorage.getItem('access_token'));
const folders = ref([]);

// Toggle dropdown visibility
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Watch for changes in folderId and fetch new data
watch(
  () => route.params.id, 
  async (newFolderId) => {
    folderId.value = newFolderId as string;
    await fetchFolderRecommendations(); 
    await fetchFolderName(); 
  },
  { immediate: true } 
);

// Fetch folder recommendations based on folderId
const fetchFolderRecommendations = async () => {
  try {
    const recs = await authService.getRecommendationsForFolder(folderId.value);
    folderRecs.value = recs.recommendations || [];
  } catch (error) {
    console.error('Failed to load folder recommendations:', error);
  }
};

// Fetch folder name based on folderId
const fetchFolderName = async () => {
  try {
    const folderDetails = await authService.getUserFolderDetails(localStorage.getItem('user_id'), folderId.value);
    folderName.value = folderDetails.data.FolderName;  
  } catch (error) {
    console.error('Failed to fetch folder name:', error);
  }
};

// On component mounted, fetch data
onMounted(async () => {
  const userId = localStorage.getItem('user_id');
  const hasRefreshed = localStorage.getItem('hasRefreshed');
  
  if (!hasRefreshed) {
    localStorage.setItem('hasRefreshed', 'true');
    window.location.reload();
  } else {
    try {
      if (isLoggedIn.value && userId) {
        const folderRes = await authService.getUserFolders();
        folders.value = folderRes.data;

        await fetchFolderRecommendations();
        await fetchFolderName(); // Fetch folder name on mount
      } else {
        const res = await FoodService.getFoods();
        foods.value = res.data.results;
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
    }

    localStorage.removeItem('hasRefreshed');
  }
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
</script>

<template>
  <!-- Navbar -->
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="nav-title">🍽️ Foodie Bible</router-link>

    </div>

    <div class="nav-right" v-if="isLoggedIn">
    <router-link to="#" class="nav-link" @click.prevent="loadRecommendations">Recommendation</router-link>

      <!-- Dropdown for Bookmark Folders -->
      <div class="dropdown">
        <span class="nav-link" @click="toggleDropdown">Bookmark ⌄</span>
        <!-- Use v-show to toggle visibility of dropdown content -->
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

  <!-- Folder Recommendations Section -->
  <h2>Folder: {{ folderName }}</h2> 
  <div class="foods">
    <FoodCard v-for="food in folderRecs" :key="food.RecipeId" :food="food" />
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

.navbar {
  background: #f3ca52;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
}

.nav-title {
  font-weight: bold;
  font-size: 24px;
  color: black;
  text-decoration: none; 
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
  text-decoration: none; 
  font-size: 16px;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #7a4e1d;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: white;
  min-width: 160px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  z-index: 1000;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-item {
  padding: 10px 14px;
  display: block;
  text-decoration: none; 
  color: black;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f9f3e5;
  color: #7a4e1d;
}

</style>
