import axios from "axios";

const authApiClient = axios.create({
    baseURL: 'http://127.0.0.1:5001',
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

export const authService = { 
    register: async (data) => {  // Receiving the full data object
        try {
          console.log("Sending registration request:", data);
          const response = await authApiClient.post('/register', data);  
          console.log("Registration successful:", response.data);

          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);  

          return response;
        } catch (error: any) {
          console.error("Registration failed:", error.response?.data);
          throw error;
        }
    },

    login: async (email: string, password: string) => { 
        try {
            const response = await authApiClient.post('/login', {
                email,
                password
            });
        
            // Save username and email to localStorage after login
            localStorage.setItem("username", response.data.username);  // Corrected: Get username from response
            localStorage.setItem("email", email);
        
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
    }
};

