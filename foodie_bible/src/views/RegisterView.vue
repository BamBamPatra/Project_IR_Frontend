<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/service/authenService';

const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

async function signUp() {
  if (password.value !== confirmPassword.value) {
    alert("Passwords don't match!");
    return;
  }

  try {
    const response = await authService.register({
      username: username.value,
      email: email.value,
      password: password.value
    });

    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      router.push("/dashboard");  
    } else {
      router.push("/login");  
    }
  } catch (error) {
    alert("Registration failed: " + (error.response?.data?.message || error.message));
  }
}
</script>

<template>
  <div class="login-container">
    <div class="image-section">
      <img src="/img/Register.jpg" alt="Image" />
    </div>

    <div class="form-section">
      <h1>Create an Account</h1>
      <form @submit.prevent="signUp">
        <input v-model="username" type="text" placeholder="Username" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
        <button type="submit">Sign Up</button>

        <div class="footer">
          <p>Already have an account? <router-link to="/login">Log In</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'Arial', sans-serif;
  }
  
  .image-section {
    flex: 0.4;
    padding: 20px;
  }
  
  .image-section img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50px;
  }
  
  .form-section {
    flex: 0.6;
    display: flex;
    flex-direction: column;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
  }
  
  h1 {
    font-size: 28px;
    color: #333;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  input {
    padding: 10px;
    margin: 10px 0;
    border: none;
    border-bottom: 2px solid #ddd;
    font-size: 16px;
    width: 100%;
    box-sizing: border-box;
  }
  
  input:focus {
    outline: none;
    border-bottom: 2px solid #333;
  }
  
  button {
    padding: 15px;
    background-color: #333;
    color: white;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    width: 100%;
    box-sizing: border-box;
  }
  
  button:hover {
    background-color: #555;
  }
  
  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: #777;
  }
  
  .footer a {
    color: #555;
    text-decoration: none;
  }
  
  .footer a:hover {
    text-decoration: underline;
  }
  </style>
  