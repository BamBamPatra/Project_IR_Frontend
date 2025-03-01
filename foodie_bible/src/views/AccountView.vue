<script setup>
import { useRouter } from 'vue-router';

const username = localStorage.getItem('username');
console.log("Username from localStorage:", username);  

const router = useRouter();

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('email');
  localStorage.removeItem('username');
  localStorage.removeItem('user_id');

  // Redirect to login page
  router.push('/');
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
    </div>

    <div class="line"></div>
</template>

<style scoped>
.account-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end; 
  padding: 20px;
  position: relative;
  padding-right: 50px;
}

.header {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-end; 
}

.username-section {
  display: flex;
  align-items: center;  
  margin-right: 10px; 
}

.name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.profile-section {
  display: flex;
  align-items: center;
}

.profile-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #F3CA52; 
  margin-left: 10px; 
}

.logout-button {
  height: 30px;
  font-size: 10px;
  position: absolute; 
  top: 10px; 
  right: 20px; 
  margin-right: 20px;
}

.logout-section {
  margin-bottom: 20px;
}

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

.line {
    border-top: solid 2px black;
    width: 90%;
    margin: 0 auto; 
    margin-top: 10px;
}
</style>
