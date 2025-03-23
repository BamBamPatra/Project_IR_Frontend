import axios from 'axios';

const authApiClient = axios.create({
    baseURL: 'http://127.0.0.1:5001',
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

// Function to get the stored access token
const getAccessToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No token found. Please log in again.');
    }
    return token;
}

// AuthService
export const authService = {
    register: async (data) => {
        try {
            const response = await authApiClient.post('/register', data);
            localStorage.setItem("username", data.username);
            localStorage.setItem("email", data.email);
            return response;
        } catch (error) {
            console.error("Registration failed:", error.response?.data);
            throw error;
        }
    },

    login: async (email, password) => { 
        try {
            const response = await authApiClient.post('/login', {
                email,
                password
            });
            // Save user info to localStorage
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("email", email);
            localStorage.setItem("user_id", response.data.user_id);  // Store user_id upon successful login
            localStorage.setItem("access_token", response.data.access_token); // Store access token as well
            console.log("User logged in. User ID: ", response.data.user_id); // Debug log
            return response.data;
        } catch (error) {
            console.error("Login failed:", error.response?.data);
            throw new Error(error.response?.data.message || 'Login failed');
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('email');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        console.log("User logged out");
    },

    createFolder: async (folderName) => {
        try {
            const response = await authApiClient.post('/folder', { name: folderName }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error creating folder:", error);
            throw new Error("Error creating folder");
        }
    },

    deleteFolder: async (folderId) => {
        try {
            const token = localStorage.getItem('access_token'); 
            if (!token) throw new Error("No access token found");
    
            const response = await authApiClient.delete(`/folder/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`  // ✅ ตรวจสอบ Header
                }
            });
            return response;
        } catch (error) {
            console.error("Error deleting folder:", error.response?.data);
            throw new Error("Error deleting folder.");
        }
    },

    getUserFolders: async () => {
        try {
            // Ensure the token is being correctly passed in the headers
            const token = getAccessToken();  
            const response = await authApiClient.get('/folders', {
                headers: {
                    Authorization: `Bearer ${token}`  
                }
            });
            return response;
        } catch (error) {
            console.error("Error fetching folders:", error);
            throw new Error("Error fetching folders.");
        }
    },

    addRecipeToFolder: async (folderId, recipeId, rating) => {
        try {
            if (!recipeId) {
                throw new Error("Recipe ID is required");
            }
            if (!folderId) {
                throw new Error("Folder ID is required");
            }
    
            const token = getAccessToken();
    
            const payload = { RecipeId: recipeId, rating: rating }; // ✅ ส่ง Rating ไปด้วย
            console.log("📤 Sending payload:", payload);  // Debug ตรวจสอบ Payload
    
            const response = await authApiClient.post(`/folder/${folderId}/add_recipe`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            if (response.status === 200) {
                console.log("✅ Recipe added to folder successfully with rating!");
            }
    
            return response;
        } catch (error) {
            console.error("❌ Error adding recipe to folder:", error.response?.data || error.message);
            throw new Error("Error adding recipe to folder.");
        }
    },
    

    // Remove recipe from folder
    removeRecipeFromFolder: async (folderId, recipeId) => {
        try {
            const token = getAccessToken(); // ดึง token จาก localStorage
    
            const response = await authApiClient.delete(`/folder/${folderId}/remove_recipe/${recipeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            console.log(`✅ Recipe ${recipeId} removed from folder ${folderId} successfully.`);
            return response;
        } catch (error) {
            console.error("❌ Error removing recipe from folder:", error.response?.data || error.message);
            throw new Error("Error removing recipe from folder.");
        }
    },
    

    getUserFolderDetails: async (userId, folderId) => {
        // Ensure user_id is passed correctly or retrieved from localStorage
        const storedUserId = userId || localStorage.getItem('user_id');
        console.log("User ID retrieved:", storedUserId); // Add this log to check if user_id is being correctly retrieved
    
        if (!storedUserId) {
            throw new Error('User ID is missing. Please log in again.');
        }
    
        try {
            const response = await authApiClient.get(`/user/${storedUserId}/folders/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error fetching folder details:", error);
            throw new Error("Error fetching folder details.");
        }
    },
    // Add this method in the authService file
    updateFolderName: async (folderId, newFolderName) => {
        try {
            const token = localStorage.getItem('access_token'); 
            if (!token) throw new Error("No access token found");

            // Send a request to update the folder name
            const response = await authApiClient.put(`/folder/${folderId}`, 
                { name: newFolderName }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            return response; 
        } catch (error) {
            console.error("Error updating folder name:", error.response?.data || error.message);
            throw new Error("Error updating folder name.");
        }
    },
    getRecommendationsForFolder: async (folderId) => {
        try {
            const response = await authApiClient.get(`/recommend/folder/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching recommendations:", error);
            throw error;
        }
    },
    getAllFolderRecommendations: async (userId) => {
        const folders = await authService.getUserFolders();
        const allRecs = [];
    
        for (const folder of folders.data) {
        try {
            const res = await authApiClient.get(`/recommend/folder/${folder.id}`);
            allRecs.push(...res.data.recommendations);
        } catch (e) {
            console.warn(`No recs for folder ${folder.id}`);
        }
        }
        return allRecs.sort(() => 0.5 - Math.random()).slice(0, 30); 
    }
};

export default authService;
