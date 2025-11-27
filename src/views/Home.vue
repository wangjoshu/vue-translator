<template>
    <TranslationForm />
</template>

<script setup>
import TranslationForm from '@/components/TranslationForm.vue';
</script>

<style scoped>
* {
    width: 60%;
    margin: 0 auto;
    overflow-x: hidden;
}

/* 当屏幕宽度小于等于 600px 时（手机屏幕） */
@media (max-width: 600px) {
    * {
        width: 100% !important;
        margin: 0 auto;
        overflow-x: hidden;
    }
}
</style>