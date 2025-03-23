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
    alert("Error creating folder. Please try again.");
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
        alert("Error fetching folders.");
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
    alert("Folder name cannot be empty.");
    return;
  }

  try {
    const response = await authService.updateFolderName(selectedFolder.value.FolderId, newFolderName.value);
    selectedFolder.value.FolderName = newFolderName.value;  
    showRenameInput.value = false; 
    alert("Folder name updated successfully!");

    router.push({ name: router.currentRoute.name, params: router.currentRoute.params, query: router.currentRoute.query });
    window.location.reload();
  } catch (error) {
    console.error("Error updating folder name:", error);
    alert("Failed to update folder name. Please try again.");
  }
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
      <div class="profile-section">
        <div class="profile-circle"></div>
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

</template>

<style scoped>
/* Container for account section */
.account-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px;
  position: relative;
  padding-right: 50px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-end;
}

/* Username section */
.username-section {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

/* User name style */
.name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* Profile section */
.profile-section {
  display: flex;
  align-items: center;
}

/* Profile image circle */
.profile-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #F3CA52;
  margin-left: 10px;
}

/* Logout button */
.logout-button {
  height: 30px;
  font-size: 10px;
  position: absolute;
  top: 10px;
  right: 20px;
  margin-right: 20px;
}

/* Logout section margin */
.logout-section {
  margin-bottom: 20px;
}

/* Generic button style */
button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #555;
}

/* Line separator */
.line {
  border-top: solid 2px black;
  width: 90%;
  margin: 0 auto;
  margin-top: 10px;
}

/* Folder section */
.folder-section {
  margin-top: 20px;
}

/* Create folder button */
.create-folder-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.create-folder-button:hover {
  background-color: #45a049;
}

/* Recipe section */
.recipe-section {
  margin-top: 20px;
}

.recipe-section ul {
  list-style-type: none;
}

.recipe-section p {
  font-size: 16px;
  color: #555;
}

/* Folder container */
.folder-container {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
}

/* Grid for folders */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 10px;
}

/* Folder card */
.folder-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.folder-card:hover {
  background: #f3ca52;
  transform: scale(1.05);
}

/* Folder detail */
.folder-detail {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Recipe card */
.recipe-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  width: 100%;
  cursor: pointer;
}

.recipe-card:hover {
  background: #f3ca52;
  transform: scale(1.00);
}

/* Recipe content */
.recipe-content {
  display: flex;
  width: 100%;
  justify-content: flex-start;
}

/* Recipe name */
.recipe-name {
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  text-align: left;
  margin-right: auto;
  padding-left: 30px;
}

.recipe-name:hover {
  color: #f39c12;
}

/* Recipe image */
.recipe-img img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.recipe-img {
  margin-left: 15px;
}

/* No image placeholder */
.no-img {
  font-size: 12px;
  color: gray;
  text-align: center;
}

/* Delete and remove buttons */
.delete-button,
.remove-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

.remove-button {
  margin-right: 15px;
}

.remove-button:hover,
.delete-button:hover {
  background-color: #c0392b;
}

/* Popup overlay */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Popup content */
.popup {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  text-align: center;
}

/* Popup actions */
.popup-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.popup-confirm,
.popup-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 45%;
}

.popup-confirm {
  background-color: #4CAF50;
  color: white;
}

.popup-cancel {
  background-color: #e74c3c;
  color: white;
}

.popup-confirm:hover {
  background-color: #45a049;
}

.popup-cancel:hover {
  background-color: #c0392b;
}

/* Input wrapper for forms */
.input-wrapper {
  display: flex;
  align-items: center;
}

.input-wrapper input {
  margin-right: 10px;
  padding: 5px 10px;
  font-size: 16px;
  border-radius: 5px;
}

.input-wrapper button {
  margin-left: 5px;
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.input-wrapper button.cancel {
  background-color: #e74c3c;
}

.input-wrapper button.cancel:hover,
.input-wrapper button.save:hover {
  background-color: #45a049;
}

/* Edit icon */
.edit-icon {
  cursor: pointer;
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

/* Folder name text */
.folder-name-text {
  color: rgb(156, 7, 7);
}

/* Recipe info section */
.recipe-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
}

/* Recipe rating */
.recipe-rating {
  font-size: 14px;
  color: #f39c12;
  font-weight: bold;
  margin-top: 5px;
}

/* Recommendation section */
.recommendation-section {
  margin-top: 30px;
  background: #f0f9ff;
  padding: 20px;
  border-radius: 10px;
}

.recommendation-section h2 {
  margin-bottom: 15px;
  color: #2c3e50;
}
</style>