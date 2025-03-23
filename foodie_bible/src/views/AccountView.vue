<script setup>
import { useRouter } from 'vue-router';
import { authService } from '@/service/authenService';
import { ref, onMounted } from 'vue';
import axios from 'axios'; 

const username = localStorage.getItem('username');
const userId = localStorage.getItem('user_id'); 
console.log("Username from localStorage:", username);  

const router = useRouter();
const folders = ref([]);
const selectedFolder = ref(null);
const recipesInSelectedFolder = ref([]);
const showPopup = ref(false); 
const showCreateFolderPopup = ref(false);
const popupMessage = ref('');
const actionType = ref('');
const actionData = ref(null);
const newFolderName = ref('');
const recommendedRecipes = ref([]);

// Function to open the folder creation popup
const openCreateFolderPopup = () => {
  showCreateFolderPopup.value = true;
};

// Function to open the popup
const cancelAction = () => {
  showPopup.value = false;
  showCreateFolderPopup.value = false;
};

const openPopup = (type, data) => {
  if (type === 'delete') {
    popupMessage.value = 'Are you sure you want to delete this folder?';
  } else if (type === 'remove') {
    popupMessage.value = 'Are you sure you want to remove this recipe from the folder?';
  }
  showPopup.value = true;
  actionType.value = type;
  actionData.value = data;
};

// Function to confirm the action
const confirmAction = async () => {
  if (actionType.value === 'delete') {
    await deleteFolder(actionData.value);
  } else if (actionType.value === 'remove') {
    await removeRecipe(actionData.value);
  }
  showPopup.value = false;
};

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('email');
  localStorage.removeItem('username');
  localStorage.removeItem('user_id');

  router.push('/');
};

const createFolder = async () => {
  if (!newFolderName.value.trim()) {
    alert("Folder name cannot be empty.");
    return;
  }

  try {
    await authService.createFolder(newFolderName.value);
    showCreateFolderPopup.value = false;
    fetchFolders();
    newFolderName.value = ''; 
  } catch (error) {
    console.error("Error creating folder:", error);
    // alert("Error creating folder. Please try again.");
  }
};

onMounted(() => {
  fetchFolders();
});

const fetchFolders = async () => {
    try {
        const response = await authService.getUserFolders(); 
        const folderData = response.data;  

        for (const folder of folderData) {
            const folderDetails = await authService.getUserFolderDetails(userId, folder.id);
            folder.recipeCount = folderDetails.data.Recipes.length;  
        }

        folders.value = folderData;  
    } catch (error) {
        console.error("Error fetching folders:", error);
        // alert("Error fetching folders.");
    }
};

const fetchFolderDetails = async (folderId) => {
    const userId = localStorage.getItem('user_id'); 
    if (!userId) {
        console.error("❌ User ID is missing.");
        return;
    }

    if (!folderId) {
        console.error("❌ Missing folder ID.");
        return;
    }

    try {
        const response = await authService.getUserFolderDetails(userId, folderId);
        console.log("📌 Fetched Folder Details:", response.data);

        if (!response.data || !response.data.FolderName || !Array.isArray(response.data.Recipes)) {
            throw new Error("❌ Invalid folder data received.");
        }

        selectedFolder.value = {
            FolderId: folderId,
            ...response.data
        };

        recipesInSelectedFolder.value = await Promise.all(
            response.data.Recipes.map(async (recipe) => {
                if (!recipe.RecipeId) {
                    console.warn("⚠️ Missing RecipeId:", recipe);
                    return { ...recipe, imageUrl: null, Rating: "No rating" };
                }

                const recipeData = await getRecipeDetails(recipe.RecipeId);
                return {
                    ...recipe,
                    imageUrl: recipeData?.image_link || null,
                    Rating: recipe.Rating || "No rating" 
                };
            })
        );

        recipesInSelectedFolder.value.sort((a, b) => {
            const ratingA = a.Rating === "No rating" ? 0 : a.Rating;
            const ratingB = b.Rating === "No rating" ? 0 : b.Rating;
            return ratingB - ratingA;  
        });

        console.log("✅ Recipes sorted by rating:", recipesInSelectedFolder.value);
    } catch (error) {
        console.error("❌ Error fetching folder details:", error);
        selectedFolder.value = null;
        recipesInSelectedFolder.value = [];
    }

     // recommendation after folder
     try {
        const recommendationResponse = await authService.getRecommendationsForFolder(folderId);
        recommendedRecipes.value = recommendationResponse.recommendations || [];
        console.log("🎯 Recommended Recipes:", recommendedRecipes.value);
    } catch (error) {
        console.warn("No recommendations available or failed to fetch.");
        recommendedRecipes.value = [];
    }
};


// Function to navigate to the FoodDetail page
const navigateToRecipe = (recipeId) => {
  router.push({ name: 'food-detail-view', params: { id: recipeId } });

};

