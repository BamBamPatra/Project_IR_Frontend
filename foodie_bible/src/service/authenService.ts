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
            const response = await authApiClient.get('/folders', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error fetching folders:", error);
            throw new Error("Error fetching folders.");
        }
    },

    // Add recipe to folder
    addRecipeToFolder: async (folderId, recipeId) => {
        try {
            // ตรวจสอบว่า recipeId และ folderId มีค่าหรือไม่
            if (!recipeId) {
                throw new Error("Recipe ID is required");
            }
            if (!folderId) {
                throw new Error("Folder ID is required");
            }
    
            // Get the access token
            const token = getAccessToken();
    
            // สร้าง Payload สำหรับคำขอ
            const payload = { RecipeId: recipeId };
    
            // ทำการส่ง POST request
            const response = await authApiClient.post(`/folder/${folderId}/add_recipe`, 
                { RecipeId: recipeId },  // ตรวจสอบว่าค่าของ recipeId ถูกส่งไปถูกต้อง
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            
    
            // แสดงข้อมูลที่ส่งไปเพื่อให้แน่ใจว่า RecipeId ถูกส่งไปถูกต้อง
            console.log("Sending payload:", payload);
    
            // ตรวจสอบคำตอบจาก API และส่งคืนข้อมูลที่ได้
            if (response.status === 200) {
                console.log("Recipe added to folder successfully!");
            }
    
            return response; // ส่งค่าผลลัพธ์จาก API กลับไป
        } catch (error) {
            // จัดการข้อผิดพลาดที่เกิดขึ้นจาก API หรือการรับค่าผิดพลาด
            console.error("Error adding recipe to folder:", error.response?.data || error.message);
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
    }
};

export default authService;
