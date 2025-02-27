<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <div id="layout">
        <aside class="sidebar">
            <nav>
                <RouterLink to="/">
                    <img src="/img/user.png" alt="Account" class="nav-icon" />
                </RouterLink>
                <RouterLink to="/">
                    <img src="/img/home.png" alt="Home" class="nav-icon" />
                </RouterLink>
                <RouterLink to="/search">
                    <img src="/img/search.png" alt="Search" class="nav-icon" />
                </RouterLink>
            </nav>
        </aside>
        <main class="content">
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
/* Layout */
#layout {
    display: flex;
    height: 100vh; 
}

/* Left Sidebar */
.sidebar {
    width: 80px; 
    height: 100vh; 
    position: fixed; 
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
}

/* Icon Sidebar */
nav {
    display: flex;
    flex-direction: column; 
    align-items: center;
    gap: 20px; 
}

.nav-icon {
    width: 40px;
    height: 40px;
    transition: transform 0.2s;
}

.nav-icon:hover {
    transform: scale(1.1);
}

/* Right Content */
.content {
    flex: 1; 
    margin-left: 80px; 
    padding: 20px;
    overflow-y: auto; 
    height: 100vh;
   
}
</style>