const getRecipeDetails = async (recipeId) => {
    if (!recipeId) {
        console.warn("⚠️ Skipping recipe fetch: Missing RecipeId");
        return { Images: null };
    }

    try {
        const response = await axios.get(`http://127.0.0.1:5000/search/${recipeId}`);
        console.log(`📌 Recipe ${recipeId} details:`, response.data);

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            console.warn(`⚠️ No data found for RecipeId ${recipeId}`);
            return { Images: null };
        }

        return response.data.results[0];
    } catch (error) {
        console.error("❌ Error fetching recipe details:", error);
        return { Images: null };
    }
};

// Function for deleting a folder
const deleteFolder = async (folderId) => {
  try {
    await authService.deleteFolder(folderId);
    fetchFolders();  
    selectedFolder.value = null;
    recipesInSelectedFolder.value = [];
  } catch (error) {
    console.error("Error deleting folder:", error);
    alert("Error deleting folder. Please try again.");
  }
};

// Function to remove a recipe
const removeRecipe = async (recipeId) => {
  try {
    await authService.removeRecipeFromFolder(selectedFolder.value.FolderId, recipeId);
    fetchFolderDetails(selectedFolder.value.FolderId);  
  } catch (error) {
    console.error("Error removing recipe:", error);
    alert("Error removing recipe. Please try again.");
  }
};

const showRenameInput = ref(false);

const startRename = (folder) => {
  newFolderName.value = folder.FolderName;  
  showRenameInput.value = true;  
};

const updateFolderName = async () => {
  if (!newFolderName.value.trim()) {
    triggerToast("Folder name cannot be empty.");
    return;
  }

  try {
    await authService.updateFolderName(selectedFolder.value.FolderId, newFolderName.value);
    selectedFolder.value.FolderName = newFolderName.value;
    showRenameInput.value = false;

    triggerToast("✅ Folder name updated successfully!");

    fetchFolders(); 
  } catch (error) {
    console.error("Error updating folder name:", error);
    triggerToast("❌ Failed to update folder name.");
  }
};


const showToast = ref(false);

const toastMessage = ref(''); 
const triggerToast = (message) => {  
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};


</script>

<template>
  <div class="logout-section">
  <button @click="logout" class="logout-button">Logout</button>
  </div>


  <div class="account-container">
    <div class="header">
      <div class="username-section">
        <h1 class="name">Welcome, {{ username }}</h1>
      </div>
    </div>
    
    <!-- Create Folder Button -->
    <div class="folder-section">
      <button @click="openCreateFolderPopup" class="create-folder-button">Create Folder</button>
    </div>
  </div>

  <div class="line"></div>

  <!-- Display Folders -->
  <div class="folder-container">
    <h2>Your Folders</h2>
    <div v-if="folders.length === 0" class="empty-state">
      <p>No folders available.</p>
    </div>
    <div v-else class="folder-grid">
      <div v-for="folder in folders" :key="folder.id" @click="fetchFolderDetails(folder.id)" class="folder-card">
        <p class="folder-name"><span class="folder-name-text">{{ folder.name }}</span> - {{ folder.recipeCount }} Bookmarks</p>
    </div>

    </div>
  </div>

  <div v-if="selectedFolder" class="folder-detail">
    <h2>
      <!-- Folder Name -->
      <span v-if="!showRenameInput">{{ selectedFolder.FolderName }}</span>
      <!-- Editable Input -->
      <div v-if="showRenameInput" class="input-wrapper">
        <input 
          v-model="newFolderName" 
          type="text" 
          placeholder="New folder name" 
        />
        <!-- Save/Cancel Buttons when renaming -->
        <button @click="updateFolderName">Save</button>
        <button @click="cancelRename">Cancel</button>
      </div>
    </h2>

    <!-- Pencil Icon (for editing) -->
    <img 
      src="/img/pen.png" 
      alt="Edit"
      @click="startRename(selectedFolder)" 
      class="edit-icon" 
    />

    <!-- Delete Folder Button -->
    <button @click="openPopup('delete', selectedFolder?.FolderId)" class="delete-button">
      Delete Folder
    </button>
  </div>


   <!-- Display Recipes of the Selected Folder -->
  <div v-if="recipesInSelectedFolder.length > 0" class="recipe-section">
    <ul style="padding: 0%;">
      <li v-for="recipe in recipesInSelectedFolder" :key="recipe.RecipeId" class="recipe-card">
      <div class="recipe-content" @click="navigateToRecipe(recipe.RecipeId)">
        <div v-if="recipe.imageUrl" class="recipe-img">
          <img :src="recipe.imageUrl" alt="Recipe Image" />
        </div>
        <div v-else class="no-img">
          <p>No image available</p>
        </div>

        <div class="recipe-info">
          <p class="recipe-name">{{ recipe.RecipeName }}</p>
          <p class="recipe-rating">⭐ Rating: {{ recipe.Rating }}</p> <!-- ✅ แสดง Rating -->
        </div>
      </div>

      <div>
        <button @click="openPopup('remove', recipe.RecipeId)" class="remove-button">
          🗑 Remove
        </button>
      </div>
    </li>

    </ul>
  </div>

  <!-- Recommended Recipes Section -->
  <div v-if="recommendedRecipes.length > 0" class="recommendation-section">
    <h2>Recommended for You</h2>
    <ul>
      <li v-for="recipe in recommendedRecipes" :key="recipe.RecipeId" class="recipe-card">
        <div class="recipe-content" @click="navigateToRecipe(recipe.RecipeId)">
          <div v-if="recipe.image_link" class="recipe-img">
            <img :src="recipe.image_link" alt="Recipe Image" />
          </div>
          <div v-else class="no-img">
            <p>No image available</p>
          </div>
          <div class="recipe-info">
            <p class="recipe-name">{{ recipe.Name }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <!-- Confirmation Popup for Folder Creation -->
  <div v-if="showCreateFolderPopup" class="popup-overlay">
    <div class="popup">
      <h3>Create a new folder</h3>
      <input v-model="newFolderName" type="text" placeholder="Enter folder name" />
      <div class="popup-actions">
        <button @click="cancelAction" class="popup-cancel">Cancel</button>
        <button @click="createFolder" class="popup-confirm">OK</button>
      </div>
    </div>
  </div>

  <!-- Confirmation Popup -->
  <div v-if="showPopup" class="popup-overlay">
    <div class="popup">
      <h3>{{ popupMessage }}</h3>
      <div class="popup-actions">
        <button @click="cancelAction" class="popup-cancel">No</button>
        <button @click="confirmAction" class="popup-confirm">Yes</button>
      </div>
    </div>
  </div>

  <!-- ✅ Toast Notification -->
  <div v-if="showToast" class="toast-popup">
    {{ toastMessage }}
  </div>


</template>

<style scoped>
/* 🎨 Layout */
.account-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  background: #fffbe7;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.name {
  font-size: 26px;
  font-weight: 600;
  color: #2c1b10;
  margin: 0;
}

