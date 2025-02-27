<script setup lang="ts">
import { RouterLink , RouterView } from 'vue-router';
</script>

<template>
    <div id="layout">
        <header>
            <div class="wrapper">
                <nav>
                    <RouterLink to="/">HOME</RouterLink>
                    <RouterLink to="/search">SEARCH</RouterLink>
                </nav>
            </div>
        </header>
    </div>
    <RouterView />
</template>

<style scoped>
nav {
    color: aquamarine;
}
</style>