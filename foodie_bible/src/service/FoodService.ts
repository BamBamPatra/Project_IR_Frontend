import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

export default {
    // Fetch all foods, or perform search if query is provided
    getFoods(query: string = '') {
        return apiClient.get(`/search`, {
            params: { query }  
        });
    },

    // Get food by specific ID
    getFood(id: number) {
        return apiClient.get(`/search/${id}`); 
    },

    // Fetch suggestions (if needed)
    getSuggestions(query: string) {
        return apiClient.get(`/suggest`, {
            params: { query }
        });
    }
};