.profile-circle {
  width: 48px;
  height: 48px;
  background-color: #f3ca52;
  border-radius: 50%;
}

/* 🚪 Logout Button */
.logout-button {
  padding: 8px 14px;
  font-size: 12px;
  background-color: #333;
  color: white;
  border-radius: 6px;
  transition: 0.3s;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #555;
}


.logout-section {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  margin-top: 20px;
}


/* ✨ Buttons */
button {
  padding: 10px 20px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.create-folder-button,
.delete-button,
.remove-button {
  padding: 10px 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
}

.create-folder-button {
  background-color: #4CAF50;
  color: white;
}

.create-folder-button:hover {
  background-color: #45a049;
}

.delete-button,
.remove-button {
  background-color: #e74c3c;
  color: white;
}

.delete-button:hover,
.remove-button:hover {
  background-color: #c0392b;
}

/* 📂 Folder */
.folder-container {
  padding: 32px;
}

.folder-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
}

.folder-card {
  background-color: white;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  min-width: 200px;
  cursor: pointer;
  transition: transform 0.25s, background 0.3s;
}

.folder-card:hover {
  background-color: #fff1be;
  transform: scale(1.03);
}

.folder-name-text {
  color: #c0392b;
  font-weight: 600;
}

/* 📑 Folder Detail */
.folder-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  margin: 30px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.06);
}

.edit-icon {
  width: 22px;
  cursor: pointer;
}

/* ✍️ Rename */
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-wrapper input {
  padding: 6px 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.input-wrapper button {
  padding: 8px 14px;
  background: #4CAF50;
  color: white;
  border-radius: 6px;
}

.input-wrapper .cancel {
  background: #e74c3c;
}

/* 🍲 Recipe List */
.recipe-section ul {
  padding: 0 30px;
  list-style: none;
}

.recipe-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px;
  margin-bottom: 14px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: 0.25s ease;
}

.recipe-card:hover {
  background: #fff6d8;
  transform: scale(1.01);
}

.recipe-content {
  display: flex;
  gap: 20px;
  align-items: center;
  flex: 1;
}

.recipe-img img {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
}

.recipe-info {
  display: flex;
  flex-direction: column;
}

.recipe-name {
  font-size: 16px;
  font-weight: 600;
}

.recipe-rating {
  color: #f39c12;
  font-weight: 500;
  font-size: 14px;
  margin-top: 4px;
}

/* 🧩 Popup */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background: white;
  padding: 24px;
  border-radius: 14px;
  width: 300px;
  text-align: center;
  box-shadow: 0 10px 28px rgba(0,0,0,0.2);
}

.popup-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
}

.popup-confirm {
  background: #2ecc71;
  color: white;
}

.popup-cancel {
  background: #e74c3c;
  color: white;
}

.popup-confirm:hover {
  background: #27ae60;
}

.popup-cancel:hover {
  background: #c0392b;
}

/* 💡 Recommendation */
.recommendation-section {
  background: #f0faff;
  padding: 24px;
  margin: 40px;
  border-radius: 14px;
}

.recommendation-section h2 {
  margin-bottom: 20px;
  color: #2980b9;
  font-weight: 600;
}
.toast-popup {
  position: fixed;
  top: 20px;
  right: 30px;
  background: #333;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0%   { opacity: 0; transform: translateY(-10px); }
  10%  { opacity: 1; transform: translateY(0); }
  90%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-10px); }
}

</style>