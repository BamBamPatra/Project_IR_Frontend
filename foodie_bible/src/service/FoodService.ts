import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
})

export default {
    getFoods(query: string = '') {
        return apiClient.get(`/search${query ? `?query=${query}` : ''}`);
    },
    getFood(id: number){
        return apiClient.get('/search/' + id)
    }
}